import { describe, expect, it, vi } from "vitest";
import { scoreAttempt } from "./quizEngine";
import type { Question } from "../types";

const question = (id: string, answer: "A" | "B" | "C" | "D"): Question => ({
  id,
  cert: "SC-300",
  domain: "Identity governance",
  difficulty: "medium",
  scenarioOrg: "Contoso",
  stem: `Question ${id}`,
  diagram: null,
  options: [
    { id: "A", text: "Option A" },
    { id: "B", text: "Option B" },
    { id: "C", text: "Option C" },
    { id: "D", text: "Option D" }
  ],
  answer,
  explanation: "Explanation",
  whyWrong: {},
  tags: ["identity"]
});

describe("scoreAttempt", () => {
  it("scores unanswered questions as incorrect", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "test-attempt" });
    const attempt = scoreAttempt({
      cert: "SC-300",
      mode: "quiz",
      startedAt: new Date(Date.now() - 60_000).toISOString(),
      seed: "seed",
      questions: [question("q1", "A"), question("q2", "B")],
      selections: { q1: "A", q2: null },
      secondsByQuestion: { q1: 20, q2: 0 }
    });

    expect(attempt.score).toBe(1);
    expect(attempt.total).toBe(2);
    expect(attempt.percentage).toBe(50);
    expect(attempt.answers[1].correct).toBe(false);
  });

  it("persists confidence ratings on answer records", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "confidence-attempt" });
    const attempt = scoreAttempt({
      cert: "SC-300",
      mode: "quiz",
      startedAt: new Date(Date.now() - 30_000).toISOString(),
      seed: "seed",
      questions: [question("q1", "A")],
      selections: { q1: "A" },
      confidenceRatings: { q1: "CERTAIN" },
      secondsByQuestion: { q1: 12 }
    });

    expect(attempt.answers[0].confidence).toBe("CERTAIN");
  });
});
