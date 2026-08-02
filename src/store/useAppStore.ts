import { create } from "zustand";
import localforage from "localforage";
import questionBank from "../data/questions.json";
import type { ActiveInterviewSession, AssessmentSession, AssessmentSessionStatus, Cert, ExamAttempt, FlashcardProgress, ImportedProject, InterviewSessionAttempt, Question, QuestionFlag, SettingsState, UserProgress } from "../types";
import { levelFromXp } from "../utils/quizEngine";
import { todayKey } from "../lib/utils";
import { clearActiveInterviewSession as deleteCloudActiveInterviewSession, deleteImportedProject as deleteCloudImportedProject, fetchCloudLearningData, syncActiveInterviewSession, syncAssessmentSession, syncExamAttempt, syncImportedProject, syncInterviewSession, syncQuestionFlag } from "../lib/cloudSync";

function dayDiff(from?: string, to = todayKey()) {
  if (!from) return undefined;
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

const STORAGE_KEYS = {
  progress: "praxisgrid:progress",
  attempts: "praxisgrid:attempts",
  settings: "praxisgrid:settings",
  flashcards: "praxisgrid:flashcards",
  interviewSessions: "praxisgrid:interview-sessions",
  questionFlags: "praxisgrid:question-flags",
  importedProjects: "praxisgrid:imported-projects",
  assessmentSession: "praxisgrid:assessment-session",
  activeInterviewSession: "praxisgrid:active-interview-session",
  migration: "praxisgrid:migration:v1"
};

const LEGACY_STORAGE_KEYS = {
  progress: "azure-quest:progress",
  attempts: "azure-quest:attempts",
  settings: "azure-quest:settings",
  flashcards: "azure-quest:flashcards",
  interviewSessions: "azure-quest:interview-sessions",
  questionFlags: "azure-quest:question-flags",
  importedProjects: "azure-quest:imported-projects",
  assessmentSession: "azure-quest:assessment-session",
  activeInterviewSession: "azure-quest:active-interview-session"
};

const legacyForage = localforage.createInstance({ name: "AzureQuest", storeName: "study_progress" });

localforage.config({ name: "PraxisGrid", storeName: "learning_progress" });

export const ANONYMOUS_STORAGE_OWNER = "anonymous";
const ownerScopedKeys = Object.keys(LEGACY_STORAGE_KEYS) as Array<keyof typeof LEGACY_STORAGE_KEYS>;

export function localStorageKeyForOwner(key: keyof typeof LEGACY_STORAGE_KEYS, ownerId = ANONYMOUS_STORAGE_OWNER) {
  if (!ownerId || ownerId === ANONYMOUS_STORAGE_OWNER) return STORAGE_KEYS[key];
  const suffix = STORAGE_KEYS[key].replace(/^praxisgrid:/, "");
  return `praxisgrid:user:${encodeURIComponent(ownerId)}:${suffix}`;
}

function migrationStorageKey(ownerId = ANONYMOUS_STORAGE_OWNER) {
  if (!ownerId || ownerId === ANONYMOUS_STORAGE_OWNER) return STORAGE_KEYS.migration;
  return `praxisgrid:user:${encodeURIComponent(ownerId)}:migration:v1`;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  readiness: { "SC-300": 0, "AZ-500": 0, "SC-500": 0 },
  streak: 0,
  dailyGoal: 10,
  completedToday: 0,
  badges: [],
  bestScores: {},
  weakTags: {},
  completedResources: []
};

const defaultSettings: SettingsState = {
  darkMode: true,
  reduceAnimations: false,
  sound: false,
  lowBandwidth: false
};

interface AppStore {
  hydrated: boolean;
  storageOwnerId: string;
  questions: Question[];
  attempts: ExamAttempt[];
  progress: UserProgress;
  settings: SettingsState;
  flashcards: Record<string, FlashcardProgress>;
  interviewSessions: InterviewSessionAttempt[];
  questionFlags: QuestionFlag[];
  importedProjects: ImportedProject[];
  assessmentSession: AssessmentSession | null;
  activeInterviewSession: ActiveInterviewSession | null;
  hydrate: (ownerId?: string) => Promise<void>;
  recordAttempt: (attempt: ExamAttempt) => Promise<void>;
  saveAssessmentSession: (session: AssessmentSession) => Promise<void>;
  updateAssessmentSession: (sessionId: string, patch: Partial<AssessmentSession>) => Promise<void>;
  finishAssessmentSession: (sessionId: string, status: Extract<AssessmentSessionStatus, "SUBMITTED" | "EXPIRED" | "ABANDONED">, submittedAttemptId?: string) => Promise<void>;
  recordInterviewSession: (session: InterviewSessionAttempt) => Promise<void>;
  saveActiveInterviewSession: (session: ActiveInterviewSession) => Promise<void>;
  clearActiveInterviewSession: (sessionId?: string) => Promise<void>;
  recordQuestionFlag: (flag: QuestionFlag) => Promise<void>;
  recordImportedProject: (project: ImportedProject) => Promise<void>;
  deleteImportedProject: (projectId: string) => Promise<void>;
  setSettings: (settings: Partial<SettingsState>) => Promise<void>;
  recordFlashcard: (cardId: string, rating: "easy" | "hard") => Promise<void>;
  toggleResource: (resourceId: string) => Promise<void>;
  exportData: () => Promise<string>;
  resetLocalData: () => Promise<void>;
}

function badgesFor(progress: UserProgress, attempt: ExamAttempt) {
  const next = new Set(progress.badges);
  if (progress.streak >= 3) next.add("Streak Spark");
  if (attempt.cert === "SC-300" && attempt.percentage >= 80) next.add("Entra Guardian");
  if (attempt.cert === "AZ-500" && attempt.percentage >= 80) next.add("Sentinel Slayer");
  if (attempt.cert === "SC-500" && attempt.percentage >= 80) next.add("Cloud AI Defender");
  if (Object.values(attempt.domains).every((d) => d.total > 0 && d.correct / d.total >= 0.8)) next.add("Least Privilege Legend");
  if (attempt.mode === "weak" && attempt.percentage >= 70) next.add("Weakness Crusher");
  if (attempt.mode === "daily" && attempt.percentage >= 70) next.add("Daily Practice Complete");
  if (attempt.kind === "quiz" && attempt.percentage >= 90) next.add("Quiz Ace");
  if (attempt.kind === "exam" && attempt.percentage >= 70) next.add("Exam Ready");
  if ((progress.readiness?.[attempt.cert] ?? 0) >= 80) next.add("Progress Climber");
  return [...next];
}

function updateWeakTags(progress: UserProgress, attempt: ExamAttempt) {
  const weakTags = { ...progress.weakTags };
  for (const answer of attempt.answers) {
    for (const tag of answer.tags) {
      const current = weakTags[tag] ?? 0;
      weakTags[tag] = Math.max(0, current + (answer.correct ? -1 : 2));
    }
  }
  return weakTags;
}

function mergeById<T extends { id: string }>(localItems: T[], cloudItems: T[], limit: number) {
  const merged = new Map<string, T>();
  for (const item of cloudItems) merged.set(item.id, item);
  for (const item of localItems) merged.set(item.id, item);
  return [...merged.values()].slice(0, limit);
}

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}

function defaultStatePatch() {
  return {
    attempts: [],
    progress: defaultProgress,
    settings: defaultSettings,
    flashcards: {},
    interviewSessions: [],
    questionFlags: [],
    importedProjects: [],
    assessmentSession: null,
    activeInterviewSession: null
  };
}

export function isTerminalAssessmentStatus(status: AssessmentSessionStatus) {
  return status === "SUBMITTED" || status === "EXPIRED" || status === "ABANDONED";
}

export function normalizeAssessmentSession(session?: AssessmentSession | null) {
  if (!session) return null;
  if (isTerminalAssessmentStatus(session.status)) return session;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return { ...session, status: "EXPIRED" as const, updatedAt: new Date().toISOString() };
  }
  return session;
}

export function chooseLatestRecoverableSession(localSession: AssessmentSession | null, cloudSession: AssessmentSession | null) {
  if (localSession?.status === "SUBMITTED" || cloudSession?.status === "SUBMITTED") {
    return localSession?.status === "SUBMITTED" ? localSession : cloudSession;
  }

  const recoverable = [localSession, cloudSession]
    .filter((session): session is AssessmentSession => Boolean(session))
    .filter((session) => session.status === "ACTIVE" || session.status === "PAUSED" || session.status === "EXPIRED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return recoverable[0] ?? null;
}

export function chooseLatestActiveInterviewSession(localSession: ActiveInterviewSession | null, cloudSession: ActiveInterviewSession | null) {
  return [localSession, cloudSession]
    .filter((session): session is ActiveInterviewSession => Boolean(session))
    .filter((session) => session.status === "ACTIVE" || session.status === "PAUSED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null;
}

async function readWithLegacyFallback<T>(key: keyof typeof LEGACY_STORAGE_KEYS, ownerId: string) {
  const current = await localforage.getItem<T>(localStorageKeyForOwner(key, ownerId));
  if (current !== null && current !== undefined) return current;
  if (ownerId !== ANONYMOUS_STORAGE_OWNER) return null;
  return legacyForage.getItem<T>(LEGACY_STORAGE_KEYS[key]);
}

async function migrateLegacyStorage(ownerId: string) {
  if (ownerId !== ANONYMOUS_STORAGE_OWNER) return;
  const complete = await localforage.getItem<{ completedAt: string }>(migrationStorageKey(ownerId));
  if (complete) return;

  const migrated = await Promise.all(
    ownerScopedKeys.map(async (key) => {
      const current = await localforage.getItem(localStorageKeyForOwner(key, ownerId));
      if (current !== null && current !== undefined) return [key, false] as const;
      const legacy = await legacyForage.getItem(LEGACY_STORAGE_KEYS[key]);
      if (legacy === null || legacy === undefined) return [key, false] as const;
      await localforage.setItem(localStorageKeyForOwner(key, ownerId), legacy);
      const verified = await localforage.getItem(localStorageKeyForOwner(key, ownerId));
      return [key, verified !== null && verified !== undefined] as const;
    })
  );

  await localforage.setItem(migrationStorageKey(ownerId), {
    completedAt: new Date().toISOString(),
    copiedKeys: migrated.filter(([, copied]) => copied).map(([key]) => key),
    legacyPreserved: true
  });
}

async function removeOwnerStorage(ownerId: string) {
  await Promise.all([
    ...ownerScopedKeys.map((key) => localforage.removeItem(localStorageKeyForOwner(key, ownerId))),
    localforage.removeItem(migrationStorageKey(ownerId))
  ]);
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  storageOwnerId: ANONYMOUS_STORAGE_OWNER,
  questions: questionBank as Question[],
  attempts: [],
  progress: defaultProgress,
  settings: defaultSettings,
  flashcards: {},
  interviewSessions: [],
  questionFlags: [],
  importedProjects: [],
  assessmentSession: null,
  activeInterviewSession: null,

  hydrate: async (ownerId = ANONYMOUS_STORAGE_OWNER) => {
    const storageOwnerId = ownerId || ANONYMOUS_STORAGE_OWNER;
    set({ ...defaultStatePatch(), hydrated: false, storageOwnerId });
    await migrateLegacyStorage(storageOwnerId);
    const [progress, attempts, settings, flashcards, interviewSessions, questionFlags, importedProjects, assessmentSession, activeInterviewSession] = await Promise.all([
      readWithLegacyFallback<UserProgress>("progress", storageOwnerId),
      readWithLegacyFallback<ExamAttempt[]>("attempts", storageOwnerId),
      readWithLegacyFallback<SettingsState>("settings", storageOwnerId),
      readWithLegacyFallback<Record<string, FlashcardProgress>>("flashcards", storageOwnerId),
      readWithLegacyFallback<InterviewSessionAttempt[]>("interviewSessions", storageOwnerId),
      readWithLegacyFallback<QuestionFlag[]>("questionFlags", storageOwnerId),
      readWithLegacyFallback<ImportedProject[]>("importedProjects", storageOwnerId),
      readWithLegacyFallback<AssessmentSession>("assessmentSession", storageOwnerId),
      readWithLegacyFallback<ActiveInterviewSession>("activeInterviewSession", storageOwnerId)
    ]);

    const localAttempts = attempts ?? [];
    const localInterviewSessions = interviewSessions ?? [];
    const localQuestionFlags = questionFlags ?? [];
    const localImportedProjects = importedProjects ?? [];
    const localAssessmentSession = normalizeAssessmentSession(assessmentSession);
    const localActiveInterviewSession = activeInterviewSession ?? null;

    set({
      progress: progress ?? defaultProgress,
      attempts: localAttempts,
      settings: settings ?? defaultSettings,
      flashcards: flashcards ?? {},
      interviewSessions: localInterviewSessions,
      questionFlags: localQuestionFlags,
      importedProjects: localImportedProjects,
      assessmentSession: localAssessmentSession,
      activeInterviewSession: localActiveInterviewSession,
      hydrated: true
    });
    if (localAssessmentSession) await localforage.setItem(localStorageKeyForOwner("assessmentSession", storageOwnerId), localAssessmentSession);
    if (localActiveInterviewSession) await localforage.setItem(localStorageKeyForOwner("activeInterviewSession", storageOwnerId), localActiveInterviewSession);

    try {
      const cloudData = await fetchCloudLearningData();
      const mergedAttempts = mergeById(localAttempts, cloudData.attempts, 200);
      const mergedInterviewSessions = mergeById(localInterviewSessions, cloudData.interviewSessions, 100);
      const mergedQuestionFlags = mergeById(localQuestionFlags, cloudData.questionFlags, 500);
      const mergedImportedProjects = mergeById(localImportedProjects, cloudData.importedProjects, 50);
      const cloudAssessmentSession = normalizeAssessmentSession(cloudData.assessmentSession);
      const mergedAssessmentSession = chooseLatestRecoverableSession(localAssessmentSession, cloudAssessmentSession);
      const mergedActiveInterviewSession = chooseLatestActiveInterviewSession(localActiveInterviewSession, cloudData.activeInterviewSession);
      set({
        attempts: mergedAttempts,
        interviewSessions: mergedInterviewSessions,
        questionFlags: mergedQuestionFlags,
        importedProjects: mergedImportedProjects,
        assessmentSession: mergedAssessmentSession,
        activeInterviewSession: mergedActiveInterviewSession
      });
      await Promise.all([
        localforage.setItem(localStorageKeyForOwner("attempts", storageOwnerId), mergedAttempts),
        localforage.setItem(localStorageKeyForOwner("interviewSessions", storageOwnerId), mergedInterviewSessions),
        localforage.setItem(localStorageKeyForOwner("questionFlags", storageOwnerId), mergedQuestionFlags),
        localforage.setItem(localStorageKeyForOwner("importedProjects", storageOwnerId), mergedImportedProjects),
        mergedAssessmentSession ? localforage.setItem(localStorageKeyForOwner("assessmentSession", storageOwnerId), mergedAssessmentSession) : Promise.resolve(),
        mergedActiveInterviewSession
          ? localforage.setItem(localStorageKeyForOwner("activeInterviewSession", storageOwnerId), mergedActiveInterviewSession)
          : localforage.removeItem(localStorageKeyForOwner("activeInterviewSession", storageOwnerId))
      ]);
    } catch {
      // Local study mode remains authoritative if cloud sync is unavailable.
    }
  },

  saveAssessmentSession: async (session) => {
    const current = get().assessmentSession;
    if (current?.id === session.id && isTerminalAssessmentStatus(current.status) && !isTerminalAssessmentStatus(session.status)) return;
    set({ assessmentSession: session });
    await localforage.setItem(localStorageKeyForOwner("assessmentSession", get().storageOwnerId), session);
    void syncAssessmentSession(session).catch(() => undefined);
  },

  updateAssessmentSession: async (sessionId, patch) => {
    const current = get().assessmentSession;
    if (!current || current.id !== sessionId) return;
    if (isTerminalAssessmentStatus(current.status) && (!patch.status || !isTerminalAssessmentStatus(patch.status))) return;
    const next = { ...current, ...patch, id: current.id, updatedAt: patch.updatedAt ?? new Date().toISOString() };
    set({ assessmentSession: next });
    await localforage.setItem(localStorageKeyForOwner("assessmentSession", get().storageOwnerId), next);
    void syncAssessmentSession(next).catch(() => undefined);
  },

  finishAssessmentSession: async (sessionId, status, submittedAttemptId) => {
    const current = get().assessmentSession;
    if (!current || current.id !== sessionId) return;
    if (current.status === "SUBMITTED" && status !== "SUBMITTED") return;
    const now = new Date().toISOString();
    const next = {
      ...current,
      status,
      submittedAttemptId: submittedAttemptId ?? current.submittedAttemptId,
      submittedAt: status === "SUBMITTED" ? now : current.submittedAt,
      updatedAt: now
    };
    set({ assessmentSession: next });
    await localforage.setItem(localStorageKeyForOwner("assessmentSession", get().storageOwnerId), next);
    void syncAssessmentSession(next).catch(() => undefined);
  },

  recordAttempt: async (attempt) => {
    const { progress, attempts } = get();
    const today = todayKey();
    const studiedTodayAlready = progress.lastStudyDate === today;
    const completedToday = studiedTodayAlready ? progress.completedToday + attempt.total : attempt.total;
    const diff = dayDiff(progress.lastStudyDate, today);
    const streak = studiedTodayAlready ? progress.streak : diff === 1 ? progress.streak + 1 : 1;
    const xp = progress.xp + attempt.xpEarned;
    const currentReadiness = progress.readiness?.[attempt.cert] ?? 0;
    const readinessGain = attempt.readinessDelta ?? Math.max(1, Math.round((attempt.percentage - 50) / 10));

    const nextProgress: UserProgress = {
      ...progress,
      xp,
      level: levelFromXp(xp),
      readiness: {
        ...(progress.readiness ?? {}),
        [attempt.cert]: Math.min(100, Math.max(0, Math.round(currentReadiness * 0.72 + attempt.percentage * 0.24 + readinessGain)))
      },
      streak,
      lastStudyDate: today,
      completedToday,
      bestScores: {
        ...progress.bestScores,
        [attempt.cert]: Math.max(progress.bestScores[attempt.cert as Cert] ?? 0, attempt.percentage)
      },
      weakTags: updateWeakTags(progress, attempt)
    };
    nextProgress.badges = badgesFor(nextProgress, attempt);

    const nextAttempts = [attempt, ...attempts].slice(0, 200);
    set({ progress: nextProgress, attempts: nextAttempts });
    await Promise.all([
      localforage.setItem(localStorageKeyForOwner("progress", get().storageOwnerId), nextProgress),
      localforage.setItem(localStorageKeyForOwner("attempts", get().storageOwnerId), nextAttempts)
    ]);
    void syncExamAttempt(attempt).catch(() => undefined);
  },

  recordInterviewSession: async (session) => {
    const interviewSessions = [session, ...get().interviewSessions].slice(0, 100);
    set({ interviewSessions });
    await localforage.setItem(localStorageKeyForOwner("interviewSessions", get().storageOwnerId), interviewSessions);
    void syncInterviewSession(session).catch(() => undefined);
  },

  saveActiveInterviewSession: async (session) => {
    set({ activeInterviewSession: session });
    try {
      await localforage.setItem(localStorageKeyForOwner("activeInterviewSession", get().storageOwnerId), session);
    } catch {
      // Some test or constrained browser contexts lack IndexedDB/localStorage drivers.
    }
    void syncActiveInterviewSession(session).catch(() => undefined);
  },

  clearActiveInterviewSession: async (sessionId) => {
    const id = sessionId ?? get().activeInterviewSession?.id;
    set({ activeInterviewSession: null });
    try {
      await localforage.removeItem(localStorageKeyForOwner("activeInterviewSession", get().storageOwnerId));
    } catch {
      // Keep UI state cleared even if local storage is unavailable.
    }
    if (id) void deleteCloudActiveInterviewSession(id).catch(() => undefined);
  },

  recordQuestionFlag: async (flag) => {
    const questionFlags = [flag, ...get().questionFlags.filter((item) => item.id !== flag.id)].slice(0, 500);
    set({ questionFlags });
    await localforage.setItem(localStorageKeyForOwner("questionFlags", get().storageOwnerId), questionFlags);
    void syncQuestionFlag(flag).catch(() => undefined);
  },

  recordImportedProject: async (project) => {
    const importedProjects = [project, ...get().importedProjects.filter((item) => item.id !== project.id)].slice(0, 50);
    set({ importedProjects });
    await localforage.setItem(localStorageKeyForOwner("importedProjects", get().storageOwnerId), importedProjects);
    void syncImportedProject(project).catch(() => undefined);
  },

  deleteImportedProject: async (projectId) => {
    const current = get().importedProjects.find((project) => project.id === projectId);
    const importedProjects = get().importedProjects.filter((project) => project.id !== projectId);
    set({ importedProjects });
    await localforage.setItem(localStorageKeyForOwner("importedProjects", get().storageOwnerId), importedProjects);
    if (current) {
      const result = await deleteCloudImportedProject(current);
      if (!result.ok && !result.skipped) {
        throw new Error(errorMessage("error" in result ? result.error : undefined, "Cloud repository analysis delete failed."));
      }
    }
  },

  setSettings: async (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    await localforage.setItem(localStorageKeyForOwner("settings", get().storageOwnerId), settings);
  },

  toggleResource: async (resourceId) => {
    const progress = get().progress;
    const completedResources = progress.completedResources?.includes(resourceId)
      ? progress.completedResources.filter((id) => id !== resourceId)
      : [...(progress.completedResources ?? []), resourceId];
    const nextProgress = { ...progress, completedResources };
    set({ progress: nextProgress });
    await localforage.setItem(localStorageKeyForOwner("progress", get().storageOwnerId), nextProgress);
  },

  recordFlashcard: async (cardId, rating) => {
    const current = get().flashcards[cardId] ?? { cardId, ease: 1, dueAt: new Date().toISOString(), seen: 0 };
    const ease = rating === "easy" ? Math.min(5, current.ease + 0.7) : Math.max(0.5, current.ease - 0.3);
    const hours = rating === "easy" ? 24 * ease : 4;
    const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const flashcards = { ...get().flashcards, [cardId]: { cardId, ease, dueAt, seen: current.seen + 1 } };
    set({ flashcards });
    await localforage.setItem(localStorageKeyForOwner("flashcards", get().storageOwnerId), flashcards);
  },

  exportData: async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      progress: get().progress,
      attempts: get().attempts,
      settings: get().settings,
      flashcards: get().flashcards,
      interviewSessions: get().interviewSessions,
      questionFlags: get().questionFlags,
      importedProjects: get().importedProjects,
      assessmentSession: get().assessmentSession,
      activeInterviewSession: get().activeInterviewSession
    };
    return JSON.stringify(data, null, 2);
  },

  resetLocalData: async () => {
    const storageOwnerId = get().storageOwnerId;
    await removeOwnerStorage(storageOwnerId);
    set({ ...defaultStatePatch(), hydrated: true, storageOwnerId });
  }
}));
