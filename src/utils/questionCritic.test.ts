import { describe, expect, it } from "vitest";
import { sourceQuestionCandidates } from "../data/sourceGrounding";
import { applyMainAdminCriticOverrides, critiqueSourceGroundedQuestion, reviewStatusFromCritic } from "./questionCritic";

describe("question critic", () => {
  const approved = sourceQuestionCandidates.find((question) => question.reviewStatus === "approved")!;

  it("critic-approves a valid source-grounded question", () => {
    const report = critiqueSourceGroundedQuestion(approved);

    expect(report.nonOverrideableErrors).toEqual([]);
    expect(["passed", "warning"]).toContain(report.status);
    expect(reviewStatusFromCritic({ ...report, findings: [], overrideableWarnings: [], status: "passed" })).toBe("critic-approved");
  });

  it("blocks non-overridable integrity failures", () => {
    const broken = {
      ...approved,
      id: "broken-official-claim",
      sourceUrl: "https://example.com/not-learn",
      stem: "This is an official Microsoft question. Which answer is correct?"
    };
    const report = critiqueSourceGroundedQuestion(broken);

    expect(report.status).toBe("failed");
    expect(report.nonOverrideableErrors.some((finding) => finding.checkId === "source-support")).toBe(true);
    expect(report.nonOverrideableErrors.some((finding) => finding.checkId === "wording-leakage")).toBe(true);
  });

  it("detects duplicate approved candidates", () => {
    const duplicate = { ...approved, id: "duplicate-candidate" };
    const report = critiqueSourceGroundedQuestion(duplicate, [approved]);

    expect(report.status).toBe("failed");
    expect(report.nonOverrideableErrors.some((finding) => finding.checkId === "semantic-similarity")).toBe(true);
  });

  it("allows Main Admin overrides only for warnings", () => {
    const warningQuestion = { ...approved, id: "warning-question", stem: approved.stem.replace("?", "") };
    const report = critiqueSourceGroundedQuestion(warningQuestion);
    const accessibilityWarning = report.overrideableWarnings.find((finding) => finding.checkId === "accessibility");

    expect(accessibilityWarning).toBeTruthy();
    const overridden = applyMainAdminCriticOverrides(report, [
      {
        id: "override-accessibility-warning",
        questionId: warningQuestion.id,
        findingCheckId: "accessibility",
        reason: "Accepted temporarily for review queue migration.",
        actorRole: "MAIN_ADMIN",
        createdAt: "2026-07-26T00:00:00.000Z"
      }
    ]);

    expect(overridden.findings.some((finding) => finding.checkId === "accessibility")).toBe(false);
    expect(overridden.nonOverrideableErrors).toEqual([]);
  });
});
