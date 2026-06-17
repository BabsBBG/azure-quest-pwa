import type { AnswerRecord, AttemptKind, Cert, DomainBreakdown, ExamAttempt, ExamMode, Question, QuizOption } from "../types";
import { pickQuestions } from "./random";
import { readinessDeltaFromAttempt } from "./readiness";

export function buildExam(args: {
  bank: Question[];
  cert: Cert;
  mode: ExamMode;
  count?: number;
  seed?: string;
  weakTags?: string[];
  focusTags?: string[];
  focusDomain?: string;
  domainWeights?: Record<string, number>;
}) {
  const defaultCount = args.mode === "daily" ? 10 : args.mode === "quiz" ? 10 : args.mode === "weak" ? 15 : 50;
  const seed = args.seed ?? `${args.cert}:${args.mode}:${args.focusDomain ?? "mixed"}:${Date.now()}:${Math.random()}`;
  return {
    seed,
    questions: pickQuestions({
      bank: args.bank,
      cert: args.cert,
      count: args.count ?? defaultCount,
      seed,
      focusTags: args.mode === "weak" ? args.weakTags : args.focusTags,
      focusDomain: args.focusDomain,
      domainWeights: args.domainWeights
    })
  };
}

export function scoreAttempt(args: {
  cert: Cert;
  mode: ExamMode;
  kind?: AttemptKind;
  title?: string;
  blueprintId?: string;
  quizId?: string;
  startedAt: string;
  seed: string;
  questions: Question[];
  selections: Record<string, QuizOption["id"] | null>;
  secondsByQuestion: Record<string, number>;
  timeLimitSeconds?: number;
}): ExamAttempt {
  const answers: AnswerRecord[] = args.questions.map((question) => {
    const selected = args.selections[question.id] ?? null;
    return {
      questionId: question.id,
      selected,
      correct: selected === question.answer,
      timeSeconds: args.secondsByQuestion[question.id] ?? 0,
      domain: question.domain,
      tags: question.tags
    };
  });

  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const domains = answers.reduce<Record<string, DomainBreakdown>>((acc, answer) => {
    acc[answer.domain] ??= { correct: 0, total: 0 };
    acc[answer.domain].total += 1;
    if (answer.correct) acc[answer.domain].correct += 1;
    return acc;
  }, {});

  const completedAt = new Date().toISOString();
  const started = new Date(args.startedAt).getTime();
  const timeTakenSeconds = Math.max(1, Math.round((Date.now() - started) / 1000));
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 70;
  const kind = args.kind ?? (args.mode === "quiz" ? "quiz" : args.mode === "daily" ? "daily" : args.mode === "timed" ? "exam" : "practice");
  const streakBonus = percentage >= 80 ? 25 : 0;
  const speedBonus = args.timeLimitSeconds && timeTakenSeconds <= args.timeLimitSeconds * 0.7 ? 10 : 0;
  const xpEarned = score * (kind === "exam" ? 14 : 10) + streakBonus + speedBonus;
  const preliminary = { percentage, kind } as ExamAttempt;
  const readinessDelta = readinessDeltaFromAttempt(preliminary);

  return {
    id: crypto.randomUUID(),
    cert: args.cert,
    mode: args.mode,
    kind,
    title: args.title ?? `${args.cert} ${kind}`,
    blueprintId: args.blueprintId,
    quizId: args.quizId,
    startedAt: args.startedAt,
    completedAt,
    score,
    total,
    percentage,
    passed,
    timeTakenSeconds,
    timeLimitSeconds: args.timeLimitSeconds,
    xpEarned,
    readinessDelta,
    domains,
    answers,
    retakeSeed: args.seed
  };
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}

export function nextLevelXp(level: number) {
  return Math.pow(level, 2) * 100;
}
