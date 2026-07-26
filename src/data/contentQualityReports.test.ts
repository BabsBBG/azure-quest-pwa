import { describe, expect, it } from "vitest";
import { contentQualityReportSummary, createContentQualityReport, sampleContentQualityReports, validateContentQualityReport } from "./contentQualityReports";
import { approvedSourceGroundedQuestions } from "./sourceGrounding";

describe("content quality reports", () => {
  it("creates reports only for approved assessment items with source context", () => {
    const item = approvedSourceGroundedQuestions()[0];
    const report = createContentQualityReport({ assessmentItemId: item.id, reason: "source-mismatch", comment: "The explanation may not match the source." });

    expect(report.assessmentItemId).toBe(item.id);
    expect(report.sourceChunkId).toBe(item.sourceChunkId);
    expect(report.sourceUrl).toBe(item.sourceUrl);
    expect(report.neverAutoMutatesContent).toBe(true);
    expect(validateContentQualityReport(report).errors).toEqual([]);
  });

  it("rejects unknown or unpublished assessment items", () => {
    expect(() => createContentQualityReport({ assessmentItemId: "unknown", reason: "other" })).toThrow(/unpublished or unknown/);
  });

  it("summarizes admin quality queue without changing content", () => {
    const summary = contentQualityReportSummary(sampleContentQualityReports);

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.open).toBe(summary.total);
    expect(sampleContentQualityReports.every((report) => report.neverAutoMutatesContent)).toBe(true);
  });
});
