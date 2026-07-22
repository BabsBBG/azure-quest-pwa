import type { AnswerRecord, ConfidenceRating, ExamAttempt } from "../types";

export const SIMULATED_SCORE_DISCLAIMER = "PraxisGrid simulated scores are estimates and do not reproduce a certification provider's private scoring model.";

export function confidenceInsights(answers: AnswerRecord[]) {
  return answers.reduce<Record<ConfidenceRating, number>>((acc, answer) => {
    const rating = answer.confidence ?? "UNSURE";
    acc[rating] += 1;
    return acc;
  }, { GUESSING: 0, UNSURE: 0, FAIRLY_CONFIDENT: 0, CERTAIN: 0 });
}

export function simulatedScore(args: { percentage: number; answers: AnswerRecord[]; hardQuestionCount: number }) {
  const confidence = confidenceInsights(args.answers);
  const misconceptionPenalty = args.answers.filter((answer) => !answer.correct && answer.confidence === "CERTAIN").length * 18;
  const fragileKnowledgePenalty = args.answers.filter((answer) => answer.correct && (answer.confidence === "GUESSING" || answer.confidence === "UNSURE")).length * 7;
  const difficultyBonus = args.hardQuestionCount ? Math.min(40, args.hardQuestionCount * 4) : 0;
  const confidenceBonus = Math.min(35, confidence.CERTAIN * 3 + confidence.FAIRLY_CONFIDENT);
  const score = Math.round(100 + args.percentage * 8 + difficultyBonus + confidenceBonus - misconceptionPenalty - fragileKnowledgePenalty);
  return Math.max(100, Math.min(1000, score));
}

export function adaptationSignals(attempt: Pick<ExamAttempt, "answers" | "percentage" | "domains">) {
  const signals: string[] = [];
  const confidentMisses = attempt.answers.filter((answer) => !answer.correct && answer.confidence === "CERTAIN");
  const fragileCorrect = attempt.answers.filter((answer) => answer.correct && (answer.confidence === "GUESSING" || answer.confidence === "UNSURE"));
  const weakDomains = Object.entries(attempt.domains)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.65)
    .map(([domain]) => domain);

  if (confidentMisses.length) signals.push("Review likely misconceptions from high-confidence misses.");
  if (fragileCorrect.length) signals.push("Reinforce fragile knowledge where correct answers were low confidence.");
  if (weakDomains.length) signals.push(`Target weak domains: ${weakDomains.slice(0, 2).join(", ")}.`);
  if (attempt.percentage >= 80 && !confidentMisses.length) signals.push("Advance to harder scenario and case-study practice.");
  if (!signals.length) signals.push("Continue balanced daily practice with mixed review.");

  return signals;
}
