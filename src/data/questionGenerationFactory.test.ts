import { describe, expect, it } from "vitest";
import {
  createGenerationJob,
  runGenerationJob,
  sampleCoverageTargets,
  validateGenerationJob
} from "./questionGenerationFactory";

describe("question generation factory", () => {
  it("creates deterministic draft questions inside admin-only controls", async () => {
    const job = createGenerationJob({
      idempotencyKey: "m5-6-deterministic",
      targets: sampleCoverageTargets,
      config: { budgetCapCents: 0, perQuestionCostCapCents: 0, batchQuestionLimit: 4 }
    });

    expect(validateGenerationJob(job).errors).toEqual([]);
    const result = await runGenerationJob(job);

    expect(result.job.status).toBe("completed");
    expect(result.drafts).toHaveLength(2);
    expect(result.drafts.every((draft) => draft.reviewStatus === "draft")).toBe(true);
    expect(result.drafts.every((draft) => draft.sourceUrl.startsWith("https://learn.microsoft.com/"))).toBe(true);
    expect(result.drafts.every((draft) => draft.criticNotes.some((note) => note.includes("Main Admin review")))).toBe(true);
  });

  it("quarantines jobs when kill switch, production flag, or source limits are unsafe", async () => {
    const job = createGenerationJob({
      idempotencyKey: "m5-6-unsafe",
      targets: sampleCoverageTargets,
      config: { productionEnabled: true, killSwitchEnabled: true, maxSourceChunks: 1, batchQuestionLimit: 1 }
    });
    const result = await runGenerationJob(job);

    expect(result.job.status).toBe("quarantined");
    expect(result.job.quarantineReasons).toContain("production-generation-disabled-until-configured");
    expect(result.job.quarantineReasons).toContain("generation-kill-switch-enabled");
    expect(result.job.quarantineReasons).toContain("max-source-chunks-exceeded");
    expect(result.job.quarantineReasons).toContain("batch-question-limit-exceeded");
    expect(result.drafts).toEqual([]);
  });

  it("blocks under-budget jobs and supports cancellation before execution", async () => {
    const underBudget = createGenerationJob({
      idempotencyKey: "m5-6-under-budget",
      targets: sampleCoverageTargets,
      config: { budgetCapCents: 1, perQuestionCostCapCents: 1, batchQuestionLimit: 4 }
    });

    expect(validateGenerationJob(underBudget).errors).toContain("budget-cap-too-low");

    const cancelled = { ...underBudget, cancellationRequested: true };
    const result = await runGenerationJob(cancelled);

    expect(result.job.status).toBe("cancelled");
    expect(result.drafts).toEqual([]);
  });
});
