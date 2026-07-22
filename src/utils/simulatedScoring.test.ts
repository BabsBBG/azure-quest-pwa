import { describe, expect, it } from "vitest";
import type { AnswerRecord, DomainBreakdown } from "../types";
import { adaptationSignals, confidenceInsights, simulatedScore } from "./simulatedScoring";

const answer = (patch: Partial<AnswerRecord>): AnswerRecord => ({
  questionId: "q",
  selected: "A",
  correct: true,
  confidence: "CERTAIN",
  timeSeconds: 10,
  domain: "Identity",
  tags: ["identity"],
  ...patch
});

describe("simulatedScoring", () => {
  it("counts confidence ratings", () => {
    expect(confidenceInsights([answer({ confidence: "CERTAIN" }), answer({ confidence: "GUESSING" })])).toEqual({
      GUESSING: 1,
      UNSURE: 0,
      FAIRLY_CONFIDENT: 0,
      CERTAIN: 1
    });
  });

  it("keeps simulated score on the 1-1000 style scale", () => {
    const score = simulatedScore({ percentage: 82, answers: [answer({}), answer({ correct: false, confidence: "CERTAIN" })], hardQuestionCount: 2 });

    expect(score).toBeGreaterThanOrEqual(100);
    expect(score).toBeLessThanOrEqual(1000);
  });

  it("creates adaptation signals from misconceptions and weak domains", () => {
    const domains: Record<string, DomainBreakdown> = { Identity: { correct: 1, total: 3 } };
    const signals = adaptationSignals({
      percentage: 50,
      domains,
      answers: [answer({ correct: false, confidence: "CERTAIN" }), answer({ correct: true, confidence: "UNSURE" })]
    });

    expect(signals.join(" ")).toContain("misconceptions");
    expect(signals.join(" ")).toContain("fragile knowledge");
    expect(signals.join(" ")).toContain("Identity");
  });
});
