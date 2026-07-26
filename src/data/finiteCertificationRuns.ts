import type { Cert } from "../types";
import { domainWeights } from "./examBlueprints";
import { approvedSourceGroundedQuestions } from "./sourceGrounding";

export type CertificationRunType = "BASELINE" | "APPLIED" | "PRESSURE" | "FINAL" | "PERSONALIZED";
export type CertificationRunPublicationStatus = "draft" | "reviewed" | "published" | "blocked" | "retired";

export interface FiniteCertificationRun {
  id: string;
  cert: Cert;
  version: string;
  runType: CertificationRunType;
  title: string;
  targetQuestions: number;
  minutes: number;
  distributionRules: Record<string, number>;
  itemIds: string[];
  missingApprovedItems: number;
  publicationStatus: CertificationRunPublicationStatus;
  effectiveAt?: string;
  retiredAt?: string;
  personalizedRule?: string;
}

const runTemplates: Array<{ runType: CertificationRunType; title: string; targetQuestions: number; minutes: number; personalizedRule?: string }> = [
  { runType: "BASELINE", title: "Baseline Run", targetQuestions: 40, minutes: 80 },
  { runType: "APPLIED", title: "Applied Run", targetQuestions: 50, minutes: 100 },
  { runType: "PRESSURE", title: "Pressure Run", targetQuestions: 50, minutes: 85 },
  { runType: "FINAL", title: "Final Run", targetQuestions: 60, minutes: 120 },
  { runType: "PERSONALIZED", title: "Personalized Run", targetQuestions: 30, minutes: 45, personalizedRule: "Select weak domains from attempt history and fill with approved source-grounded items only." }
];

export const finiteCertificationRuns: FiniteCertificationRun[] = (["SC-300", "AZ-500", "SC-500"] as Cert[]).flatMap((cert) =>
  runTemplates.map((template) => {
    const approvedItems = approvedSourceGroundedQuestions().filter((question) => question.cert === cert).map((question) => question.id);
    const itemIds = approvedItems.slice(0, template.targetQuestions);
    const missingApprovedItems = Math.max(0, template.targetQuestions - itemIds.length);
    return {
      id: `${cert.toLowerCase().replace("-", "")}-${template.runType.toLowerCase()}-2026`,
      cert,
      version: "2026",
      runType: template.runType,
      title: `${cert} ${template.title}`,
      targetQuestions: template.targetQuestions,
      minutes: template.minutes,
      distributionRules: domainWeights[cert],
      itemIds,
      missingApprovedItems,
      publicationStatus: missingApprovedItems === 0 ? "published" : "blocked",
      effectiveAt: missingApprovedItems === 0 ? "2026-07-26T00:00:00.000Z" : undefined,
      personalizedRule: template.personalizedRule
    } satisfies FiniteCertificationRun;
  })
);

export function finiteRunsForCert(cert: Cert) {
  return finiteCertificationRuns.filter((run) => run.cert === cert);
}

export function validateFiniteCertificationRuns(runs = finiteCertificationRuns) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const approvedIds = new Set(approvedSourceGroundedQuestions().map((question) => question.id));

  for (const cert of ["SC-300", "AZ-500", "SC-500"] as Cert[]) {
    for (const template of runTemplates) {
      if (!runs.some((run) => run.cert === cert && run.runType === template.runType)) errors.push(`missing-run:${cert}:${template.runType}`);
    }
  }

  for (const run of runs) {
    if (ids.has(run.id)) errors.push(`duplicate-run-id:${run.id}`);
    ids.add(run.id);
    if (run.targetQuestions <= 0 || run.minutes <= 0) errors.push(`invalid-run-timing:${run.id}`);
    if (Object.keys(run.distributionRules).length === 0) errors.push(`missing-distribution:${run.id}`);
    for (const itemId of run.itemIds) {
      if (!approvedIds.has(itemId)) errors.push(`unapproved-run-item:${run.id}:${itemId}`);
    }
    if (run.publicationStatus === "published" && run.missingApprovedItems > 0) errors.push(`published-with-missing-items:${run.id}`);
    if (run.publicationStatus === "published" && !run.effectiveAt) errors.push(`published-without-effective-date:${run.id}`);
    if (run.runType === "PERSONALIZED" && !run.personalizedRule) errors.push(`missing-personalized-rule:${run.id}`);
  }

  return { ok: errors.length === 0, errors };
}

export function finiteRunCoverageSummary(cert?: Cert) {
  const runs = cert ? finiteRunsForCert(cert) : finiteCertificationRuns;
  return {
    total: runs.length,
    published: runs.filter((run) => run.publicationStatus === "published").length,
    blocked: runs.filter((run) => run.publicationStatus === "blocked").length,
    missingApprovedItems: runs.reduce((sum, run) => sum + run.missingApprovedItems, 0)
  };
}
