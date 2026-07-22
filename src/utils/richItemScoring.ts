import type { AssessmentItem, QuizOption } from "../types";

export type RichAnswer =
  | { type: "SINGLE_CHOICE"; selected: string | null }
  | { type: "MULTIPLE_CHOICE"; selected: QuizOption["id"][] }
  | { type: "ORDERING"; order: string[] }
  | { type: "MATCHING"; matches: Record<string, string> }
  | { type: "CASE_STUDY_QUESTION"; selected: string | null };

export function scoreRichItem(item: AssessmentItem, answer: RichAnswer) {
  if (item.type !== answer.type) return { score: 0, maxScore: 1, correct: false };

  if (item.type === "SINGLE_CHOICE" && answer.type === "SINGLE_CHOICE") {
    const selected = answer.selected;
    return { score: selected === item.answer ? 1 : 0, maxScore: 1, correct: selected === item.answer };
  }

  if (item.type === "CASE_STUDY_QUESTION" && answer.type === "CASE_STUDY_QUESTION") {
    const selected = answer.selected;
    return { score: selected === item.answer ? 1 : 0, maxScore: 1, correct: selected === item.answer };
  }

  if (item.type === "MULTIPLE_CHOICE" && answer.type === "MULTIPLE_CHOICE") {
    const selected = new Set(answer.selected);
    const required = new Set(item.answers);
    const exactCountMet = selected.size >= item.minSelections && selected.size <= item.maxSelections && selected.size === item.exactSelectionCount;
    const exact = exactCountMet && selected.size === required.size && [...required].every((id) => selected.has(id));
    if (exact || !item.allowPartialCredit) return { score: exact ? 1 : 0, maxScore: 1, correct: exact };

    const correctSelections = [...selected].filter((id) => required.has(id)).length;
    const wrongSelections = [...selected].filter((id) => !required.has(id)).length;
    const partial = Math.max(0, correctSelections - wrongSelections) / required.size;
    return { score: roundScore(partial), maxScore: 1, correct: false };
  }

  if (item.type === "ORDERING" && answer.type === "ORDERING") {
    const exact = item.correctOrder.every((id, index) => answer.order[index] === id);
    if (exact || !item.allowPartialCredit) return { score: exact ? 1 : 0, maxScore: 1, correct: exact };
    const positioned = item.correctOrder.filter((id, index) => answer.order[index] === id).length;
    return { score: roundScore(positioned / item.correctOrder.length), maxScore: 1, correct: false };
  }

  if (item.type === "MATCHING" && answer.type === "MATCHING") {
    const promptIds = item.prompts.map((prompt) => prompt.id);
    const exact = promptIds.every((promptId) => answer.matches[promptId] === item.correctMatches[promptId]);
    if (exact || !item.allowPartialCredit) return { score: exact ? 1 : 0, maxScore: 1, correct: exact };
    const matched = promptIds.filter((promptId) => answer.matches[promptId] === item.correctMatches[promptId]).length;
    return { score: roundScore(matched / promptIds.length), maxScore: 1, correct: false };
  }

  return { score: 0, maxScore: 1, correct: false };
}

function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}
