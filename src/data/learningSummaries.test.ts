import { describe, expect, it } from "vitest";
import {
  approvedLearningSummaries,
  learningSummariesForSource,
  learningSummaryIntegrityReport,
  learningSummaryWorkspaces,
  publishedLearningSummaryVersions,
  validateLearningSummaryWorkspace
} from "./learningSummaries";

describe("learning summaries", () => {
  it("publishes immutable Main Admin-approved source-grounded summary versions", () => {
    expect(learningSummaryWorkspaces.length).toBeGreaterThan(0);
    expect(publishedLearningSummaryVersions.length).toBe(learningSummaryWorkspaces.length);

    for (const summary of publishedLearningSummaryVersions) {
      expect(summary.immutable).toBe(true);
      expect(summary.approvedByRole).toBe("MAIN_ADMIN");
      expect(summary.reviewStatus).toBe("approved");
      expect(summary.publicationStatus).toBe("approved");
      expect(validateLearningSummaryWorkspace(summary).errors).toEqual([]);
    }
  });

  it("serves approved summaries by certification and source document", () => {
    expect(approvedLearningSummaries("SC-300").length).toBeGreaterThan(0);
    expect(approvedLearningSummaries("AZ-500").every((summary) => summary.cert === "AZ-500")).toBe(true);
    expect(learningSummariesForSource("mslearn-sc300-study-guide").some((summary) => summary.cert === "SC-300")).toBe(true);
  });

  it("reports integrity errors without hiding gaps", () => {
    const report = learningSummaryIntegrityReport();

    expect(report.errors).toEqual([]);
    expect(report.approved).toBe(report.publishedVersions);
  });
});
