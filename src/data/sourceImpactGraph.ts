import type { SourceReviewStatus } from "../types";
import { buildCertificationKnowledgeGraph, contentAffectedByChangedSource, type KnowledgeGraphNode } from "./knowledgeGraph";
import { sourceHash } from "./sourceIngestion";

export type SourceImpactRiskState = "unchanged" | "needs-review" | "needs-replacement" | "blocked";

export interface SourceVersionDiff {
  id: string;
  sourceDocumentId: string;
  previousContentHash: string;
  nextContentHash: string;
  changedAt: string;
  changedSections: string[];
  removedSections: string[];
  addedSections: string[];
}

export interface SourceImpactRecord {
  id: string;
  sourceDiffId: string;
  nodeId: string;
  nodeKind: KnowledgeGraphNode["kind"];
  label: string;
  riskState: SourceImpactRiskState;
  reason: string;
  reviewStatus: SourceReviewStatus;
}

export interface TargetedReplacementJob {
  id: string;
  sourceDiffId: string;
  affectedNodeIds: string[];
  status: "draft" | "queued" | "blocked" | "completed";
  requiresMainAdminReview: true;
  publishAutomatically: false;
  createdAt: string;
}

function riskForNode(node: KnowledgeGraphNode): SourceImpactRiskState {
  if (node.kind === "ASSESSMENT_ITEM") return node.status === "approved" ? "needs-replacement" : "needs-review";
  if (node.kind === "LEARNING_SUMMARY") return "needs-review";
  if (node.kind === "DOMAIN_QUIZ_PLACEMENT" || node.kind === "CERTIFICATION_RUN_PLACEMENT") return "blocked";
  if (node.kind === "KNOWLEDGE_UNIT" || node.kind === "OBJECTIVE" || node.kind === "SOURCE_CHUNK") return "needs-review";
  return "unchanged";
}

export function createSourceVersionDiff(args: {
  sourceDocumentId: string;
  previousContentHash: string;
  nextContentHash: string;
  changedSections?: string[];
  removedSections?: string[];
  addedSections?: string[];
  changedAt?: string;
}): SourceVersionDiff {
  return {
    id: `diff-${sourceHash(`${args.sourceDocumentId}:${args.previousContentHash}:${args.nextContentHash}`).slice(0, 24)}`,
    sourceDocumentId: args.sourceDocumentId,
    previousContentHash: args.previousContentHash,
    nextContentHash: args.nextContentHash,
    changedAt: args.changedAt ?? new Date("2026-07-26T00:00:00.000Z").toISOString(),
    changedSections: args.changedSections ?? [],
    removedSections: args.removedSections ?? [],
    addedSections: args.addedSections ?? []
  };
}

export function impactRecordsForSourceDiff(diff: SourceVersionDiff, graph = buildCertificationKnowledgeGraph()) {
  const affected = contentAffectedByChangedSource(diff.sourceDocumentId, graph);
  return affected.map((node) => {
    const riskState = riskForNode(node);
    return {
      id: `impact-${sourceHash(`${diff.id}:${node.id}`).slice(0, 24)}`,
      sourceDiffId: diff.id,
      nodeId: node.id,
      nodeKind: node.kind,
      label: node.label,
      riskState,
      reason: riskState === "unchanged" ? "Node is adjacent to the changed source but does not require content action." : `Changed source may affect ${node.kind}.`,
      reviewStatus: riskState === "unchanged" ? "approved" : "draft"
    } satisfies SourceImpactRecord;
  });
}

export function createTargetedReplacementJob(diff: SourceVersionDiff, impacts = impactRecordsForSourceDiff(diff)): TargetedReplacementJob {
  const affectedNodeIds = impacts
    .filter((impact) => impact.riskState === "needs-replacement" || impact.riskState === "blocked")
    .map((impact) => impact.nodeId);

  return {
    id: `replacement-${sourceHash(`${diff.id}:${affectedNodeIds.join("|")}`).slice(0, 24)}`,
    sourceDiffId: diff.id,
    affectedNodeIds,
    status: affectedNodeIds.length ? "queued" : "draft",
    requiresMainAdminReview: true,
    publishAutomatically: false,
    createdAt: diff.changedAt
  };
}

export function validateSourceImpact(diff: SourceVersionDiff, impacts = impactRecordsForSourceDiff(diff), replacement = createTargetedReplacementJob(diff, impacts)) {
  const errors: string[] = [];

  if (diff.previousContentHash === diff.nextContentHash) errors.push("unchanged-diff");
  if (!diff.changedSections.length && !diff.removedSections.length && !diff.addedSections.length) errors.push("missing-diff-sections");
  if (!impacts.length) errors.push("missing-impact-records");
  if (replacement.publishAutomatically !== false) errors.push("replacement-must-not-auto-publish");
  if (replacement.requiresMainAdminReview !== true) errors.push("replacement-must-require-main-admin-review");

  for (const impact of impacts) {
    if (!impact.reason.trim()) errors.push(`missing-impact-reason:${impact.nodeId}`);
    if ((impact.riskState === "needs-replacement" || impact.riskState === "blocked") && impact.reviewStatus !== "draft") {
      errors.push(`actionable-impact-must-be-draft:${impact.nodeId}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
