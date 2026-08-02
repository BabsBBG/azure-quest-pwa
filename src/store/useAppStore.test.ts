import { describe, expect, it } from "vitest";
import { chooseLatestActiveInterviewSession, chooseLatestRecoverableSession, isTerminalAssessmentStatus, localStorageKeyForOwner, normalizeAssessmentSession } from "./useAppStore";
import type { ActiveInterviewSession, AssessmentSession } from "../types";
import { northstarInventoryProject } from "../fixtures/northstarInventoryProject";

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

describe("local persistence owner scoping", () => {
  it("keeps anonymous learner data on the legacy-compatible PraxisGrid keys", () => {
    expect(localStorageKeyForOwner("attempts")).toBe("praxisgrid:attempts");
    expect(localStorageKeyForOwner("importedProjects", "anonymous")).toBe("praxisgrid:imported-projects");
  });

  it("partitions signed-in learner data by encoded auth user id", () => {
    expect(localStorageKeyForOwner("attempts", "user-123")).toBe("praxisgrid:user:user-123:attempts");
    expect(localStorageKeyForOwner("importedProjects", "auth0|owner@example.com")).toBe("praxisgrid:user:auth0%7Cowner%40example.com:imported-projects");
  });
});

const activeInterview = (patch: Partial<ActiveInterviewSession> = {}): ActiveInterviewSession => ({
  id: "active-interview-1",
  cert: "SC-300",
  sessionId: "iam-foundations",
  sessionTitle: "Identity administrator screen",
  role: "Identity Administrator",
  track: "IAM",
  startedAt: new Date(Date.now() - 120_000).toISOString(),
  updatedAt: new Date().toISOString(),
  targetMinutes: 30,
  elapsedSeconds: 120,
  currentIndex: 1,
  answers: { q1: "A practical answer with enough detail to recover." },
  submitted: { q1: true },
  checked: { q1: ["Uses project evidence"] },
  selfScores: { q1: 4 },
  selectedProjectIds: [northstarInventoryProject.id],
  status: "ACTIVE",
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

  it("recovers the newest active interview draft across local and cloud", () => {
    const localDraft = activeInterview({
      id: "local-draft",
      updatedAt: new Date(Date.now() - 60_000).toISOString()
    });
    const cloudDraft = activeInterview({
      id: "cloud-draft",
      updatedAt: new Date().toISOString(),
      elapsedSeconds: 240
    });

    expect(chooseLatestActiveInterviewSession(localDraft, cloudDraft)?.id).toBe("cloud-draft");
  });
});
