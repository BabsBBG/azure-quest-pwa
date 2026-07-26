import type { QuizOption, SourceGroundedQuestion, SourceReviewStatus } from "../types";
import { sourceChunks, validateSourceGroundedQuestion } from "../data/sourceGrounding";
import { duplicateFingerprints, duplicateValues, normalizeQuestionText } from "./questionQuality";

export type CriticSeverity = "error" | "warning";

export type CriticCheckId =
  | "source-support"
  | "answer-uniqueness"
  | "distractor-plausibility"
  | "ambiguity"
  | "hidden-assumptions"
  | "objective-alignment"
  | "difficulty"
  | "freshness"
  | "item-type-validity"
  | "accessibility"
  | "wording-leakage"
  | "semantic-similarity"
  | "unsupported-claims"
  | "scenario-consistency";

export interface CriticFinding {
  checkId: CriticCheckId;
  severity: CriticSeverity;
  message: string;
  overrideAllowed: boolean;
}

export interface CriticReport {
  questionId: string;
  status: "passed" | "warning" | "failed";
  findings: CriticFinding[];
  nonOverrideableErrors: CriticFinding[];
  overrideableWarnings: CriticFinding[];
}

export interface MainAdminCriticOverride {
  id: string;
  questionId: string;
  findingCheckId: CriticCheckId;
  reason: string;
  actorRole: "MAIN_ADMIN";
  createdAt: string;
}

function finding(checkId: CriticCheckId, severity: CriticSeverity, message: string, overrideAllowed = severity === "warning"): CriticFinding {
  return { checkId, severity, message, overrideAllowed };
}

function optionTexts(question: SourceGroundedQuestion) {
  return question.options.map((option) => normalizeQuestionText(option.text));
}

function optionById(question: SourceGroundedQuestion, id: QuizOption["id"]) {
  return question.options.find((option) => option.id === id);
}

export function critiqueSourceGroundedQuestion(question: SourceGroundedQuestion, corpus: SourceGroundedQuestion[] = []) {
  const findings: CriticFinding[] = [];
  const trustContract = validateSourceGroundedQuestion(question);
  const chunk = sourceChunks.find((item) => item.id === question.sourceChunkId);

  for (const error of trustContract.errors) {
    findings.push(finding("source-support", "error", `Trust contract failed: ${error}.`, false));
  }

  if (!chunk || chunk.sourceUrl !== question.sourceUrl) {
    findings.push(finding("source-support", "error", "Question must cite a matching source chunk.", false));
  }

  const normalizedOptions = optionTexts(question);
  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    findings.push(finding("answer-uniqueness", "error", "Options must be unique after normalization.", false));
  }

  const answerOption = optionById(question, question.answer);
  if (!answerOption) {
    findings.push(finding("answer-uniqueness", "error", "Correct answer option is missing.", false));
  }

  const answerWords = answerOption ? new Set(normalizeQuestionText(answerOption.text).split(" ").filter(Boolean)) : new Set<string>();
  for (const option of question.options) {
    if (option.id === question.answer) continue;
    const optionWords = normalizeQuestionText(option.text).split(" ").filter(Boolean);
    const overlap = optionWords.filter((word) => answerWords.has(word)).length;
    if (optionWords.length > 2 && overlap / optionWords.length > 0.85) {
      findings.push(finding("semantic-similarity", "error", `Distractor ${option.id} is too similar to the answer.`, false));
    }
    if (option.text.length < 6) {
      findings.push(finding("distractor-plausibility", "warning", `Distractor ${option.id} is too short to be useful.`));
    }
  }

  if (/\ball of the above\b|\bnone of the above\b/i.test(question.stem + " " + question.options.map((option) => option.text).join(" "))) {
    findings.push(finding("item-type-validity", "warning", "Avoid all/none-of-the-above wording in source-grounded drafts."));
  }

  if (/\bofficial microsoft question\b|\breal exam question\b/i.test(question.stem + " " + question.explanation)) {
    findings.push(finding("wording-leakage", "error", "Question must not claim to be an official provider exam item.", false));
  }

  if (!question.stem.includes("?")) {
    findings.push(finding("accessibility", "warning", "Question stem should read as an explicit question."));
  }

  if (question.stem.length < 40 || question.explanation.length < 40) {
    findings.push(finding("ambiguity", "warning", "Stem and explanation should include enough context for review."));
  }

  if (!question.tags.some((tag) => normalizeQuestionText(question.domain).includes(normalizeQuestionText(tag)) || normalizeQuestionText(question.stem).includes(normalizeQuestionText(tag)))) {
    findings.push(finding("objective-alignment", "warning", "Tags should visibly align to the objective, domain, or stem."));
  }

  if (!["easy", "medium", "hard"].includes(question.difficulty)) {
    findings.push(finding("difficulty", "error", "Difficulty must be easy, medium, or hard.", false));
  }

  if (chunk && !chunk.contentHash.trim()) {
    findings.push(finding("freshness", "error", "Source chunk must include a content hash.", false));
  }

  if (/always|never/i.test(question.stem) && !/unless|except|only when/i.test(question.stem + " " + question.explanation)) {
    findings.push(finding("hidden-assumptions", "warning", "Absolute wording may hide assumptions unless scoped."));
  }

  if (!question.explanation.toLowerCase().includes(question.answer.toLowerCase()) && !answerOption) {
    findings.push(finding("unsupported-claims", "error", "Explanation must support the selected answer.", false));
  }

  if (question.domain.trim().length < 8) {
    findings.push(finding("scenario-consistency", "warning", "Domain context is too thin for scenario consistency review."));
  }

  const duplicateIssues = {
    fingerprints: duplicateFingerprints([question, ...corpus]),
    duplicateKeys: duplicateValues([question, ...corpus], (item) => item.duplicateKey)
  };
  if (duplicateIssues.fingerprints.length || duplicateIssues.duplicateKeys.length) {
    findings.push(finding("semantic-similarity", "error", "Duplicate stem/options or duplicate key detected.", false));
  }

  const nonOverrideableErrors = findings.filter((item) => item.severity === "error" && !item.overrideAllowed);
  const overrideableWarnings = findings.filter((item) => item.severity === "warning" && item.overrideAllowed);
  return {
    questionId: question.id,
    status: nonOverrideableErrors.length ? "failed" : overrideableWarnings.length ? "warning" : "passed",
    findings,
    nonOverrideableErrors,
    overrideableWarnings
  } satisfies CriticReport;
}

export function applyMainAdminCriticOverrides(report: CriticReport, overrides: MainAdminCriticOverride[]) {
  const overrideKeys = new Set(overrides.map((override) => `${override.questionId}:${override.findingCheckId}`));
  const remaining = report.findings.filter((findingItem) => {
    if (findingItem.severity === "error" && !findingItem.overrideAllowed) return true;
    return !overrideKeys.has(`${report.questionId}:${findingItem.checkId}`);
  });
  const errors = remaining.filter((item) => item.severity === "error" && !item.overrideAllowed);
  const warnings = remaining.filter((item) => item.severity === "warning");

  return {
    ...report,
    status: errors.length ? "failed" : warnings.length ? "warning" : "passed",
    findings: remaining,
    nonOverrideableErrors: errors,
    overrideableWarnings: warnings
  } satisfies CriticReport;
}

export function reviewStatusFromCritic(report: CriticReport): SourceReviewStatus {
  if (report.status === "passed") return "critic-approved";
  if (report.status === "warning") return "draft";
  return "rejected";
}
