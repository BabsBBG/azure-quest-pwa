export type Cert = "SC-300" | "AZ-500" | "SC-500";
export type ExamMode = "timed" | "quiz" | "endless" | "weak" | "daily" | "case" | "kql";
export type Difficulty = "easy" | "medium" | "hard";
export type AttemptKind = "exam" | "quiz" | "daily" | "practice" | "scenario" | "case" | "kql";
export type JobTrack = "IAM" | "Cloud Security" | "SOC" | "Cloud SOC" | "Azure Security" | "Detection Engineering" | "AI Security";
export type UserRole = "MAIN_ADMIN" | "CONTENT_REVIEWER" | "SUPPORT_ADMIN" | "USER";

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
  confidence?: ConfidenceRating;
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
  assessmentSessionId?: string;
  cert: Cert;
  mode: ExamMode;
  kind: AttemptKind;
  title: string;
  blueprintId?: string;
  quizId?: string;
  focusDomain?: string;
  focusTags?: string[];
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

export type AssessmentSessionStatus = "ACTIVE" | "PAUSED" | "SUBMITTED" | "EXPIRED" | "ABANDONED";
export type ConfidenceRating = "GUESSING" | "UNSURE" | "FAIRLY_CONFIDENT" | "CERTAIN";

export interface AssessmentSessionVersionMetadata {
  schemaVersion: 1;
  appVersion: string;
  storageNamespace: "praxisgrid";
}

export interface AssessmentSession {
  id: string;
  cert: Cert;
  mode: ExamMode;
  kind: AttemptKind;
  title: string;
  blueprintId?: string;
  quizId?: string;
  focusDomain?: string;
  focusTags: string[];
  count: number;
  minutes: number;
  timeLimitSeconds: number;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, QuizOption["id"] | null>;
  secondsByQuestion: Record<string, number>;
  markedQuestionIds: string[];
  confidenceRatings: Record<string, ConfidenceRating>;
  seed: string;
  startedAt: string;
  updatedAt: string;
  expiresAt: string;
  status: AssessmentSessionStatus;
  version: AssessmentSessionVersionMetadata;
  submittedAttemptId?: string;
  submittedAt?: string;
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

export interface InterviewAnswerRecord {
  questionId: string;
  question: string;
  answer: string;
  selfScore: number;
  checkedRubric: string[];
  testing: string;
  track: JobTrack;
  phase: string;
  bestProjects: string[];
  answeredAt: string;
}

export interface InterviewSessionAttempt {
  id: string;
  cert: Cert;
  sessionId: string;
  sessionTitle: string;
  role: string;
  track: JobTrack;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  targetMinutes: number;
  score: number;
  total: number;
  percentage: number;
  projectIds: string[];
  answers: InterviewAnswerRecord[];
}

export interface QuestionFlag {
  id: string;
  cert: Cert;
  questionId: string;
  reason: "learner-review" | "incorrect" | "unclear" | "other";
  note?: string;
  createdAt: string;
  resolved?: boolean;
}

export interface ProjectStoryDraft {
  pitch30: string;
  walkthrough2m: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  architecture: string[];
  resumeBullets: string[];
  risks: string[];
}

export interface ImportedProject {
  id: string;
  owner: string;
  repo: string;
  url: string;
  defaultBranch: string;
  primaryLanguage: string | null;
  languages: string[];
  stars: number;
  readme: string;
  readmeExcerpt: string;
  contentHash: string;
  importedAt: string;
  status: "draft" | "reviewed" | "approved";
  storyDraft: ProjectStoryDraft;
}

export type SourceReviewStatus = "draft" | "critic-approved" | "approved" | "rejected";

export interface SourceDoc {
  id: string;
  cert: Cert;
  title: string;
  sourceUrl: string;
  contentHash: string;
  ingestedAt: string;
}

export interface SourceChunk {
  id: string;
  docId: string;
  cert: Cert;
  domain: string;
  sourceUrl: string;
  contentHash: string;
  embeddingHash: string;
  summary: string;
}

export interface GenerationRun {
  id: string;
  status: "draft" | "running" | "completed" | "failed" | "blocked";
  budgetCapCents: number;
  spentEstimateCents: number;
  killSwitchEnabled: boolean;
  batchQuestionLimit: number;
  maxSourceChunks: number;
  adminOnly: boolean;
  sourceHash: string;
  failureLog: string[];
  createdAt: string;
  completedAt?: string;
}

export interface SourceGroundedQuestion {
  id: string;
  runId?: string;
  cert: Cert;
  domain: string;
  difficulty: Difficulty;
  stem: string;
  options: QuizOption[];
  answer: QuizOption["id"];
  explanation: string;
  whyWrong: Partial<Record<QuizOption["id"], string>>;
  tags: string[];
  sourceChunkId: string;
  sourceUrl: string;
  duplicateKey: string;
  reviewStatus: SourceReviewStatus;
  criticNotes: string[];
  approvedAt?: string;
}

export interface ReadinessReport { cert: Cert; readiness: number; status: string; weakestDomain?: string; strongestDomain?: string; averageScore: number; examAverage: number; quizAverage: number; consistency: number; timeManagement: number; hardAccuracy: number; attempts: number; recommendation: string; }
