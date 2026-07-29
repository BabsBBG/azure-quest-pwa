import { isSupabaseConfigured, supabase } from "./supabase";
import type { ActiveInterviewSession, AssessmentSession, ExamAttempt, ImportedProject, InterviewSessionAttempt, QuestionFlag } from "../types";

async function currentUserId() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function upsertProfile(args: { email?: string | null; fullName?: string | null }) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email: args.email ?? null,
    full_name: args.fullName ?? null,
    updated_at: new Date().toISOString()
  });

  return { ok: !error, skipped: false, error };
}

export async function syncExamAttempt(attempt: ExamAttempt) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("quiz_attempts").upsert({
    id: attempt.id,
    user_id: userId,
    cert: attempt.cert,
    mode: attempt.mode,
    kind: attempt.kind,
    title: attempt.title,
    completed_at: attempt.completedAt,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    payload: attempt
  });

  return { ok: !error, skipped: false, error };
}

export async function syncInterviewSession(session: InterviewSessionAttempt) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("interview_sessions").upsert({
    id: session.id,
    user_id: userId,
    cert: session.cert,
    track: session.track,
    session_title: session.sessionTitle,
    completed_at: session.completedAt,
    score: session.score,
    total: session.total,
    percentage: session.percentage,
    payload: session
  });

  return { ok: !error, skipped: false, error };
}

export async function syncActiveInterviewSession(session: ActiveInterviewSession) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("active_interview_sessions").upsert({
    id: session.id,
    user_id: userId,
    cert: session.cert,
    track: session.track,
    session_title: session.sessionTitle,
    status: session.status,
    started_at: session.startedAt,
    updated_at: session.updatedAt,
    payload: session
  });

  return { ok: !error, skipped: false, error };
}

export async function clearActiveInterviewSession(sessionId: string) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("active_interview_sessions").delete().eq("id", sessionId).eq("user_id", userId);
  return { ok: !error, skipped: false, error };
}

export async function syncQuestionFlag(flag: QuestionFlag) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("question_flags").upsert({
    id: flag.id,
    user_id: userId,
    cert: flag.cert,
    question_id: flag.questionId,
    reason: flag.reason,
    note: flag.note ?? null,
    resolved: flag.resolved ?? false,
    created_at: flag.createdAt,
    payload: flag
  });

  return { ok: !error, skipped: false, error };
}

export async function syncAssessmentSession(session: AssessmentSession) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("assessment_sessions").upsert({
    id: session.id,
    user_id: userId,
    cert: session.cert,
    mode: session.mode,
    kind: session.kind,
    title: session.title,
    status: session.status,
    started_at: session.startedAt,
    updated_at: session.updatedAt,
    expires_at: session.expiresAt,
    submitted_attempt_id: session.submittedAttemptId ?? null,
    payload: session
  });

  return { ok: !error, skipped: false, error };
}

export async function syncImportedProject(project: ImportedProject) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const rowId = importedProjectRowId(userId, project);
  const analysisRowId = importedProjectAnalysisRowId(userId, project);
  const { error } = await supabase.from("imported_projects").upsert({
    id: rowId,
    user_id: userId,
    owner: project.owner,
    repo: project.repo,
    source_url: project.url,
    content_hash: project.contentHash,
    status: project.status,
    imported_at: project.importedAt,
    payload: project
  });

  if (error) return { ok: false, skipped: false, error };

  const { error: analysisError } = await supabase.from("project_intelligence_analyses").upsert({
    id: analysisRowId,
    user_id: userId,
    imported_project_id: rowId,
    content_hash: project.contentHash,
    status: project.analysis.status,
    generated_at: project.analysis.generatedAt,
    payload: project.analysis
  });

  return { ok: !analysisError, skipped: false, error: analysisError };
}

export function importedProjectRowId(userId: string, project: Pick<ImportedProject, "id" | "contentHash">) {
  return `${userId}:${project.contentHash || project.id}`;
}

export function importedProjectAnalysisRowId(userId: string, project: ImportedProject) {
  return `${userId}:${project.analysis.id}`;
}

export async function deleteImportedProject(project: ImportedProject) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };
  const rowId = importedProjectRowId(userId, project);
  const analysisRowId = importedProjectAnalysisRowId(userId, project);
  const analysis = await supabase.from("project_intelligence_analyses").delete().eq("user_id", userId).eq("id", analysisRowId).eq("imported_project_id", rowId);
  if (analysis.error) return { ok: false, skipped: false, error: analysis.error };
  const imported = await supabase.from("imported_projects").delete().eq("user_id", userId).eq("id", rowId);
  return { ok: !imported.error, skipped: false, error: imported.error };
}

export async function fetchCloudLearningData() {
  const userId = await currentUserId();
  if (!userId || !supabase) return { attempts: [], interviewSessions: [], questionFlags: [], importedProjects: [], assessmentSession: null, activeInterviewSession: null };

  const [attemptsResult, interviewsResult, flagsResult, projectsResult, assessmentSessionResult, activeInterviewResult] = await Promise.all([
    supabase.from("quiz_attempts").select("payload").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("interview_sessions").select("payload").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("question_flags").select("payload").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("imported_projects").select("payload").eq("user_id", userId).order("imported_at", { ascending: false }),
    supabase.from("assessment_sessions").select("payload").eq("user_id", userId).in("status", ["ACTIVE", "PAUSED", "EXPIRED"]).order("updated_at", { ascending: false }).limit(1),
    supabase.from("active_interview_sessions").select("payload").eq("user_id", userId).in("status", ["ACTIVE", "PAUSED"]).order("updated_at", { ascending: false }).limit(1)
  ]);

  return {
    attempts: attemptsResult.data?.map((row) => row.payload as ExamAttempt).filter(Boolean) ?? [],
    interviewSessions: interviewsResult.data?.map((row) => row.payload as InterviewSessionAttempt).filter(Boolean) ?? [],
    questionFlags: flagsResult.data?.map((row) => row.payload as QuestionFlag).filter(Boolean) ?? [],
    importedProjects: projectsResult.data?.map((row) => row.payload as ImportedProject).filter(Boolean) ?? [],
    assessmentSession: (assessmentSessionResult.data?.[0]?.payload as AssessmentSession | undefined) ?? null,
    activeInterviewSession: (activeInterviewResult.data?.[0]?.payload as ActiveInterviewSession | undefined) ?? null
  };
}

export async function exportCloudData() {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true, error: "Sign in is required to export cloud data." };

  const [
    profile,
    attempts,
    interviews,
    flags,
    importedProjects,
    projectAnalyses,
    assessmentSessions,
    activeInterviewSessions
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("quiz_attempts").select("*").eq("user_id", userId),
    supabase.from("interview_sessions").select("*").eq("user_id", userId),
    supabase.from("question_flags").select("*").eq("user_id", userId),
    supabase.from("imported_projects").select("*").eq("user_id", userId),
    supabase.from("project_intelligence_analyses").select("*").eq("user_id", userId),
    supabase.from("assessment_sessions").select("*").eq("user_id", userId),
    supabase.from("active_interview_sessions").select("*").eq("user_id", userId)
  ]);

  const errors = [profile, attempts, interviews, flags, importedProjects, projectAnalyses, assessmentSessions, activeInterviewSessions]
    .map((result) => result.error)
    .filter(Boolean);
  if (errors.length) return { ok: false, skipped: false, error: errors[0] };

  return {
    ok: true,
    skipped: false,
    data: {
      exportedAt: new Date().toISOString(),
      userId,
      profile: profile.data,
      quizAttempts: attempts.data ?? [],
      interviewSessions: interviews.data ?? [],
      questionFlags: flags.data ?? [],
      importedProjects: importedProjects.data ?? [],
      projectIntelligenceAnalyses: projectAnalyses.data ?? [],
      assessmentSessions: assessmentSessions.data ?? [],
      activeInterviewSessions: activeInterviewSessions.data ?? []
    }
  };
}

export async function deleteCloudLearningData() {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true, error: "Sign in is required to delete cloud data." };

  const tables = [
    "active_interview_sessions",
    "assessment_sessions",
    "project_intelligence_analyses",
    "imported_projects",
    "question_flags",
    "interview_sessions",
    "quiz_attempts"
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) return { ok: false, skipped: false, error };
  }

  return { ok: true, skipped: false };
}
