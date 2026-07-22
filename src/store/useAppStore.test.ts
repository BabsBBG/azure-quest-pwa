import { describe, expect, it } from "vitest";
import { chooseLatestRecoverableSession, isTerminalAssessmentStatus, normalizeAssessmentSession } from "./useAppStore";
import type { AssessmentSession } from "../types";

const session = (patch: Partial<AssessmentSession> = {}): AssessmentSession => ({
  id: "session-1",
  cert: "SC-300",
  mode: "quiz",
  kind: "quiz",
  title: "SC-300 Quick Quiz",
  focusTags: [],
  count: 10,
  minutes: 12,
  timeLimitSeconds: 720,
  questionIds: ["q1", "q2"],
  currentIndex: 0,
  answers: {},
  secondsByQuestion: {},
  markedQuestionIds: [],
  confidenceRatings: {},
  seed: "seed",
  startedAt: new Date(Date.now() - 60_000).toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  status: "ACTIVE",
  version: { schemaVersion: 1, appVersion: "0.1.0", storageNamespace: "praxisgrid" },
  ...patch
});

describe("assessment session helpers", () => {
  it("recognizes terminal statuses", () => {
    expect(isTerminalAssessmentStatus("SUBMITTED")).toBe(true);
    expect(isTerminalAssessmentStatus("EXPIRED")).toBe(true);
    expect(isTerminalAssessmentStatus("ABANDONED")).toBe(true);
    expect(isTerminalAssessmentStatus("ACTIVE")).toBe(false);
  });

  it("normalizes expired active sessions", () => {
    const expired = normalizeAssessmentSession(session({ expiresAt: new Date(Date.now() - 1000).toISOString() }));

    expect(expired?.status).toBe("EXPIRED");
  });

  it("keeps submitted sessions from being overwritten by stale active sessions", () => {
    const submitted = session({
      id: "submitted",
      status: "SUBMITTED",
      updatedAt: new Date(Date.now() - 10_000).toISOString(),
      submittedAt: new Date(Date.now() - 10_000).toISOString()
    });
    const staleActive = session({
      id: "active",
      status: "ACTIVE",
      updatedAt: new Date().toISOString()
    });

    expect(chooseLatestRecoverableSession(submitted, staleActive)?.id).toBe("submitted");
  });
});
