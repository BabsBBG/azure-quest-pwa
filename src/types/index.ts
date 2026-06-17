export type Cert = "SC-300" | "AZ-500" | "SC-500";
export type ExamMode = "timed" | "quiz" | "endless" | "weak" | "daily" | "case" | "kql";
export type Difficulty = "easy" | "medium" | "hard";
export type AttemptKind = "exam" | "quiz" | "daily" | "practice" | "scenario" | "case" | "kql";

export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: string;
  cert: Cert;
  domain: string;
  difficulty: Difficulty;
  scenarioOrg: string;
  stem: string;
  diagram?: string | null;
  options: QuizOption[];
  answer: QuizOption["id"];
  explanation: string;
  whyWrong: Partial<Record<QuizOption["id"], string>>;
  tags: string[];
}

export interface AnswerRecord {
  questionId: string;
  selected: QuizOption["id"] | null;
  correct: boolean;
  timeSeconds: number;
  domain: string;
  tags: string[];
}

export interface DomainBreakdown {
  correct: number;
  total: number;
}

export interface ExamAttempt {
  id: string;
  cert: Cert;
  mode: ExamMode;
  kind: AttemptKind;
  title: string;
  blueprintId?: string;
  quizId?: string;
  startedAt: string;
  completedAt: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  timeLimitSeconds?: number;
  xpEarned: number;
  readinessDelta?: number;
  mistakeTypes?: Record<string, number>;
  domains: Record<string, DomainBreakdown>;
  answers: AnswerRecord[];
  retakeSeed?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  readiness: Partial<Record<Cert, number>>;
  streak: number;
  lastStudyDate?: string;
  dailyGoal: number;
  completedToday: number;
  badges: string[];
  bestScores: Partial<Record<Cert, number>>;
  weakTags: Record<string, number>;
  completedResources: string[];
}

export interface SettingsState {
  darkMode: boolean;
  reduceAnimations: boolean;
  sound: boolean;
  lowBandwidth: boolean;
}

export interface FlashcardProgress {
  cardId: string;
  ease: number;
  dueAt: string;
  seen: number;
}

export interface ReadinessReport { cert: Cert; readiness: number; status: string; weakestDomain?: string; strongestDomain?: string; averageScore: number; examAverage: number; quizAverage: number; consistency: number; timeManagement: number; hardAccuracy: number; attempts: number; recommendation: string; }
