import { describe, expect, it } from "vitest";
import type { AssessmentItem } from "../types";
import { scoreRichItem } from "./richItemScoring";

const base = {
  id: "item",
  cert: "SC-300" as const,
  domain: "Identity",
  difficulty: "medium" as const,
  stem: "Stem",
  explanation: "Explanation",
  tags: ["identity"],
  walkthroughOnly: true
};

describe("scoreRichItem", () => {
  it("scores multiple-choice exact and partial selections", () => {
    const item: AssessmentItem = {
      ...base,
      type: "MULTIPLE_CHOICE",
      options: [
        { id: "A", text: "A" },
        { id: "B", text: "B" },
        { id: "C", text: "C" },
        { id: "D", text: "D" }
      ],
      answers: ["A", "C"],
      minSelections: 2,
      maxSelections: 2,
      exactSelectionCount: 2,
      allowPartialCredit: true,
      whyWrong: {}
    };

    expect(scoreRichItem(item, { type: "MULTIPLE_CHOICE", selected: ["A", "C"] })).toMatchObject({ score: 1, correct: true });
    expect(scoreRichItem(item, { type: "MULTIPLE_CHOICE", selected: ["A", "B"] })).toMatchObject({ score: 0, correct: false });
  });

  it("scores ordering with partial position credit", () => {
    const item: AssessmentItem = {
      ...base,
      type: "ORDERING",
      choices: [
        { id: "first", text: "First" },
        { id: "second", text: "Second" },
        { id: "third", text: "Third" }
      ],
      correctOrder: ["first", "second", "third"],
      allowPartialCredit: true
    };

    expect(scoreRichItem(item, { type: "ORDERING", order: ["first", "third", "second"] })).toMatchObject({ score: 0.33, correct: false });
  });

  it("scores matching with partial credit", () => {
    const item: AssessmentItem = {
      ...base,
      type: "MATCHING",
      prompts: [
        { id: "role-a", text: "Role A" },
        { id: "role-b", text: "Role B" }
      ],
      matches: [
        { id: "perm-a", text: "Permission A" },
        { id: "perm-b", text: "Permission B" }
      ],
      correctMatches: { "role-a": "perm-a", "role-b": "perm-b" },
      allowPartialCredit: true
    };

    expect(scoreRichItem(item, { type: "MATCHING", matches: { "role-a": "perm-a", "role-b": "perm-a" } })).toMatchObject({ score: 0.5, correct: false });
  });
});
