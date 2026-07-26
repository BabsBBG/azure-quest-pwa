import type { Cert } from "../types";
import { sourceHash } from "./sourceIngestion";
import { approvedSourceGroundedQuestions } from "./sourceGrounding";

export type ContentQualityReportReason = "unclear" | "incorrect" | "source-mismatch" | "outdated" | "accessibility" | "other";
export type ContentQualityReportStatus = "open" | "triaged" | "in-review" | "resolved" | "rejected";

export interface ContentQualityReport {
  id: string;
  cert: Cert;
  assessmentItemId: string;
  assessmentItemVersion: string;
  sourceChunkId: string;
  sourceUrl: string;
  attemptId?: string;
  assessmentSessionId?: string;
  reason: ContentQualityReportReason;
  comment?: string;
  status: ContentQualityReportStatus;
  createdAt: string;
  neverAutoMutatesContent: true;
}

export function createContentQualityReport(args: {
  assessmentItemId: string;
  reason: ContentQualityReportReason;
  comment?: string;
  attemptId?: string;
  assessmentSessionId?: string;
  now?: string;
}): ContentQualityReport {
  const item = approvedSourceGroundedQuestions().find((question) => question.id === args.assessmentItemId);
  if (!item) throw new Error(`Cannot report unpublished or unknown assessment item: ${args.assessmentItemId}`);
  const createdAt = args.now ?? new Date("2026-07-26T00:00:00.000Z").toISOString();

  return {
    id: `report-${sourceHash(`${item.id}:${args.reason}:${args.comment ?? ""}:${createdAt}`).slice(0, 24)}`,
    cert: item.cert,
    assessmentItemId: item.id,
    assessmentItemVersion: item.approvedAt ?? "approved-preview-v1",
    sourceChunkId: item.sourceChunkId,
    sourceUrl: item.sourceUrl,
    attemptId: args.attemptId,
    assessmentSessionId: args.assessmentSessionId,
    reason: args.reason,
    comment: args.comment,
    status: "open",
    createdAt,
    neverAutoMutatesContent: true
  };
}

export const sampleContentQualityReports: ContentQualityReport[] = approvedSourceGroundedQuestions().slice(0, 1).map((question) =>
  createContentQualityReport({
    assessmentItemId: question.id,
    reason: "unclear",
    comment: "Sample admin queue report for M5.11 validation."
  })
);

export function validateContentQualityReport(report: ContentQualityReport) {
  const errors: string[] = [];
  const item = approvedSourceGroundedQuestions().find((question) => question.id === report.assessmentItemId);

  if (!item) errors.push("missing-approved-item");
  if (item && item.sourceChunkId !== report.sourceChunkId) errors.push("source-chunk-mismatch");
  if (item && item.sourceUrl !== report.sourceUrl) errors.push("source-url-mismatch");
  if (!report.assessmentItemVersion.trim()) errors.push("missing-item-version");
  if (!report.createdAt.trim()) errors.push("missing-created-at");
  if (report.neverAutoMutatesContent !== true) errors.push("report-must-not-auto-mutate-content");

  return { ok: errors.length === 0, errors };
}

export function contentQualityReportSummary(reports = sampleContentQualityReports) {
  return {
    total: reports.length,
    open: reports.filter((report) => report.status === "open").length,
    byReason: reports.reduce<Record<string, number>>((acc, report) => {
      acc[report.reason] = (acc[report.reason] ?? 0) + 1;
      return acc;
    }, {})
  };
}
