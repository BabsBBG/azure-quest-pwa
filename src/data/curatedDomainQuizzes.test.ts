import { describe, expect, it } from "vitest";
import { curatedDomainQuizzes, curatedQuizCoverageSummary, curatedQuizzesForCert, validateCuratedDomainQuizzes } from "./curatedDomainQuizzes";

describe("curated domain quizzes", () => {
  it("defines five curated tracks for every certification domain", () => {
    expect(validateCuratedDomainQuizzes().errors).toEqual([]);
    expect(curatedQuizzesForCert("SC-300")).toHaveLength(20);
    expect(new Set(curatedQuizzesForCert("SC-300").map((quiz) => quiz.track))).toEqual(
      new Set(["FOUNDATIONS", "CONFIGURATION", "SCENARIOS", "TROUBLESHOOTING", "DOMAIN_CHALLENGE"])
    );
  });

  it("uses only approved item placements and blocks incomplete quizzes", () => {
    expect(curatedDomainQuizzes.every((quiz) => quiz.itemIds.length <= quiz.targetQuestions)).toBe(true);
    expect(curatedDomainQuizzes.filter((quiz) => quiz.publicationStatus === "blocked").length).toBeGreaterThan(0);
    expect(curatedDomainQuizzes.every((quiz) => quiz.publicationStatus !== "published" || quiz.missingApprovedItems === 0)).toBe(true);
  });

  it("reports missing approved content coverage", () => {
    const summary = curatedQuizCoverageSummary();

    expect(summary.total).toBe(60);
    expect(summary.blocked).toBeGreaterThan(0);
    expect(summary.missingApprovedItems).toBeGreaterThan(0);
  });
});
