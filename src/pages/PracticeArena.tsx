import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, CheckCircle2, Clock, Download, Flag, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { AssessmentSession, ConfidenceRating, Cert, ExamMode, Question, QuizOption } from "../types";
import { buildExam, scoreAttempt } from "../utils/quizEngine";
import { SIMULATED_SCORE_DISCLAIMER } from "../utils/simulatedScoring";
import { formatSeconds } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { examBlueprints, domainWeights } from "../data/examBlueprints";
import { PLATFORM_DISCLAIMER, QuestionBankNotice } from "../components/QuestionBankNotice";
import { isCertActivatable, metaFor, pathFor } from "../data/certPaths";

function validCert(value: string | null): Cert {
  if (value === "AZ-500" || value === "SC-500" || value === "SC-300") return value;
  return "SC-300";
}

function validMode(value: string | null): ExamMode {
  return value === "quiz" || value === "endless" || value === "weak" || value === "daily" || value === "case" || value === "kql" ? value : "timed";
}

function optionTone(optionId: QuizOption["id"], selected: QuizOption["id"] | null) {
  if (optionId === selected) return "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white ring-2 ring-[var(--aq-blue-100)] dark:bg-[var(--aq-blue-600)] dark:text-[#061227]";
  return "border-[#9cc9f5] bg-white text-[var(--aq-ink)] hover:border-[var(--aq-blue-600)] hover:bg-[var(--aq-blue-50)] dark:border-[#24486f] dark:bg-[#081d38] dark:text-[#e7f3ff] dark:hover:bg-[#0b2545]";
}

function runKindFor(mode: ExamMode) {
  return mode === "quiz" ? "quiz" : mode === "daily" ? "daily" : mode === "case" ? "case" : mode === "kql" ? "kql" : mode === "timed" ? "exam" : "practice";
}

function sessionIsRecoverable(session: AssessmentSession | null) {
  return session?.status === "ACTIVE" || session?.status === "PAUSED" || session?.status === "EXPIRED";
}

const confidenceOptions: Array<{ value: ConfidenceRating; label: string; shortLabel: string }> = [
  { value: "GUESSING", label: "Guessing", shortLabel: "Guess" },
  { value: "UNSURE", label: "Unsure", shortLabel: "Unsure" },
  { value: "FAIRLY_CONFIDENT", label: "Fairly confident", shortLabel: "Fair" },
  { value: "CERTAIN", label: "Certain", shortLabel: "Certain" }
];

export function PracticeArena() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hydrated = useAppStore((state) => state.hydrated);
  const questions = useAppStore((state) => state.questions);
  const recordAttempt = useAppStore((state) => state.recordAttempt);
  const recordQuestionFlag = useAppStore((state) => state.recordQuestionFlag);
  const assessmentSession = useAppStore((state) => state.assessmentSession);
  const saveAssessmentSession = useAppStore((state) => state.saveAssessmentSession);
  const updateAssessmentSession = useAppStore((state) => state.updateAssessmentSession);
  const finishAssessmentSession = useAppStore((state) => state.finishAssessmentSession);
  const userProgress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);

  const cert = validCert(params.get("cert"));
  const certMeta = metaFor(cert);
  const certActive = isCertActivatable(cert);
  const mode = validMode(params.get("mode"));
  const count = Number(params.get("count") ?? (mode === "daily" || mode === "quiz" ? 10 : mode === "case" ? 8 : mode === "kql" ? 8 : mode === "weak" ? 15 : 50));
  const minutes = Number(params.get("minutes") ?? (mode === "quiz" ? 12 : mode === "daily" ? 10 : mode === "case" ? 20 : mode === "kql" ? 15 : mode === "weak" ? 15 : 100));
  const timeLimitSeconds = minutes * 60;
  const weakTags = Object.entries(userProgress.weakTags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag]) => tag);
  const seedParam = params.get("seed") ?? undefined;
  const examTitle = params.get("examTitle") ?? `${cert} ${mode === "quiz" ? "Quick Quiz" : mode === "daily" ? "Daily Practice" : mode === "case" ? "Scenario Challenge" : "Certification Run"}`;
  const blueprintId = params.get("examId") ?? undefined;
  const quizId = params.get("quizId") ?? undefined;
  const focusDomain = params.get("domain") ?? undefined;
  const tagsParam = params.get("tags");
  const focusTags = useMemo(() => tagsParam?.split(",").filter(Boolean) ?? [], [tagsParam]);
  const fighter = params.get("fighter");
  const blueprint = blueprintId ? examBlueprints.find((item) => item.id === blueprintId) : undefined;
  const weights = blueprint?.domainWeights ?? (!focusDomain && mode === "timed" ? domainWeights[cert] : undefined);
  const sessionMatchesRoute = assessmentSession?.cert === cert
    && assessmentSession.mode === mode
    && assessmentSession.title === examTitle
    && assessmentSession.count === count
    && assessmentSession.minutes === minutes
    && assessmentSession.blueprintId === blueprintId
    && assessmentSession.quizId === quizId
    && assessmentSession.focusDomain === focusDomain
    && assessmentSession.focusTags.join(",") === focusTags.join(",");
  const recoverableSession = sessionMatchesRoute && sessionIsRecoverable(assessmentSession) ? assessmentSession : null;

  const builtExam = useMemo(
    () => buildExam({ bank: questions, cert, mode, count, weakTags, seed: seedParam, focusDomain, focusTags, domainWeights: weights }),
    // Fresh randomized structure each launch unless a retake seed is supplied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cert, mode, count, seedParam, focusDomain, params.toString()]
  );
  const resumedQuestions = useMemo(() => {
    if (!recoverableSession) return [];
    const byId = new Map(questions.map((item) => [item.id, item]));
    return recoverableSession.questionIds.map((id) => byId.get(id)).filter((item): item is Question => Boolean(item));
  }, [questions, recoverableSession]);
  const exam = recoverableSession && resumedQuestions.length === recoverableSession.questionIds.length
    ? { seed: recoverableSession.seed, questions: resumedQuestions }
    : builtExam;

  const [loading, setLoading] = useState(true);
  const [recoveryChoice, setRecoveryChoice] = useState<"pending" | "resume" | "restart">("pending");
  const [loadProgress, setLoadProgress] = useState(0);
  const [grading, setGrading] = useState(false);
  const [gradeProgress, setGradeProgress] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<QuizOption["id"] | null>(null);
  const [selections, setSelections] = useState<Record<string, QuizOption["id"] | null>>({});
  const [secondsByQuestion, setSecondsByQuestion] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Record<string, boolean>>({});
  const [markedQuestionIds, setMarkedQuestionIds] = useState<Record<string, boolean>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceRating>>({});
  const [submissionReviewOpen, setSubmissionReviewOpen] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<"all" | "marked" | "unanswered" | "low-confidence">("all");
  const currentSessionId = useRef<string | null>(null);

  useEffect(() => {
    const duration = 1800;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;
    const timer = window.setInterval(() => {
      step++;
      setLoadProgress(Math.min(100, Math.round((step / steps) * 100)));
      if (step >= steps) {
        window.clearInterval(timer);
        setLoading(false);
      }
    }, interval);
    return () => window.clearInterval(timer);
  }, []);
  const qStart = useRef(Date.now());
  const question = exam.questions[index];

  const startNewSession = useCallback(async (sourceExam = builtExam) => {
    if (!sourceExam.questions.length) return;
    const now = new Date().toISOString();
    const sessionId = crypto.randomUUID?.() ?? `session-${Date.now()}`;
    const nextSession: AssessmentSession = {
      id: sessionId,
      cert,
      mode,
      kind: runKindFor(mode),
      title: examTitle,
      blueprintId,
      quizId,
      focusDomain,
      focusTags,
      count,
      minutes,
      timeLimitSeconds,
      questionIds: sourceExam.questions.map((item) => item.id),
      currentIndex: 0,
      answers: {},
      secondsByQuestion: {},
      markedQuestionIds: [],
      confidenceRatings: {},
      seed: sourceExam.seed,
      startedAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + Math.max(timeLimitSeconds, 60) * 1000).toISOString(),
      status: "ACTIVE",
      version: { schemaVersion: 1, appVersion: "0.1.0", storageNamespace: "praxisgrid" }
    };
    currentSessionId.current = sessionId;
    setStartedAt(now);
    setIndex(0);
    setSelected(null);
    setSelections({});
    setSecondsByQuestion({});
    setMarkedQuestionIds({});
    setConfidenceRatings({});
    setElapsed(0);
    await saveAssessmentSession(nextSession);
  }, [blueprintId, builtExam, cert, count, examTitle, focusDomain, focusTags, minutes, mode, quizId, saveAssessmentSession, timeLimitSeconds]);

  const resumeSession = useCallback(async (session: AssessmentSession) => {
    currentSessionId.current = session.id;
    setStartedAt(session.startedAt);
    setIndex(Math.min(session.currentIndex, Math.max(0, exam.questions.length - 1)));
    setSelections(session.answers);
    setSecondsByQuestion(session.secondsByQuestion);
    setMarkedQuestionIds(Object.fromEntries(session.markedQuestionIds.map((id) => [id, true])));
    setConfidenceRatings(session.confidenceRatings);
    setElapsed(Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)));
    if (session.status !== "EXPIRED") await updateAssessmentSession(session.id, { status: "ACTIVE" });
  }, [exam.questions.length, updateAssessmentSession]);

  useEffect(() => {
    if (!hydrated || loading || !exam.questions.length || currentSessionId.current || recoveryChoice !== "pending") return;
    if (recoverableSession) return;
    void startNewSession();
  }, [exam.questions.length, hydrated, loading, recoverableSession, recoveryChoice, startNewSession]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (!finished && elapsed >= timeLimitSeconds) {
      if (currentSessionId.current) void finishAssessmentSession(currentSessionId.current, "EXPIRED").catch(() => undefined);
      setFinished(true);
    }
  }, [elapsed, finishAssessmentSession, finished, timeLimitSeconds]);

  useEffect(() => {
    qStart.current = Date.now();
    const q = exam.questions[index];
    setSelected(q ? (selections[q.id] ?? null) : null);
  }, [exam.questions, index, selections]);

  useEffect(() => {
    if (!currentSessionId.current || finished || !question) return;
    const timer = window.setTimeout(() => {
      void updateAssessmentSession(currentSessionId.current as string, {
        currentIndex: index,
        answers: selections,
        secondsByQuestion,
        markedQuestionIds: Object.entries(markedQuestionIds).filter(([, marked]) => marked).map(([id]) => id),
        confidenceRatings,
        status: "ACTIVE",
        expiresAt: new Date(new Date(startedAt).getTime() + Math.max(timeLimitSeconds, 60) * 1000).toISOString()
      }).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [confidenceRatings, finished, index, markedQuestionIds, question, secondsByQuestion, selections, startedAt, timeLimitSeconds, updateAssessmentSession]);

  useEffect(() => {
    const sessionId = currentSessionId.current;
    if (!sessionId || finished) return;
    const pauseSession = () => {
      void updateAssessmentSession(sessionId, { status: "PAUSED" }).catch(() => undefined);
    };
    window.addEventListener("beforeunload", pauseSession);
    return () => {
      window.removeEventListener("beforeunload", pauseSession);
      pauseSession();
    };
  }, [finished, updateAssessmentSession]);

  const attempted = Object.keys(selections).length;
  const progressPercent = ((index + 1) / exam.questions.length) * 100;
  const timeLeft = Math.max(0, timeLimitSeconds - elapsed);

  function choose(optionId: QuizOption["id"]) {
    if (!question) return;
    const seconds = Math.max(1, Math.round((Date.now() - qStart.current) / 1000));
    setSelected(optionId);
    setSelections((prev) => ({ ...prev, [question.id]: optionId }));
    setSecondsByQuestion((prev) => ({ ...prev, [question.id]: seconds }));
  }

  function prev() {
    if (index === 0) return;
    setIndex((v) => v - 1);
  }

  function next() {
    if (!selected || !question) return;
    if (index + 1 >= exam.questions.length) setSubmissionReviewOpen(true);
    else setIndex((v) => v + 1);
  }

  function goToQuestion(nextIndex: number) {
    setSubmissionReviewOpen(false);
    setIndex(Math.min(Math.max(0, nextIndex), exam.questions.length - 1));
  }

  function submitFinalAnswers() {
    setSubmissionReviewOpen(false);
    setFinished(true);
  }

  const reviewSummary = useMemo(() => {
    const answeredIds = new Set(Object.entries(selections).filter(([, value]) => Boolean(value)).map(([id]) => id));
    const markedIds = new Set(Object.entries(markedQuestionIds).filter(([, value]) => value).map(([id]) => id));
    const lowConfidenceIds = new Set(Object.entries(confidenceRatings).filter(([, value]) => value === "GUESSING" || value === "UNSURE").map(([id]) => id));
    const unansweredQuestions = exam.questions.filter((item) => !answeredIds.has(item.id));
    const markedQuestions = exam.questions.filter((item) => markedIds.has(item.id));
    const lowConfidenceQuestions = exam.questions.filter((item) => lowConfidenceIds.has(item.id));

    return {
      answered: answeredIds.size,
      unanswered: unansweredQuestions.length,
      marked: markedQuestions.length,
      lowConfidence: lowConfidenceQuestions.length,
      unansweredQuestions,
      markedQuestions,
      lowConfidenceQuestions
    };
  }, [confidenceRatings, exam.questions, markedQuestionIds, selections]);

  const visibleQuestionIndexes = useMemo(() => {
    return exam.questions
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => {
        if (questionFilter === "marked") return Boolean(markedQuestionIds[item.id]);
        if (questionFilter === "unanswered") return !selections[item.id];
        if (questionFilter === "low-confidence") return confidenceRatings[item.id] === "GUESSING" || confidenceRatings[item.id] === "UNSURE";
        return true;
      });
  }, [confidenceRatings, exam.questions, markedQuestionIds, questionFilter, selections]);

  function questionStateLabel(targetQuestion: Question, targetIndex: number) {
    const answered = Boolean(selections[targetQuestion.id]);
    const marked = Boolean(markedQuestionIds[targetQuestion.id]);
    const lowConfidence = confidenceRatings[targetQuestion.id] === "GUESSING" || confidenceRatings[targetQuestion.id] === "UNSURE";
    if (targetIndex === index) return "CURRENT";
    if (answered && marked) return "ANSWERED_AND_MARKED";
    if (marked) return "MARKED";
    if (lowConfidence) return "LOW_CONFIDENCE";
    if (answered) return "ANSWERED";
    return "UNANSWERED";
  }

  function questionStateTone(state: string) {
    if (state === "CURRENT") return "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white";
    if (state === "ANSWERED_AND_MARKED") return "border-sky-500 bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-100";
    if (state === "MARKED") return "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
    if (state === "LOW_CONFIDENCE") return "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100";
    if (state === "ANSWERED") return "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
    return "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
  }

  const finalAttempt = useMemo(() => scoreAttempt({
    cert,
    mode,
    kind: runKindFor(mode),
    title: examTitle,
    blueprintId,
    quizId,
    focusDomain,
    focusTags,
    startedAt,
    seed: exam.seed,
    questions: exam.questions,
    selections,
    confidenceRatings,
    secondsByQuestion,
    timeLimitSeconds
  }), [blueprintId, cert, confidenceRatings, exam.questions, exam.seed, examTitle, focusDomain, focusTags, mode, quizId, secondsByQuestion, selections, startedAt, timeLimitSeconds]);
  const finalAttemptWithSession = useMemo(() => ({ ...finalAttempt, assessmentSessionId: currentSessionId.current ?? undefined }), [finalAttempt]);

  function arenaUrl(seed?: string) {
    const next = new URLSearchParams({
      cert,
      mode,
      count: String(count),
      minutes: String(minutes),
      examTitle
    });
    if (seed) next.set("seed", seed);
    if (focusDomain) next.set("domain", focusDomain);
    if (focusTags.length) next.set("tags", focusTags.join(","));
    if (blueprintId) next.set("examId", blueprintId);
    if (quizId) next.set("quizId", quizId);
    return `/arena?${next.toString()}`;
  }

  function downloadText(filename: string, contents: string, type: string) {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportResultsJson() {
    downloadText(`${cert.toLowerCase()}-assessment-result.json`, JSON.stringify(finalAttemptWithSession, null, 2), "application/json");
  }

  function exportDomainCsv() {
    const rows = [["domain", "correct", "total", "percentage"]];
    for (const [domain, stats] of Object.entries(finalAttempt.domains)) {
      rows.push([domain, String(stats.correct), String(stats.total), String(Math.round((stats.correct / stats.total) * 100))]);
    }
    downloadText(`${cert.toLowerCase()}-domain-performance.csv`, rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
  }

  function toggleMarkedQuestion(targetQuestion: Question) {
    setMarkedQuestionIds((prev) => ({ ...prev, [targetQuestion.id]: !prev[targetQuestion.id] }));
  }

  function rateConfidence(targetQuestion: Question, rating: ConfidenceRating) {
    setConfidenceRatings((prev) => ({ ...prev, [targetQuestion.id]: rating }));
  }

  function toggleQuestionFlag(targetQuestion: Question) {
    const nextFlagged = !flaggedQuestionIds[targetQuestion.id];
    setFlaggedQuestionIds((prev) => ({ ...prev, [targetQuestion.id]: nextFlagged }));
    if (!nextFlagged) return;

    void recordQuestionFlag({
      id: `${cert}:${targetQuestion.id}:${Date.now()}`,
      cert,
      questionId: targetQuestion.id,
      reason: "learner-review",
      note: `Flagged during ${examTitle}`,
      createdAt: new Date().toISOString(),
      resolved: false
    }).catch(() => undefined);
  }

  const runGradingAnimation = useCallback(() => {
      setGrading(true);
      setGradeProgress(0);
      const duration = 1800;
      const interval = 30;
      const steps = duration / interval;
      let step = 0;
      const timer = window.setInterval(() => {
        step++;
        setGradeProgress(Math.min(100, Math.round((step / steps) * 100)));
        if (step >= steps) {
          window.clearInterval(timer);
          if (finalAttempt.percentage >= 70 && !settings.reduceAnimations && !settings.lowBandwidth) void confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
          setGrading(false);
        }
      }, interval);
      return timer;
  }, [finalAttempt.percentage, settings.lowBandwidth, settings.reduceAnimations]);

  useEffect(() => {
    if (!finished || saved || savingAttempt || saveError) return;
    let gradingTimer: number | undefined;
    let cancelled = false;

    async function saveAttempt() {
      setSavingAttempt(true);
      try {
        await recordAttempt(finalAttemptWithSession);
        if (currentSessionId.current) await finishAssessmentSession(currentSessionId.current, "SUBMITTED", finalAttemptWithSession.id);
        if (cancelled) return;
        setSaved(true);
        gradingTimer = runGradingAnimation();
      } catch (error) {
        if (cancelled) return;
        setSaveError(error instanceof Error ? error.message : "Unable to save this attempt locally.");
        setGrading(false);
      } finally {
        if (!cancelled) setSavingAttempt(false);
      }
    }

    void saveAttempt();
    return () => {
      cancelled = true;
      if (gradingTimer) window.clearInterval(gradingTimer);
    };
  }, [finalAttemptWithSession, finishAssessmentSession, finished, recordAttempt, runGradingAnimation, saveError, saved, savingAttempt]);

  if (!certActive) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">
        <CardHeader>
          <div>
            <Badge className="mb-2 border-amber-300 bg-white text-amber-900">{certMeta.status}</Badge>
            <CardTitle>{cert} is no longer available for new assessment sessions.</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm font-semibold">{certMeta.transitionMessage}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="hero"><Link to={`/cert/${pathFor(certMeta.replacementCert ?? "SC-500")}/knowledge`}>Continue with {certMeta.replacementCert ?? "active path"}</Link></Button>
          <Button asChild variant="soft"><Link to={`/history?cert=${cert}`}>View preserved history</Link></Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm space-y-6 px-8 text-center"
        >
          <div className="space-y-1">
            <Badge className="mb-4 border-blue-500/40 bg-blue-500/20 text-blue-100">{cert}</Badge>
            <h2 className="text-2xl font-semibold text-white">{examTitle}</h2>
            <p className="text-sm text-slate-400">{count} questions / {minutes} min</p>
            <p className="mx-auto max-w-xs pt-3 text-xs font-semibold text-emerald-200">{PLATFORM_DISCLAIMER}</p>
          </div>

          <div className="space-y-3">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-blue-400"
                initial={{ width: "0%" }}
                animate={{ width: `${loadProgress}%` }}
                transition={{ ease: "linear", duration: 0.03 }}
              />
            </div>
            <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
              {loadProgress < 40 ? "Selecting questions" : loadProgress < 75 ? "Weighting domains" : loadProgress < 95 ? "Preparing your exam" : "Ready"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (hydrated && recoverableSession && recoveryChoice === "pending") {
    const answered = Object.keys(recoverableSession.answers).filter((id) => recoverableSession.answers[id]).length;
    const isExpired = recoverableSession.status === "EXPIRED";
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <QuestionBankNotice compact />
        <Card className="border-l-4 border-l-[var(--aq-blue-600)]">
          <CardHeader>
            <div>
              <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{recoverableSession.status}</Badge>
              <CardTitle className="text-2xl">Recover your assessment session?</CardTitle>
              <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">{recoverableSession.title} / {answered} of {recoverableSession.questionIds.length} answered / question {recoverableSession.currentIndex + 1}</p>
            </div>
            <Clock className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-[var(--aq-muted)]">
              {isExpired ? "This saved session has expired. Restart or abandon it to keep your history clean." : "PraxisGrid found a locally saved in-progress run from this browser."}
            </p>
            <p className="mt-3 text-xs font-semibold text-[var(--aq-muted)]">{PLATFORM_DISCLAIMER}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Button
                onClick={() => {
                  setRecoveryChoice("resume");
                  void resumeSession(recoverableSession);
                }}
                disabled={isExpired}
                size="lg"
                variant="hero"
              >
                Resume
              </Button>
              <Button
                onClick={() => {
                  setRecoveryChoice("restart");
                  void finishAssessmentSession(recoverableSession.id, "ABANDONED").then(() => startNewSession());
                }}
                size="lg"
                variant="soft"
              >
                Restart
              </Button>
              <Button
                onClick={() => {
                  void finishAssessmentSession(recoverableSession.id, "ABANDONED").then(() => navigate(`/cert/${cert.toLowerCase()}/knowledge`));
                }}
                size="lg"
                variant="ghost"
              >
                Abandon
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!exam.questions.length) {
    return <Card><CardTitle>No questions found for this run.</CardTitle><p className="mt-2 font-medium text-slate-500">Try a mixed exam or another quiz.</p></Card>;
  }

  if (submissionReviewOpen) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <QuestionBankNotice compact />
        <Card className="border-l-4 border-l-[var(--aq-blue-600)]">
          <CardHeader>
            <div>
              <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Submission review</Badge>
              <CardTitle className="text-2xl">Review before submitting</CardTitle>
              <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">Answers stay hidden until you submit this run.</p>
            </div>
            <ShieldCheck className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              <button type="button" onClick={() => setQuestionFilter("all")} className="aq-metric text-left">
                <p className="text-xl font-bold">{exam.questions.length}</p>
                <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Total</p>
              </button>
              <button type="button" onClick={() => setQuestionFilter("unanswered")} className="aq-metric text-left">
                <p className="text-xl font-bold">{reviewSummary.unanswered}</p>
                <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Unanswered</p>
              </button>
              <button type="button" onClick={() => setQuestionFilter("marked")} className="aq-metric text-left">
                <p className="text-xl font-bold">{reviewSummary.marked}</p>
                <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Marked</p>
              </button>
              <button type="button" onClick={() => setQuestionFilter("low-confidence")} className="aq-metric text-left">
                <p className="text-xl font-bold">{reviewSummary.lowConfidence}</p>
                <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Low confidence</p>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => setQuestionFilter("unanswered")} variant="soft">Return to unanswered</Button>
              <Button onClick={() => setQuestionFilter("marked")} variant="soft">Review marked</Button>
              <Button onClick={() => setQuestionFilter("low-confidence")} variant="soft">Review low confidence</Button>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Submission review question grid">
              {visibleQuestionIndexes.map(({ item, itemIndex }) => {
                const state = questionStateLabel(item, itemIndex);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToQuestion(itemIndex)}
                    className={`min-h-12 rounded-md border px-2 py-2 text-xs font-bold ${questionStateTone(state)}`}
                    aria-label={`Question ${itemIndex + 1}: ${state.replace(/_/g, " ").toLowerCase()}`}
                  >
                    <span className="block text-sm">{itemIndex + 1}</span>
                    <span className="block text-[10px] uppercase">{state === "ANSWERED_AND_MARKED" ? "ANS+MARK" : state.replace("_", " ")}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs font-semibold text-[var(--aq-muted)]">Time remaining: {formatSeconds(timeLeft)}. {PLATFORM_DISCLAIMER}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button onClick={() => setSubmissionReviewOpen(false)} size="lg" variant="soft">Return to current question</Button>
              <Button onClick={submitFinalAnswers} size="lg" variant="hero">Submit final answers</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (finished && grading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm space-y-6 px-8 text-center"
        >
          <div className="space-y-1">
            <Badge className="mb-4 border-blue-500/40 bg-blue-500/20 text-blue-100">{cert}</Badge>
            <h2 className="text-2xl font-semibold text-white">{examTitle}</h2>
            <p className="text-sm text-slate-400">{Object.keys(selections).length} of {exam.questions.length} answered</p>
          </div>

          <div className="space-y-3">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-blue-400"
                initial={{ width: "0%" }}
                animate={{ width: `${gradeProgress}%` }}
                transition={{ ease: "linear", duration: 0.03 }}
              />
            </div>
            <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
              {gradeProgress < 35 ? "Scoring your answers" : gradeProgress < 65 ? "Analysing domains" : gradeProgress < 90 ? "Calculating progress" : "Almost done"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (finished) {
    return (
      <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-slate-50 px-4 py-4 text-[var(--aq-ink)] dark:bg-[#061227] sm:px-6 print:bg-white">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Button asChild variant="ghost" size="sm"><Link to={`/cert/${pathFor(cert)}/knowledge`}><ArrowLeft className="h-4 w-4" /> Back to Practise</Link></Button>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportResultsJson} variant="soft" size="sm"><Download className="h-4 w-4" /> JSON</Button>
              <Button onClick={exportDomainCsv} variant="soft" size="sm"><Download className="h-4 w-4" /> CSV</Button>
              <Button onClick={() => window.print()} variant="soft" size="sm"><Printer className="h-4 w-4" /> Print</Button>
              <Button asChild variant="hero" size="sm"><Link to={arenaUrl(exam.seed)}><RotateCcw className="h-4 w-4" /> Retake</Link></Button>
            </div>
          </div>

          <section className="rounded-md border border-[var(--aq-border)] bg-white p-5 shadow-sm dark:bg-[#0b1b33] print:border-slate-300 print:shadow-none">
            <div className="grid gap-5 lg:grid-cols-[1fr_13rem] lg:items-center">
              <div>
                <Badge className={finalAttempt.passed ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" : "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"}>{finalAttempt.kind.toUpperCase()} COMPLETE</Badge>
                <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{examTitle}</h1>
                <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">{finalAttempt.passed ? "At or above the 70% practice threshold." : "Below the 70% practice threshold. Review the weakest domains before retaking."}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--aq-muted)]">{SIMULATED_SCORE_DISCLAIMER}</p>
              </div>
              <div className="mx-auto grid h-44 w-44 place-items-center rounded-full border-[12px] border-[var(--aq-blue-100)] bg-[var(--aq-blue-50)] text-center dark:border-[#103b67] dark:bg-[#08264a]">
                <div>
                  <div className="text-4xl font-bold text-[var(--aq-blue-700)] dark:text-[var(--aq-blue-300)]">{finalAttempt.percentage}%</div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--aq-muted)]">{finalAttempt.passed ? "Passed" : "Review"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div className="rounded-md border border-[var(--aq-border)] p-3"><p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Correct</p><p className="mt-1 text-xl font-semibold">{finalAttempt.score}/{finalAttempt.total}</p></div>
              <div className="rounded-md border border-[var(--aq-border)] p-3"><p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Time used</p><p className="mt-1 text-xl font-semibold">{formatSeconds(finalAttempt.timeTakenSeconds)}</p></div>
              <div className="rounded-md border border-[var(--aq-border)] p-3"><p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Sim score</p><p className="mt-1 text-xl font-semibold">{finalAttempt.simulatedScore}</p></div>
              <div className="rounded-md border border-[var(--aq-border)] p-3"><p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Progress delta</p><p className="mt-1 text-xl font-semibold">+{finalAttempt.readinessDelta ?? 0}</p></div>
            </div>
          </section>

        {saveError ? (
          <Card className="border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-50">
            <CardHeader>
              <CardTitle>Attempt not saved yet</CardTitle>
            </CardHeader>
            <p className="text-sm font-medium">Your score is shown below, but local progress and history were not updated. {saveError}</p>
            <Button onClick={() => setSaveError(null)} className="mt-4" variant="soft">Retry save</Button>
          </Card>
        ) : null}

          <section className="rounded-md border border-[var(--aq-border)] bg-white p-5 dark:bg-[#0b1b33]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Domain Performance</h2>
                <p className="text-sm font-semibold text-[var(--aq-muted)]">Recommended next action: review the lowest domain, then retake the same question set.</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--aq-border)] text-left text-xs uppercase text-[var(--aq-muted)]">
                    <th className="py-2 pr-3">Domain</th>
                    <th className="py-2 pr-3">Correct</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(finalAttempt.domains).map(([domain, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <tr key={domain} className="border-b border-[var(--aq-border)]">
                        <td className="py-3 pr-3 font-semibold">{domain}</td>
                        <td className="py-3 pr-3">{stats.correct}</td>
                        <td className="py-3 pr-3">{stats.total}</td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <Progress value={pct} />
                            <span className="w-10 text-right font-semibold">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-md border border-[var(--aq-border)] bg-white p-5 dark:bg-[#0b1b33]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Question Review</h2>
              <CheckCircle2 className="h-6 w-6 text-sky-500" />
            </div>
            <QuestionBankNotice compact />
            <div className="mt-4 space-y-2">
              {exam.questions.map((q, i) => {
                const chosen = selections[q.id];
                const chosenText = q.options.find((o) => o.id === chosen)?.text ?? "Unanswered";
                const correctText = q.options.find((o) => o.id === q.answer)?.text ?? q.answer;
                const ok = chosen === q.answer;
                return (
                  <details key={q.id} className="rounded-md border border-[var(--aq-border)] bg-slate-50 p-4 dark:bg-[#081d38]">
                    <summary className="cursor-pointer text-sm font-semibold">{i + 1}. {ok ? "Correct" : "Missed"} / {q.domain}</summary>
                    <p className="mt-3 font-semibold">{q.stem}</p>
                    <div className="mt-3 grid gap-2 text-sm font-medium">
                      <p className={ok ? "text-blue-600 dark:text-blue-300" : "text-rose-600 dark:text-rose-300"}>Your answer: {chosen ? `${chosen}. ${chosenText}` : "Unanswered"}</p>
                      <p className="text-blue-700 dark:text-blue-300">Correct answer: {q.answer}. {correctText}</p>
                      <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                      {!ok && chosen && q.whyWrong[chosen] ? <p className="rounded-md border border-[var(--aq-border)] bg-white p-3 dark:bg-[#0b1b33]">Why your answer missed: {q.whyWrong[chosen]}</p> : null}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3 print:hidden">
            <Button asChild size="lg" variant="hero"><Link to={arenaUrl()}><RotateCcw /> New randomized structure</Link></Button>
            <Button asChild size="lg" variant="soft"><Link to={arenaUrl(exam.seed)}>Retake same questions</Link></Button>
            <Button asChild size="lg" variant="default"><Link to="/history">Activity History</Link></Button>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
      <QuestionBankNotice compact />

      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm"><Link to={`/cert/${cert.toLowerCase()}/knowledge`}><ArrowLeft className="h-4 w-4" /> Quiz</Link></Button>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <Badge className="max-w-[140px] truncate sm:max-w-none">{examTitle}</Badge>
          {fighter ? <Badge className="hidden border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 sm:inline-flex">{fighter}</Badge> : null}
          <Badge className={`shrink-0 ${timeLeft < 60 ? "border-rose-500 bg-rose-500 text-white" : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"}`}><Clock className="h-3 w-3" /> {formatSeconds(timeLeft)}</Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-l-4 border-l-[var(--aq-blue-600)]">
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{question.scenarioOrg}</Badge>
            <CardTitle className="text-xl">Question {index + 1}/{exam.questions.length}</CardTitle>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{question.domain}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">{attempted}/{exam.questions.length}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">answered</p>
          </div>
        </CardHeader>
        <Progress value={progressPercent} />
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button onClick={() => setQuestionFilter("all")} variant={questionFilter === "all" ? "hero" : "soft"} size="sm">All</Button>
            <Button onClick={() => setQuestionFilter("unanswered")} variant={questionFilter === "unanswered" ? "hero" : "soft"} size="sm">Unanswered</Button>
            <Button onClick={() => setQuestionFilter("marked")} variant={questionFilter === "marked" ? "hero" : "soft"} size="sm">Marked</Button>
            <Button onClick={() => setQuestionFilter("low-confidence")} variant={questionFilter === "low-confidence" ? "hero" : "soft"} size="sm">Low confidence</Button>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Question navigation grid">
            {visibleQuestionIndexes.map(({ item, itemIndex }) => {
              const state = questionStateLabel(item, itemIndex);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToQuestion(itemIndex)}
                  className={`min-h-11 rounded-md border px-2 py-1 text-xs font-bold ${questionStateTone(state)}`}
                  aria-current={itemIndex === index ? "step" : undefined}
                  aria-label={`Question ${itemIndex + 1}: ${state.replace(/_/g, " ").toLowerCase()}`}
                >
                  <span className="block text-sm">{itemIndex + 1}</span>
                  <span className="block text-[10px] uppercase">{state === "ANSWERED_AND_MARKED" ? "ANS+MARK" : state.replace("_", " ")}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <motion.div key={question.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <Card className="border-[var(--aq-border)]">
          <CardContent>
            <p className="text-xl font-semibold leading-tight">{question.stem}</p>
            {question.diagram ? <pre className="rounded-lg bg-slate-950 p-4 text-sm font-medium text-sky-200 dark:bg-black/40">{question.diagram}</pre> : null}
            <div className="aq-subtle-panel mt-4 border-dashed p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMarkedQuestion(question)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Bookmark className="h-4 w-4" />
                  {markedQuestionIds[question.id] ? "Marked" : "Mark for later"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleQuestionFlag(question)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Flag className="h-4 w-4" />
                  {flaggedQuestionIds[question.id] ? "Flagged for review" : "Flag/report question"}
                </button>
                <div className="flex items-center gap-1">
                  {confidenceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => rateConfidence(question, option.value)}
                      aria-pressed={confidenceRatings[question.id] === option.value}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold ${confidenceRatings[question.id] === option.value ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
                    >
                      {option.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Marks, confidence, and flags are saved locally first; flags sync to Supabase when signed in.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Adaptive practice signals</CardTitle><ShieldCheck className="h-6 w-6 text-blue-500" /></CardHeader>
          <div className="grid gap-2">
            {(finalAttempt.adaptationSignals ?? []).map((signal) => (
              <div key={signal} className="aq-subtle-panel p-3 text-sm font-semibold">{signal}</div>
            ))}
          </div>
        </Card>

        <div className="grid gap-3">
          {question.options.map((option) => (
            <motion.button whileTap={{ scale: 0.99 }} key={option.id} onClick={() => choose(option.id)} className={`flex min-h-16 items-center gap-3 rounded-lg border p-4 text-left text-base font-semibold shadow-sm transition ${optionTone(option.id, selected)}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-black/10 text-sm dark:bg-white/10">{option.id}</span>
              <span className="flex-1">{option.text}</span>
              {selected === option.id ? <CheckCircle2 className="h-5 w-5" /> : null}
            </motion.button>
          ))}
        </div>

        <div className="sticky bottom-4 z-20 rounded-md border border-[var(--aq-border)] bg-white/95 p-2 shadow-[var(--aq-shadow)] backdrop-blur dark:bg-[#061227]/95 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
          <div className="grid grid-cols-[auto_1fr_auto] gap-2">
            <Button onClick={prev} disabled={index === 0} size="lg" variant="soft" className="h-12 px-4"><ArrowLeft className="h-4 w-4" /></Button>
            <Button onClick={next} disabled={!selected} size="lg" variant="hero" className="h-12 text-sm">{index + 1 >= exam.questions.length ? "Finish run" : "Next question"}</Button>
            <Button onClick={() => setSubmissionReviewOpen(true)} size="lg" variant="soft" className="h-12 text-sm"><span className="hidden sm:inline">Review & submit</span><span className="sm:hidden">Review</span></Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
