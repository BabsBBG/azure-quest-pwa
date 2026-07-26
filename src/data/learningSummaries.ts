import type { Cert, SourceReviewStatus } from "../types";
import { certifications, extractKnowledgeUnits, type KnowledgeUnitDraft } from "./sourceIngestion";

export type LearningSummaryPublicationStatus = "draft" | "reviewed" | "approved" | "retired";

export interface LearningSummarySourceLink {
  sourceDocumentId: string;
  sourceUrl: string;
  sourceTextHash: string;
  sourceSection: string;
}

export interface LearningSummaryWorkspace {
  id: string;
  certificationId: string;
  cert: Cert;
  domainId: string;
  domainTitle: string;
  blueprintVersion: string;
  overview: string;
  learningSequence: string[];
  terminology: Array<{ term: string; definition: string }>;
  configurationSteps: string[];
  decisionRules: string[];
  commonMistakes: string[];
  examples: string[];
  sourceLinks: LearningSummarySourceLink[];
  reviewStatus: SourceReviewStatus;
  publicationStatus: LearningSummaryPublicationStatus;
  reviewerNotes: string[];
  updatedAt: string;
}

export interface PublishedLearningSummaryVersion extends Omit<LearningSummaryWorkspace, "publicationStatus" | "reviewStatus" | "updatedAt"> {
  versionId: string;
  workspaceId: string;
  versionNumber: number;
  publicationStatus: "approved" | "retired";
  reviewStatus: "approved";
  approvedByRole: "MAIN_ADMIN";
  approvedAt: string;
  immutable: true;
  supersedesVersionId?: string;
}

const publishedAt = "2026-07-22T00:00:00.000Z";

function conceptSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sourceDocumentId(cert: Cert) {
  return `mslearn-${cert.toLowerCase().replace("-", "")}-study-guide`;
}

function unitsForDomain(certificationId: string, domainId: string): KnowledgeUnitDraft[] {
  const certification = certifications.find((item) => item.id === certificationId);
  if (!certification) return [];
  return extractKnowledgeUnits(certification, certification.officialStudyGuide, "").filter((unit) => unit.domainId === domainId);
}

function workspaceForDomain(certification: (typeof certifications)[number], domain: (typeof certifications)[number]["domains"][number]): LearningSummaryWorkspace {
  const cert = certification.code as Cert;
  const units = unitsForDomain(certification.id, domain.id);
  const objectiveNames = units.map((unit) => unit.objective);
  const primaryConcept = units[0]?.concept ?? domain.title;
  const sourceLinks = units.map((unit) => ({
    sourceDocumentId: sourceDocumentId(cert),
    sourceUrl: unit.sourceUrl,
    sourceTextHash: unit.sourceTextHash,
    sourceSection: unit.sourceSection
  }));

  return {
    id: `summary-${domain.id}`,
    certificationId: certification.id,
    cert,
    domainId: domain.id,
    domainTitle: domain.title,
    blueprintVersion: certification.version,
    overview: `${domain.title} focuses on ${objectiveNames.join(", ")}. PraxisGrid treats this as source-grounded study guidance, not official provider wording.`,
    learningSequence: objectiveNames.map((objective, index) => `${index + 1}. Study ${objective}, then answer recall questions before moving on.`),
    terminology: units.map((unit) => ({
      term: unit.concept,
      definition: `A reviewable Knowledge Unit extracted from the ${unit.sourceSection} source section.`
    })),
    configurationSteps: units.flatMap((unit) => unit.procedures),
    decisionRules: [
      `Use the official ${cert} study guide as the controlling source for this domain.`,
      "Prefer hands-on verification before treating a concept as interview-ready.",
      "Treat demo/seed practice questions as platform test content until approved source-grounded coverage replaces them."
    ],
    commonMistakes: units.flatMap((unit) => unit.commonConfusions.length ? unit.commonConfusions : [`Do not confuse ${unit.concept} with adjacent objectives.`]),
    examples: units.map((unit) => `Practice example: explain when ${conceptSlug(unit.concept)} matters and cite the source section before answering.`),
    sourceLinks,
    reviewStatus: "approved",
    publicationStatus: "approved",
    reviewerNotes: ["Main Admin-approved scaffold summary generated from official-source Knowledge Units.", "Provider-neutral wording preserved."],
    updatedAt: publishedAt
  };
}

export const learningSummaryWorkspaces: LearningSummaryWorkspace[] = certifications.flatMap((certification) =>
  certification.domains.map((domain) => workspaceForDomain(certification, domain))
);

export const publishedLearningSummaryVersions: PublishedLearningSummaryVersion[] = learningSummaryWorkspaces.map((workspace) => ({
  ...workspace,
  versionId: `${workspace.id}:v1`,
  workspaceId: workspace.id,
  versionNumber: 1,
  publicationStatus: "approved",
  reviewStatus: "approved",
  approvedByRole: "MAIN_ADMIN",
  approvedAt: publishedAt,
  immutable: true
}));

export function approvedLearningSummaries(cert?: Cert) {
  return publishedLearningSummaryVersions.filter((summary) => summary.publicationStatus === "approved" && (!cert || summary.cert === cert));
}

export function learningSummariesForSource(sourceDocumentIdValue: string) {
  return publishedLearningSummaryVersions.filter((summary) =>
    summary.sourceLinks.some((link) => link.sourceDocumentId === sourceDocumentIdValue)
  );
}

export function validateLearningSummaryWorkspace(summary: LearningSummaryWorkspace | PublishedLearningSummaryVersion) {
  const errors: string[] = [];

  if (!summary.overview.trim()) errors.push("missing-overview");
  if (!summary.learningSequence.length) errors.push("missing-learning-sequence");
  if (!summary.terminology.length) errors.push("missing-terminology");
  if (!summary.configurationSteps.length) errors.push("missing-configuration-steps");
  if (!summary.decisionRules.length) errors.push("missing-decision-rules");
  if (!summary.commonMistakes.length) errors.push("missing-common-mistakes");
  if (!summary.examples.length) errors.push("missing-examples");
  if (!summary.sourceLinks.length) errors.push("missing-source-links");
  if (!summary.blueprintVersion.trim()) errors.push("missing-blueprint-version");
  if (!summary.reviewerNotes.length) errors.push("missing-reviewer-notes");

  for (const link of summary.sourceLinks) {
    if (!link.sourceUrl.startsWith("https://learn.microsoft.com/")) errors.push("source-url-not-microsoft-learn");
    if (link.sourceTextHash.length !== 64) errors.push("invalid-source-text-hash");
  }

  if ("immutable" in summary && summary.immutable !== true) errors.push("published-version-not-immutable");
  if ("approvedByRole" in summary && summary.approvedByRole !== "MAIN_ADMIN") errors.push("published-without-main-admin");

  return { ok: errors.length === 0, errors };
}

export function learningSummaryIntegrityReport() {
  const workspaceErrors = learningSummaryWorkspaces.flatMap((summary) =>
    validateLearningSummaryWorkspace(summary).errors.map((error) => `${summary.id}:${error}`)
  );
  const publishedErrors = publishedLearningSummaryVersions.flatMap((summary) =>
    validateLearningSummaryWorkspace(summary).errors.map((error) => `${summary.versionId}:${error}`)
  );
  const duplicateVersionIds = new Set<string>();
  const seen = new Set<string>();

  for (const version of publishedLearningSummaryVersions) {
    if (seen.has(version.versionId)) duplicateVersionIds.add(version.versionId);
    seen.add(version.versionId);
  }

  return {
    workspaces: learningSummaryWorkspaces.length,
    publishedVersions: publishedLearningSummaryVersions.length,
    approved: approvedLearningSummaries().length,
    errors: [...workspaceErrors, ...publishedErrors, ...[...duplicateVersionIds].map((id) => `duplicate-version:${id}`)]
  };
}
