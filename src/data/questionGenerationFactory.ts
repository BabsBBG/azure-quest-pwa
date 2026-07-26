import type { Cert, Difficulty, QuizOption, SourceGroundedQuestion } from "../types";
import { sourceHash } from "./sourceIngestion";
import { sourceChunks } from "./sourceGrounding";

export type QuestionGenerationJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "quarantined";
export type QuestionGenerationProviderMode = "deterministic-test" | "external-llm-disabled";

export interface QuestionGenerationFactoryConfig {
  productionEnabled: boolean;
  adminOnly: boolean;
  killSwitchEnabled: boolean;
  budgetCapCents: number;
  perQuestionCostCapCents: number;
  batchQuestionLimit: number;
  maxSourceChunks: number;
  rateLimitPerHour: number;
  maxRetries: number;
  providerMode: QuestionGenerationProviderMode;
}

export interface CoverageTarget {
  cert: Cert;
  domain: string;
  objective: string;
  targetDrafts: number;
  difficulty: Difficulty;
  sourceChunkIds: string[];
}

export interface QuestionGenerationJob {
  id: string;
  idempotencyKey: string;
  status: QuestionGenerationJobStatus;
  config: QuestionGenerationFactoryConfig;
  targets: CoverageTarget[];
  createdAt: string;
  updatedAt: string;
  attempts: number;
  spentEstimateCents: number;
  cancellationRequested: boolean;
  failureLog: string[];
  quarantineReasons: string[];
  draftQuestionIds: string[];
}

export interface QuestionGenerationProvider {
  mode: QuestionGenerationProviderMode;
  generateDraft(target: CoverageTarget, sourceText: string, index: number): Promise<Omit<SourceGroundedQuestion, "id" | "runId" | "reviewStatus" | "criticNotes">>;
}

export const defaultQuestionGenerationConfig: QuestionGenerationFactoryConfig = {
  productionEnabled: false,
  adminOnly: true,
  killSwitchEnabled: false,
  budgetCapCents: 0,
  perQuestionCostCapCents: 0,
  batchQuestionLimit: 6,
  maxSourceChunks: 3,
  rateLimitPerHour: 12,
  maxRetries: 1,
  providerMode: "deterministic-test"
};

export class DeterministicQuestionProvider implements QuestionGenerationProvider {
  mode: QuestionGenerationProviderMode = "deterministic-test";

  async generateDraft(
    target: CoverageTarget,
    sourceText: string,
    index: number
  ): Promise<Omit<SourceGroundedQuestion, "id" | "runId" | "reviewStatus" | "criticNotes">> {
    const sourceChunkId = target.sourceChunkIds[0];
    const sourceChunk = sourceChunks.find((chunk) => chunk.id === sourceChunkId);
    if (!sourceChunk) throw new Error(`Missing source chunk ${sourceChunkId}`);

    const answer: QuizOption["id"] = "A";
    const options: QuizOption[] = [
      { id: "A", text: `Use the source-grounded control described for ${target.objective}` },
      { id: "B", text: "Use an unrelated billing-only setting" },
      { id: "C", text: "Ignore source review and publish directly" },
      { id: "D", text: "Rely on memorized product names without configuration context" }
    ];
    return {
      cert: target.cert,
      domain: target.domain,
      difficulty: target.difficulty,
      stem: `Which approach best supports ${target.objective} based on the approved source material?`,
      options,
      answer,
      explanation: `${target.objective} must be tied back to reviewed official-source material. ${sourceText}`,
      whyWrong: {
        B: "Billing-only settings do not satisfy this security objective.",
        C: "Draft generation must go through critic and Main Admin review.",
        D: "Product-name memorization is not enough for source-grounded assessment."
      },
      tags: [target.objective.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), "source-grounded"],
      sourceChunkId,
      sourceUrl: sourceChunk.sourceUrl,
      duplicateKey: `${target.cert}:${target.domain}:${target.objective}:${index}`.toLowerCase()
    };
  }
}

export function createGenerationJob(args: {
  idempotencyKey: string;
  targets: CoverageTarget[];
  config?: Partial<QuestionGenerationFactoryConfig>;
  now?: string;
}): QuestionGenerationJob {
  const config = { ...defaultQuestionGenerationConfig, ...args.config };
  const now = args.now ?? new Date("2026-07-26T00:00:00.000Z").toISOString();
  return {
    id: sourceHash(args.idempotencyKey).slice(0, 24),
    idempotencyKey: args.idempotencyKey,
    status: "queued",
    config,
    targets: args.targets,
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    spentEstimateCents: 0,
    cancellationRequested: false,
    failureLog: [],
    quarantineReasons: [],
    draftQuestionIds: []
  };
}

export function validateGenerationJob(job: QuestionGenerationJob) {
  const errors: string[] = [];
  const totalRequested = job.targets.reduce((sum, target) => sum + target.targetDrafts, 0);
  const sourceChunkCount = new Set(job.targets.flatMap((target) => target.sourceChunkIds)).size;

  if (!job.config.adminOnly) errors.push("generation-must-be-admin-only");
  if (job.config.productionEnabled) errors.push("production-generation-disabled-until-configured");
  if (job.config.killSwitchEnabled) errors.push("generation-kill-switch-enabled");
  if (job.config.budgetCapCents < 0 || job.config.perQuestionCostCapCents < 0) errors.push("invalid-budget");
  if (job.config.budgetCapCents < totalRequested * job.config.perQuestionCostCapCents) errors.push("budget-cap-too-low");
  if (totalRequested > job.config.batchQuestionLimit) errors.push("batch-question-limit-exceeded");
  if (sourceChunkCount > job.config.maxSourceChunks) errors.push("max-source-chunks-exceeded");
  if (job.config.rateLimitPerHour <= 0) errors.push("invalid-rate-limit");
  if (job.config.maxRetries < 0) errors.push("invalid-retry-limit");

  for (const target of job.targets) {
    if (target.targetDrafts <= 0) errors.push(`invalid-target-count:${target.objective}`);
    if (!target.sourceChunkIds.length) errors.push(`missing-source-chunk:${target.objective}`);
    for (const chunkId of target.sourceChunkIds) {
      const chunk = sourceChunks.find((item) => item.id === chunkId);
      if (!chunk) errors.push(`unknown-source-chunk:${chunkId}`);
      if (chunk && chunk.cert !== target.cert) errors.push(`source-chunk-cert-mismatch:${chunkId}`);
      if (chunk && !chunk.sourceUrl.startsWith("https://learn.microsoft.com/")) errors.push(`source-url-not-microsoft-learn:${chunkId}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export async function runGenerationJob(job: QuestionGenerationJob, provider: QuestionGenerationProvider = new DeterministicQuestionProvider()) {
  const validation = validateGenerationJob(job);
  const next: QuestionGenerationJob = { ...job, attempts: job.attempts + 1, status: "running", updatedAt: job.updatedAt };
  const drafts: SourceGroundedQuestion[] = [];

  if (job.cancellationRequested) {
    return { job: { ...next, status: "cancelled" as const, failureLog: [...next.failureLog, "Generation cancelled before execution."] }, drafts };
  }

  if (!validation.ok) {
    return { job: { ...next, status: "quarantined" as const, quarantineReasons: validation.errors, failureLog: [...next.failureLog, ...validation.errors] }, drafts };
  }

  try {
    for (const target of job.targets) {
      const sourceText = sourceChunks.filter((chunk) => target.sourceChunkIds.includes(chunk.id)).map((chunk) => chunk.summary).join(" ");
      for (let index = 0; index < target.targetDrafts; index += 1) {
        const draft = await provider.generateDraft(target, sourceText, index);
        const id = `draft-${sourceHash(`${job.id}:${target.cert}:${target.objective}:${index}`).slice(0, 24)}`;
        drafts.push({
          ...draft,
          id,
          runId: job.id,
          reviewStatus: "draft",
          criticNotes: ["Generated by deterministic test provider.", "Requires critic checks and Main Admin review before serving."]
        });
      }
    }

    return {
      job: {
        ...next,
        status: "completed" as const,
        spentEstimateCents: drafts.length * job.config.perQuestionCostCapCents,
        draftQuestionIds: drafts.map((draft) => draft.id)
      },
      drafts
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation failure";
    return { job: { ...next, status: "failed" as const, failureLog: [...next.failureLog, message] }, drafts };
  }
}

export const sampleCoverageTargets: CoverageTarget[] = [
  {
    cert: "SC-300",
    domain: "Implement authentication and access management",
    objective: "Implement Conditional Access",
    targetDrafts: 1,
    difficulty: "medium",
    sourceChunkIds: ["chunk-sc300-auth-access"]
  },
  {
    cert: "SC-500",
    domain: "Implement end-to-end Microsoft security",
    objective: "Explain practical administration expectations",
    targetDrafts: 1,
    difficulty: "hard",
    sourceChunkIds: ["chunk-sc500-end-to-end"]
  }
];
