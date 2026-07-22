import { isSupabaseConfigured, supabase } from "./supabase";
import type { ExamAttempt, ImportedProject, InterviewSessionAttempt, QuestionFlag } from "../types";

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

export async function syncImportedProject(project: ImportedProject) {
  const userId = await currentUserId();
  if (!userId || !supabase) return { ok: false, skipped: true };

  const { error } = await supabase.from("imported_projects").upsert({
    id: importedProjectRowId(userId, project),
    user_id: userId,
    owner: project.owner,
    repo: project.repo,
    source_url: project.url,
    content_hash: project.contentHash,
    status: project.status,
    imported_at: project.importedAt,
    payload: project
  });

  return { ok: !error, skipped: false, error };
}

export function importedProjectRowId(userId: string, project: Pick<ImportedProject, "id" | "contentHash">) {
  return `${userId}:${project.contentHash || project.id}`;
}

export async function fetchCloudLearningData() {
  const userId = await currentUserId();
  if (!userId || !supabase) return { attempts: [], interviewSessions: [], questionFlags: [], importedProjects: [] };

  const [attemptsResult, interviewsResult, flagsResult, projectsResult] = await Promise.all([
    supabase.from("quiz_attempts").select("payload").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("interview_sessions").select("payload").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("question_flags").select("payload").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("imported_projects").select("payload").eq("user_id", userId).order("imported_at", { ascending: false })
  ]);

  return {
    attempts: attemptsResult.data?.map((row) => row.payload as ExamAttempt).filter(Boolean) ?? [],
    interviewSessions: interviewsResult.data?.map((row) => row.payload as InterviewSessionAttempt).filter(Boolean) ?? [],
    questionFlags: flagsResult.data?.map((row) => row.payload as QuestionFlag).filter(Boolean) ?? [],
    importedProjects: projectsResult.data?.map((row) => row.payload as ImportedProject).filter(Boolean) ?? []
  };
}
