import { describe, expect, it } from "vitest";
import { createSourceVersionDiff, createTargetedReplacementJob, impactRecordsForSourceDiff, validateSourceImpact } from "./sourceImpactGraph";

describe("source impact graph", () => {
  it("traverses changed source documents into affected content", () => {
    const diff = createSourceVersionDiff({
      sourceDocumentId: "mslearn-sc300-study-guide",
      previousContentHash: "sc300-study-guide-previous",
      nextContentHash: "sc300-study-guide-next",
      changedSections: ["Implement authentication and access management"]
    });
    const impacts = impactRecordsForSourceDiff(diff);

    expect(impacts.some((impact) => impact.nodeKind === "LEARNING_SUMMARY")).toBe(true);
    expect(impacts.some((impact) => impact.nodeId === "sg-sc300-conditional-access-001" && impact.riskState === "needs-replacement")).toBe(true);
    expect(impacts.some((impact) => impact.nodeKind === "DOMAIN_QUIZ_PLACEMENT" && impact.riskState === "blocked")).toBe(true);
  });

  it("creates targeted replacement jobs that never auto-publish", () => {
    const diff = createSourceVersionDiff({
      sourceDocumentId: "mslearn-sc300-study-guide",
      previousContentHash: "old",
      nextContentHash: "new",
      changedSections: ["Conditional Access"]
    });
    const impacts = impactRecordsForSourceDiff(diff);
    const replacement = createTargetedReplacementJob(diff, impacts);

    expect(replacement.affectedNodeIds.length).toBeGreaterThan(0);
    expect(replacement.requiresMainAdminReview).toBe(true);
    expect(replacement.publishAutomatically).toBe(false);
    expect(validateSourceImpact(diff, impacts, replacement).errors).toEqual([]);
  });

  it("flags invalid unchanged diffs", () => {
    const diff = createSourceVersionDiff({
      sourceDocumentId: "mslearn-sc300-study-guide",
      previousContentHash: "same",
      nextContentHash: "same"
    });

    expect(validateSourceImpact(diff).errors).toContain("unchanged-diff");
    expect(validateSourceImpact(diff).errors).toContain("missing-diff-sections");
  });
});
