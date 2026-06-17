import { create } from "zustand";
import localforage from "localforage";
import questionBank from "../data/questions.json";
import type { Cert, ExamAttempt, FlashcardProgress, Question, SettingsState, UserProgress } from "../types";
import { levelFromXp } from "../utils/quizEngine";
import { todayKey } from "../lib/utils";

function dayDiff(from?: string, to = todayKey()) {
  if (!from) return undefined;
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

const STORAGE_KEYS = {
  progress: "azure-quest:progress",
  attempts: "azure-quest:attempts",
  settings: "azure-quest:settings",
  flashcards: "azure-quest:flashcards"
};

localforage.config({ name: "AzureQuest", storeName: "study_progress" });

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
  questions: Question[];
  attempts: ExamAttempt[];
  progress: UserProgress;
  settings: SettingsState;
  flashcards: Record<string, FlashcardProgress>;
  hydrate: () => Promise<void>;
  recordAttempt: (attempt: ExamAttempt) => Promise<void>;
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
  if (attempt.mode === "daily" && attempt.percentage >= 70) next.add("Daily Boss Hunter");
  if (attempt.kind === "quiz" && attempt.percentage >= 90) next.add("Quiz Ace");
  if (attempt.kind === "exam" && attempt.percentage >= 70) next.add("Exam Ready");
  if ((progress.readiness?.[attempt.cert] ?? 0) >= 80) next.add("Readiness Climber");
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

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  questions: questionBank as Question[],
  attempts: [],
  progress: defaultProgress,
  settings: defaultSettings,
  flashcards: {},

  hydrate: async () => {
    const [progress, attempts, settings, flashcards] = await Promise.all([
      localforage.getItem<UserProgress>(STORAGE_KEYS.progress),
      localforage.getItem<ExamAttempt[]>(STORAGE_KEYS.attempts),
      localforage.getItem<SettingsState>(STORAGE_KEYS.settings),
      localforage.getItem<Record<string, FlashcardProgress>>(STORAGE_KEYS.flashcards)
    ]);

    set({
      progress: progress ?? defaultProgress,
      attempts: attempts ?? [],
      settings: settings ?? defaultSettings,
      flashcards: flashcards ?? {},
      hydrated: true
    });
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
      localforage.setItem(STORAGE_KEYS.progress, nextProgress),
      localforage.setItem(STORAGE_KEYS.attempts, nextAttempts)
    ]);
  },

  setSettings: async (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    await localforage.setItem(STORAGE_KEYS.settings, settings);
  },

  toggleResource: async (resourceId) => {
    const progress = get().progress;
    const completedResources = progress.completedResources?.includes(resourceId)
      ? progress.completedResources.filter((id) => id !== resourceId)
      : [...(progress.completedResources ?? []), resourceId];
    const nextProgress = { ...progress, completedResources };
    set({ progress: nextProgress });
    await localforage.setItem(STORAGE_KEYS.progress, nextProgress);
  },

  recordFlashcard: async (cardId, rating) => {
    const current = get().flashcards[cardId] ?? { cardId, ease: 1, dueAt: new Date().toISOString(), seen: 0 };
    const ease = rating === "easy" ? Math.min(5, current.ease + 0.7) : Math.max(0.5, current.ease - 0.3);
    const hours = rating === "easy" ? 24 * ease : 4;
    const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const flashcards = { ...get().flashcards, [cardId]: { cardId, ease, dueAt, seen: current.seen + 1 } };
    set({ flashcards });
    await localforage.setItem(STORAGE_KEYS.flashcards, flashcards);
  },

  exportData: async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      progress: get().progress,
      attempts: get().attempts,
      settings: get().settings,
      flashcards: get().flashcards
    };
    return JSON.stringify(data, null, 2);
  },

  resetLocalData: async () => {
    await localforage.clear();
    set({ attempts: [], progress: defaultProgress, settings: defaultSettings, flashcards: {} });
  }
}));
