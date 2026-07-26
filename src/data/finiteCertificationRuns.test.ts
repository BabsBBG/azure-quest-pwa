import { describe, expect, it } from "vitest";
import { finiteRunCoverageSummary, finiteRunsForCert, validateFiniteCertificationRuns } from "./finiteCertificationRuns";

describe("finite certification runs", () => {
  it("defines five finite run types for each certification", () => {
    expect(validateFiniteCertificationRuns().errors).toEqual([]);
    expect(finiteRunsForCert("SC-300")).toHaveLength(5);
    expect(new Set(finiteRunsForCert("SC-300").map((run) => run.runType))).toEqual(
      new Set(["BASELINE", "APPLIED", "PRESSURE", "FINAL", "PERSONALIZED"])
    );
  });

  it("blocks publication until approved item coverage exists", () => {
    const summary = finiteRunCoverageSummary();

    expect(summary.total).toBe(15);
    expect(summary.blocked).toBeGreaterThan(0);
    expect(summary.missingApprovedItems).toBeGreaterThan(0);
  });

  it("keeps personalized runs governed by an explicit rule", () => {
    expect(finiteRunsForCert("SC-500").find((run) => run.runType === "PERSONALIZED")?.personalizedRule).toContain("weak domains");
  });
});
