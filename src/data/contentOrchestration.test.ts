import { describe, expect, it } from "vitest";
import {
  createContentOrchestrationWorkflow,
  runContentOrchestrationWorkflow,
  validateContentOrchestrationWorkflow
} from "./contentOrchestration";

describe("content orchestration workflow", () => {
  it("creates every required graph-based orchestration node", () => {
    const workflow = createContentOrchestrationWorkflow({ idempotencyKey: "m5-6a-workflow" });

    expect(validateContentOrchestrationWorkflow(workflow).errors).toEqual([]);
    expect(workflow.nodes.map((node) => node.type)).toEqual([
      "COVERAGE_PLANNING",
      "SOURCE_RESOLUTION",
      "QUESTION_GENERATION",
      "GROUNDING_VERIFICATION",
      "AMBIGUITY_CRITIC",
      "DISTRACTOR_CRITIC",
      "DUPLICATE_DETECTION",
      "DIFFICULTY_ESTIMATION",
      "ADMIN_HANDOFF"
    ]);
    expect(workflow.publishAutomatically).toBe(false);
  });

  it("runs through admin handoff without publishing automatically", () => {
    const workflow = createContentOrchestrationWorkflow({ idempotencyKey: "m5-6a-run" });
    const completed = runContentOrchestrationWorkflow(workflow);

    expect(completed.status).toBe("completed");
    expect(completed.generationJob?.status).toBe("queued");
    expect(completed.events.some((event) => event.type === "handoff-created")).toBe(true);
    expect(completed.publishAutomatically).toBe(false);
    expect(validateContentOrchestrationWorkflow(completed).errors).toEqual([]);
  });

  it("blocks nodes when dependencies are not complete", () => {
    const workflow = createContentOrchestrationWorkflow({ idempotencyKey: "m5-6a-blocked" });
    const broken = { ...workflow, nodes: workflow.nodes.filter((node) => node.type !== "COVERAGE_PLANNING") };

    expect(validateContentOrchestrationWorkflow(broken).errors).toContain("missing-node:COVERAGE_PLANNING");
    expect(validateContentOrchestrationWorkflow(broken).errors.some((error) => error.includes("missing-dependency"))).toBe(true);
  });
});
