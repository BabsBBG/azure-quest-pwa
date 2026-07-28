import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Github,
  History,
  Mic,
  Network,
  PauseCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Trophy
} from "lucide-react";
import { certFromSlug, pathFor } from "../data/certPaths";
import { interviewQuestions, interviewSessions, jobTracks, type InterviewQuestion } from "../data/jobReadiness";
import { useAppStore } from "../store/useAppStore";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { canImportPublicRepo, importPublicGitHubProject } from "../lib/githubProjectImport";
import { GITHUB_PROJECT_PROMPT } from "../lib/brand";
import type { ActiveInterviewSession, ImportedProject, InterviewAnswerRecord, InterviewSessionAttempt, JobTrack } from "../types";

const ALL_TRACKS = jobTracks.map((track) => track.id);

function phaseLabel(q?: InterviewQuestion) {
  if (!q) return "Interview";
  return q.phase.replace("-", " ");
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `interview-${Date.now()}`;
}

export function JobReadiness() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const recordInterviewSession = useAppStore((state) => state.recordInterviewSession);
  const activeInterviewSession = useAppStore((state) => state.activeInterviewSession);
  const saveActiveInterviewSession = useAppStore((state) => state.saveActiveInterviewSession);
  const clearActiveInterviewSession = useAppStore((state) => state.clearActiveInterviewSession);
  const recordImportedProject = useAppStore((state) => state.recordImportedProject);
  const interviewHistory = useAppStore((state) => state.interviewSessions);
  const importedProjects = useAppStore((state) => state.importedProjects);
  const [track, setTrack] = useState<JobTrack>("IAM");
  const trackSessions = interviewSessions.filter((session) => session.track === track);
  const [sessionId, setSessionId] = useState(trackSessions[0]?.id ?? interviewSessions[0].id);
  const session = trackSessions.find((item) => item.id === sessionId) ?? trackSessions[0] ?? interviewSessions[0];
  const sessionQuestions = useMemo(() => (session?.questionIds ?? []).map((id) => interviewQuestions.find((q) => q.id === id)).filter(Boolean) as InterviewQuestion[], [session]);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [coachOpen, setCoachOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedSecondsRef = useRef(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<Record<string, string[]>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [completedSession, setCompletedSession] = useState<InterviewSessionAttempt | null>(null);
  const activeQuestion = sessionQuestions[index] ?? sessionQuestions[0];
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] ?? "" : "";
  const activeScore = activeQuestion ? selfScores[activeQuestion.id] ?? 0 : 0;
  const activeChecked = activeQuestion ? checked[activeQuestion.id] ?? [] : [];
  const activeSubmitted = activeQuestion ? Boolean(submitted[activeQuestion.id]) : false;
  const progress = sessionQuestions.length ? ((index + 1) / sessionQuestions.length) * 100 : 0;
  const targetSeconds = (session?.minutes ?? 30) * 60;
  const remainingSeconds = targetSeconds - elapsedSeconds;
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [mapperTrack, setMapperTrack] = useState<JobTrack>("Cloud Security");
  const [githubUrl, setGithubUrl] = useState("");
  const [importingProject, setImportingProject] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const mappedProjects = importedProjects.filter((project) => selectedProjects.includes(project.id));
  const mapperQuestions = interviewQuestions
    .filter((question) => question.track === mapperTrack)
    .slice(0, 8);
  const recentSessions = interviewHistory.filter((item) => item.cert === cert).slice(0, 4);
  const trackSummary = ALL_TRACKS.join(", ").replace(/, ([^,]*)$/, " and $1");

  useEffect(() => {
    if (started) return;
    const next = interviewSessions.find((item) => item.track === track);
    if (next) setSessionId(next.id);
  }, [started, track]);

  useEffect(() => {
    if (!started || paused) return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [paused, started]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const buildActiveInterviewSession = useCallback((status: ActiveInterviewSession["status"] = paused ? "PAUSED" : "ACTIVE") => {
    if (!activeSessionId || !session || !startedAt) return null;
    return {
      id: activeSessionId,
      cert,
      sessionId: session.id,
      sessionTitle: session.title,
      role: session.role,
      track: session.track,
      startedAt,
      updatedAt: new Date().toISOString(),
      targetMinutes: session.minutes,
      elapsedSeconds: elapsedSecondsRef.current,
      currentIndex: index,
      answers,
      submitted,
      checked,
      selfScores,
      selectedProjectIds: selectedProjects,
      status
    };
  }, [activeSessionId, answers, cert, checked, index, paused, selectedProjects, selfScores, session, startedAt, submitted]);

  useEffect(() => {
    if (!started || !activeSessionId) return;
    const handle = window.setTimeout(() => {
      const draft = buildActiveInterviewSession();
      if (draft) void saveActiveInterviewSession(draft);
    }, 600);
    return () => window.clearTimeout(handle);
  }, [activeSessionId, answers, buildActiveInterviewSession, checked, index, saveActiveInterviewSession, selectedProjects, selfScores, started, submitted]);

  useEffect(() => {
    if (!started || !activeSessionId || elapsedSeconds % 15 !== 0) return;
    const draft = buildActiveInterviewSession();
    if (draft) void saveActiveInterviewSession(draft);
  }, [activeSessionId, buildActiveInterviewSession, elapsedSeconds, saveActiveInterviewSession, started]);

  function startSession(id = sessionId) {
    const nextSession = interviewSessions.find((item) => item.id === id) ?? session;
    const nextStartedAt = new Date().toISOString();
    const nextActiveSessionId = makeId();
    setSessionId(nextSession.id);
    setTrack(nextSession.track);
    setStarted(true);
    setPaused(false);
    setIndex(0);
    setCoachOpen(false);
    setStartedAt(nextStartedAt);
    setActiveSessionId(nextActiveSessionId);
    setElapsedSeconds(0);
    setAnswers({});
    setSubmitted({});
    setChecked({});
    setSelfScores({});
    setCompletedSession(null);
    void saveActiveInterviewSession({
      id: nextActiveSessionId,
      cert,
      sessionId: nextSession.id,
      sessionTitle: nextSession.title,
      role: nextSession.role,
      track: nextSession.track,
      startedAt: nextStartedAt,
      updatedAt: nextStartedAt,
      targetMinutes: nextSession.minutes,
      elapsedSeconds: 0,
      currentIndex: 0,
      answers: {},
      submitted: {},
      checked: {},
      selfScores: {},
      selectedProjectIds: selectedProjects,
      status: "ACTIVE"
    });
  }

  function resumeActiveSession(draft: ActiveInterviewSession) {
    setTrack(draft.track);
    setSessionId(draft.sessionId);
    setStarted(true);
    setPaused(draft.status === "PAUSED");
    setIndex(draft.currentIndex);
    setCoachOpen(false);
    setStartedAt(draft.startedAt);
    setActiveSessionId(draft.id);
    setElapsedSeconds(draft.elapsedSeconds);
    setAnswers(draft.answers);
    setSubmitted(draft.submitted);
    setChecked(draft.checked);
    setSelfScores(draft.selfScores);
    setSelectedProjects(draft.selectedProjectIds);
    setCompletedSession(null);
  }

  async function discardActiveSession(id: string) {
    await clearActiveInterviewSession(id);
  }

  function toggleRubric(questionId: string, item: string) {
    setChecked((prev) => {
      const current = prev[questionId] ?? [];
      return {
        ...prev,
        [questionId]: current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
      };
    });
  }

  function submitCurrentAnswer() {
    if (!activeQuestion || activeAnswer.trim().length < 20 || activeScore < 1) return;
    const nextSubmitted = { ...submitted, [activeQuestion.id]: true };
    setSubmitted(nextSubmitted);
    setCoachOpen(true);
    const draft = buildActiveInterviewSession();
    if (draft) void saveActiveInterviewSession({ ...draft, submitted: nextSubmitted });
  }

  function togglePause() {
    const nextPaused = !paused;
    setPaused(nextPaused);
    const draft = buildActiveInterviewSession(nextPaused ? "PAUSED" : "ACTIVE");
    if (draft) void saveActiveInterviewSession(draft);
  }

  async function finishSession() {
    if (!session || !startedAt) return;
    const completedAt = new Date().toISOString();
    const answerRecords: InterviewAnswerRecord[] = sessionQuestions.map((question) => ({
      questionId: question.id,
      question: question.question,
      answer: answers[question.id]?.trim() ?? "",
      selfScore: selfScores[question.id] ?? 0,
      checkedRubric: checked[question.id] ?? [],
      testing: question.testing,
      track: question.track,
      phase: question.phase,
      bestProjects: question.bestProjects,
      answeredAt: completedAt
    }));
    const score = answerRecords.reduce((sum, answer) => sum + answer.selfScore, 0);
    const total = answerRecords.length * 5;
    const attempt: InterviewSessionAttempt = {
      id: makeId(),
      cert,
      sessionId: session.id,
      sessionTitle: session.title,
      role: session.role,
      track: session.track,
      startedAt,
      completedAt,
      durationSeconds: elapsedSeconds,
      targetMinutes: session.minutes,
      score,
      total,
      percentage: total ? Math.round((score / total) * 100) : 0,
      projectIds: selectedProjects,
      answers: answerRecords
    };
    await recordInterviewSession(attempt);
    if (activeSessionId) await clearActiveInterviewSession(activeSessionId);
    setCompletedSession(attempt);
    setStarted(false);
    setPaused(false);
    setCoachOpen(false);
    setActiveSessionId(null);
  }

  async function nextQuestion() {
    setCoachOpen(false);
    if (index + 1 >= sessionQuestions.length) await finishSession();
    else setIndex((value) => value + 1);
  }

  async function handleProjectImport() {
    const rate = canImportPublicRepo();
    if (!rate.allowed) {
      setImportError("Daily public repo import limit reached. Try again tomorrow.");
      return;
    }
    setImportingProject(true);
    setImportError(null);
    setImportMessage(null);
    try {
      const project = await importPublicGitHubProject(githubUrl);
      await recordImportedProject(project);
      setGithubUrl("");
      setImportMessage(`Imported ${project.owner}/${project.repo}. ${Math.max(0, rate.remaining - 1)} imports left today.`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Unable to import that project.");
    } finally {
      setImportingProject(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="aq-hero overflow-hidden p-5 sm:p-6">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{cert} Career Lab</Badge>
        <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">Interview simulator + project storytelling workspace.</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold text-[var(--aq-muted)] sm:text-base">Practice a focused interview across {trackSummary}. Use prepared project stories, write your answer, score yourself, then compare against coaching notes.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="aq-metric"><Mic className="mb-2 h-5 w-5 text-[var(--aq-blue-600)]" /><p className="text-sm font-bold">30-min simulator</p></div>
          <div className="aq-metric"><Network className="mb-2 h-5 w-5 text-[var(--aq-blue-600)]" /><p className="text-sm font-bold">Project mapper</p></div>
          <div className="aq-metric"><FileText className="mb-2 h-5 w-5 text-[var(--aq-blue-600)]" /><p className="text-sm font-bold">STAR builder</p></div>
          <div className="aq-metric"><ShieldCheck className="mb-2 h-5 w-5 text-[var(--aq-blue-600)]" /><p className="text-sm font-bold">Follow-up traps</p></div>
        </div>
      </section>

      <Card>
        <CardHeader><CardTitle>Choose interview lane</CardTitle><BriefcaseBusiness className="h-5 w-5" /></CardHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {jobTracks.map((item) => (
            <button key={item.id} aria-pressed={track === item.id} onClick={() => setTrack(item.id)} className={`rounded-md border p-4 text-left transition ${track === item.id ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white shadow-sm" : "aq-row-card"}`}>
              <h3 className="text-base font-bold">{item.title}</h3>
              <p className={`mt-1 text-xs font-bold ${track === item.id ? "opacity-75" : "text-slate-500 dark:text-slate-400"}`}>{item.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Interview Studio</Badge>
            <CardTitle className="text-2xl">30-minute mock interview</CardTitle>
            <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">Write the answer you would say, self-score it, then reveal coaching. Work in progress recovers locally and syncs to cloud when signed in.</p>
          </div>
          <Clock className="h-6 w-6 text-sky-500" />
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-3">
            {trackSessions.map((item) => (
              <button key={item.id} aria-pressed={session?.id === item.id} onClick={() => setSessionId(item.id)} className={`w-full rounded-md border p-4 text-left ${session?.id === item.id ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white shadow-sm" : "aq-row-card"}`}>
                <div className="flex items-center justify-between gap-2"><Badge className={session?.id === item.id ? "bg-white/15 text-white dark:bg-white/15 dark:text-white" : ""}>{item.role}</Badge><span className="text-xs font-semibold">{item.minutes} min</span></div>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className={`mt-1 text-xs font-bold ${session?.id === item.id ? "opacity-75" : "text-slate-500 dark:text-slate-400"}`}>{item.questionIds.length} high-value questions / warm-up to closing</p>
              </button>
            ))}
            <Button onClick={() => startSession()} size="lg" variant="hero" className="w-full"><Play className="h-4 w-4" /> Start 30-minute simulation</Button>
            {activeInterviewSession && !started && !completedSession ? (
              <div className="aq-subtle-panel p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)]">Recoverable session</Badge>
                  <Badge>{activeInterviewSession.status.toLowerCase()}</Badge>
                </div>
                <h3 className="text-lg font-semibold">{activeInterviewSession.sessionTitle}</h3>
                <p className="mt-1 text-xs font-bold text-[var(--aq-muted)]">
                  Question {activeInterviewSession.currentIndex + 1} / {formatClock(activeInterviewSession.elapsedSeconds)} elapsed / updated {new Date(activeInterviewSession.updatedAt).toLocaleString()}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => resumeActiveSession(activeInterviewSession)} variant="hero" size="sm"><Play className="h-4 w-4" /> Resume</Button>
                  <Button onClick={() => void discardActiveSession(activeInterviewSession.id)} variant="soft" size="sm"><RotateCcw className="h-4 w-4" /> Discard</Button>
                </div>
              </div>
            ) : null}
            {recentSessions.length ? <InterviewHistory sessions={recentSessions} /> : null}
          </div>

          <div className="aq-subtle-panel p-4">
            {completedSession ? <CompletionPanel session={completedSession} onRestart={() => startSession()} /> : null}
            {started && activeQuestion ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge>{phaseLabel(activeQuestion)}</Badge>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)] dark:text-[var(--aq-ink)]"><TimerReset className="h-3.5 w-3.5" /> {formatClock(remainingSeconds)} left</Badge>
                    <Badge>{formatClock(elapsedSeconds)} elapsed</Badge>
                  </div>
                </div>
                <Progress value={progress} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--aq-muted)]">Question {index + 1}/{sessionQuestions.length}</p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">{activeQuestion.question}</h2>
                </div>
                <div className="rounded-md border border-[var(--aq-border)] bg-white p-4 dark:bg-[#081d38]"><p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">What they are testing</p><p className="mt-1 font-semibold">{activeQuestion.testing}</p></div>
                <label className="grid gap-2 text-sm font-semibold text-[var(--aq-muted)]">
                  Your answer
                  <textarea
                    className="aq-input min-h-36 resize-y px-4 py-3 text-[var(--aq-ink)]"
                    value={activeAnswer}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, [activeQuestion.id]: event.target.value }))}
                    placeholder="Write the answer you would give in the interview. Include project evidence, what you would do first, and the business/security impact."
                  />
                </label>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-[var(--aq-muted)]">Self-score rubric</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activeQuestion.scoreRubric.map((item) => (
                      <button key={item} aria-pressed={activeChecked.includes(item)} onClick={() => toggleRubric(activeQuestion.id, item)} className={`flex items-center gap-2 rounded-md border p-3 text-left text-sm font-semibold ${activeChecked.includes(item) ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : "border-[var(--aq-border)] bg-white dark:bg-[#081d38]"}`}><CheckCircle2 className="h-4 w-4" /> {item}</button>
                    ))}
                  </div>
                </div>
                <div className="aq-row-card p-4">
                  <p className="mb-3 text-sm font-semibold text-[var(--aq-muted)]">Overall answer score</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((score) => <button key={score} aria-pressed={activeScore === score} onClick={() => setSelfScores((prev) => ({ ...prev, [activeQuestion.id]: score }))} className={`grid h-11 place-items-center rounded-md border text-sm font-bold ${activeScore === score ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : "border-[var(--aq-border)] bg-white dark:bg-[#081d38]"}`}><Star className="h-4 w-4" />{score}</button>)}
                  </div>
                </div>
                <div className="sticky bottom-24 z-10 grid gap-2 rounded-md border border-[var(--aq-border)] bg-white/95 p-2 shadow-sm backdrop-blur dark:bg-[#061227]/95 sm:static sm:grid-cols-3 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
                  <Button onClick={togglePause} variant="soft" size="lg"><PauseCircle className="h-4 w-4" /> {paused ? "Resume" : "Pause"}</Button>
                  <Button onClick={submitCurrentAnswer} variant="soft" size="lg" disabled={activeAnswer.trim().length < 20 || activeScore < 1}><Sparkles className="h-4 w-4" /> {activeSubmitted ? "Answer saved" : "Submit answer"}</Button>
                  <Button onClick={() => void nextQuestion()} variant="hero" size="lg" disabled={!activeSubmitted}>{index + 1 >= sessionQuestions.length ? "Complete interview" : "Next question"} <ArrowRight className="h-4 w-4" /></Button>
                </div>
                {activeSubmitted ? <Button onClick={() => setCoachOpen((value) => !value)} variant="ghost" size="sm">{coachOpen ? "Hide coach answer" : "Show coach answer again"}</Button> : null}
                {coachOpen ? <CoachAnswer question={activeQuestion} /> : null}
              </div>
            ) : !completedSession ? (
              <div className="grid min-h-[24rem] place-items-center text-center">
                <div>
                  <PauseCircle className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <h3 className="text-2xl font-semibold">Ready when you are.</h3>
                  <p className="mx-auto mt-2 max-w-md font-bold text-slate-500 dark:text-slate-400">Pick a lane, start the simulation, write your answer, then reveal the coach answer and score yourself against the rubric.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Project-to-Interview Mapper</Badge>
            <CardTitle className="text-2xl">{GITHUB_PROJECT_PROMPT}</CardTitle>
            <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">No projects are connected by default. Add a public GitHub repository to generate private Project Intelligence and role-specific interview preparation.</p>
          </div>
          <Network className="h-6 w-6" />
        </CardHeader>
        {importedProjects.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {importedProjects.map((project) => {
            const on = selectedProjects.includes(project.id);
            return <button key={project.id} aria-pressed={on} onClick={() => setSelectedProjects((prev) => on ? prev.filter((id) => id !== project.id) : [...prev, project.id])} className={`rounded-md border p-4 text-left transition ${on ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white shadow-sm" : "aq-row-card"}`}><Badge className={on ? "bg-white/15 text-white dark:bg-white/15 dark:text-white" : ""}>{project.status}</Badge><p className="mt-2 text-sm font-semibold">{project.owner}/{project.repo}</p><p className={`mt-1 text-xs font-bold ${on ? "text-white/75" : "text-[var(--aq-muted)]"}`}>{project.storyDraft.pitch30.slice(0, 140)}...</p></button>;
          })}
        </div>
        ) : (
          <div className="rounded-md border border-dashed border-[var(--aq-border)] p-5 text-center">
            <Github className="mx-auto mb-3 h-9 w-9 text-slate-400" />
            <h3 className="text-xl font-semibold">No projects connected</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm font-bold text-[var(--aq-muted)]">Add a GitHub repository to generate private Project Intelligence and role-specific interview preparation.</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_TRACKS.map((item) => <Button key={item} onClick={() => setMapperTrack(item)} variant={mapperTrack === item ? "default" : "soft"} size="sm">{item}</Button>)}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {mappedProjects.length ? mappedProjects.map((project) => <ProjectMapperCard key={project.id} project={project} />) : <p className="aq-subtle-panel p-4 font-semibold text-[var(--aq-muted)]">Select an imported project after adding a public GitHub repository.</p>}
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Questions this project set can answer</h3>
            {mapperQuestions.map((question) => (
              <div key={question.id} className="aq-subtle-panel p-4">
                <div className="mb-2 flex flex-wrap gap-2"><Badge>{question.track}</Badge><Badge>{question.level}</Badge></div>
                <p className="font-semibold">{question.question}</p>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Prepared answer angle: {question.sayThis.slice(0, 190)}...</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Public GitHub Import</Badge>
            <CardTitle className="text-2xl">Bring in a public repo and turn it into a draft interview story.</CardTitle>
            <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">Read-only import: README, language metadata, content hash, cached draft, and manual review status. No write scopes or private repo access.</p>
          </div>
          <Github className="h-6 w-6" />
        </CardHeader>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="aq-subtle-panel space-y-3 p-4">
            <label className="grid gap-2 text-sm font-semibold text-[var(--aq-muted)]">
              GitHub repository URL
              <input
                className="aq-input px-4 py-3 text-[var(--aq-ink)]"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
              />
            </label>
            <Button onClick={() => void handleProjectImport()} disabled={importingProject || !githubUrl.trim()} variant="hero" size="lg" className="w-full">
              <Github className="h-4 w-4" /> {importingProject ? "Importing..." : "Import public repo"}
            </Button>
            {importMessage ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:border-emerald-300/40 dark:bg-emerald-300/10 dark:text-emerald-100">{importMessage}</p> : null}
            {importError ? <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:border-rose-300/40 dark:bg-rose-300/10 dark:text-rose-100">{importError}</p> : null}
            <div className="grid gap-2 text-xs font-bold text-[var(--aq-muted)]">
              <p>Controls: public-read-only import, local and server rate limits, content-hash caching, server-side draft creation, manual approval state.</p>
              <p>Review rule: keep status as draft until you verify the README and code support every claim.</p>
            </div>
          </div>
          <ImportedProjectsPanel projects={importedProjects} onUpdateProject={(project) => void recordImportedProject(project)} />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg" variant="hero"><Link to={`/cert/${pathFor(cert)}/knowledge`}>Open domain quizzes</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/cert/${pathFor(cert)}/readiness`}>Check certification progress</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/history?cert=${cert}`}>Review attempts</Link></Button>
      </div>
    </motion.div>
  );
}

function ImportedProjectsPanel({ projects, onUpdateProject }: { projects: ImportedProject[]; onUpdateProject: (project: ImportedProject) => void }) {
  if (!projects.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-[var(--aq-border)] p-6 text-center">
        <div>
          <Github className="mx-auto mb-3 h-9 w-9 text-slate-400" />
          <h3 className="text-xl font-semibold">No imported projects yet.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-bold text-[var(--aq-muted)]">Import a public repository to create a draft project story that you can review before using in interviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.slice(0, 4).map((project) => (
        <details key={project.id} className="aq-row-card p-4" open={projects[0]?.id === project.id}>
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{project.status}</Badge>
                  {project.primaryLanguage ? <Badge>{project.primaryLanguage}</Badge> : null}
                  <Badge>{project.stars} stars</Badge>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{project.owner}/{project.repo}</h3>
                <p className="mt-1 max-w-2xl text-xs font-bold text-[var(--aq-muted)]">{project.readmeExcerpt}</p>
              </div>
              <Button asChild variant="soft" size="sm"><a href={project.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Repo</a></Button>
            </div>
          </summary>
          <div className="mt-4 grid gap-3">
            <div className="aq-subtle-panel p-4">
              <p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">30-second pitch draft</p>
              <p className="mt-1 text-sm font-semibold">{project.storyDraft.pitch30}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="aq-subtle-panel p-4">
                <p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">STAR draft</p>
                <p className="mt-2 text-sm font-semibold"><b>Situation:</b> {project.storyDraft.star.situation}</p>
                <p className="mt-2 text-sm font-semibold"><b>Task:</b> {project.storyDraft.star.task}</p>
                <p className="mt-2 text-sm font-semibold"><b>Action:</b> {project.storyDraft.star.action}</p>
                <p className="mt-2 text-sm font-semibold"><b>Result:</b> {project.storyDraft.star.result}</p>
              </div>
              <div className="aq-subtle-panel p-4">
                <p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">Architecture checks</p>
                {project.storyDraft.architecture.map((item) => <p key={item} className="mt-2 text-sm font-semibold">* {item}</p>)}
              </div>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">
              <p className="text-xs font-semibold uppercase">Review before approval</p>
              {project.storyDraft.risks.map((item) => <p key={item} className="mt-2 text-sm font-semibold">* {item}</p>)}
              <p className="mt-3 break-all text-xs font-bold opacity-80">Content hash: {project.contentHash}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => onUpdateProject({ ...project, status: "reviewed" })} variant="soft" size="sm">Mark reviewed</Button>
              <Button onClick={() => onUpdateProject({ ...project, status: "approved" })} variant="hero" size="sm">Approve story</Button>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function CompletionPanel({ session, onRestart }: { session: InterviewSessionAttempt; onRestart: () => void }) {
  return (
    <div className="mb-4 rounded-md border border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-80">Interview complete</p>
          <h3 className="mt-1 text-2xl font-semibold">{session.percentage}% self-score</h3>
          <p className="mt-2 text-sm font-semibold opacity-85">{session.score}/{session.total} points / {formatClock(session.durationSeconds)} practiced / {session.answers.length} answers saved locally</p>
        </div>
        <Trophy className="h-8 w-8" />
      </div>
      <Button onClick={onRestart} variant="soft" size="sm" className="mt-4"><RotateCcw className="h-4 w-4" /> Run it again</Button>
    </div>
  );
}

function InterviewHistory({ sessions }: { sessions: InterviewSessionAttempt[] }) {
  return (
    <div className="aq-subtle-panel p-4">
      <div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-[var(--aq-blue-600)]" /><h3 className="font-semibold">Local interview history</h3></div>
      <div className="grid gap-2">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-md border border-[var(--aq-border)] bg-white p-3 text-sm font-semibold dark:bg-[#081d38]">
            <div className="flex items-center justify-between gap-2"><span>{session.sessionTitle}</span><Badge>{session.percentage}%</Badge></div>
            <p className="mt-1 text-xs text-[var(--aq-muted)]">{new Date(session.completedAt).toLocaleDateString()} / {session.track} / {session.answers.length} answers</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachAnswer({ question }: { question: InterviewQuestion }) {
  return <div className="aq-row-card space-y-3 p-4">
    <div className="aq-subtle-panel p-4"><p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">Say this</p><p className="mt-1 font-semibold leading-relaxed">{question.sayThis}</p></div>
    <div><p className="mb-2 text-xs font-semibold uppercase text-[var(--aq-muted)]">Answer structure</p><div className="grid gap-2">{question.answerStructure.map((item) => <div key={item} className="flex items-center gap-2 rounded-md border border-[var(--aq-border)] bg-white p-3 text-sm font-semibold dark:bg-[#081d38]"><CheckCircle2 className="h-4 w-4 text-[var(--aq-blue-600)]" /> {item}</div>)}</div></div>
    <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase text-[var(--aq-muted)]">Follow-up traps</p>{question.followUps.map((item) => <p key={item} className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-300/50 dark:bg-amber-300/10 dark:text-amber-100">{item}</p>)}</div><div><p className="mb-2 text-xs font-semibold uppercase text-[var(--aq-muted)]">Avoid saying</p>{question.avoid.map((item) => <p key={item} className="mb-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-950 dark:border-rose-300/50 dark:bg-rose-300/10 dark:text-rose-100">{item}</p>)}</div></div>
    <div className="rounded-md border border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] p-4 text-white"><p className="text-xs font-semibold uppercase opacity-80">Project evidence rule</p><p className="mt-2 text-sm font-semibold opacity-85">Connect this answer to an imported, reviewed repository story. Keep generated project claims in draft until you verify the evidence.</p></div>
  </div>;
}

function ProjectMapperCard({ project }: { project: ImportedProject }) {
  const [tab, setTab] = useState<"pitch" | "star" | "architecture" | "resume">("pitch");
  return <div className="aq-row-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><Badge>{project.status}</Badge><h3 className="mt-2 text-xl font-semibold">{project.owner}/{project.repo}</h3></div><Button asChild variant="soft" size="sm"><a href={project.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Source</a></Button></div>
    <div className="mt-3 flex flex-wrap gap-2">{(["pitch", "star", "architecture", "resume"] as const).map((item) => <Button key={item} onClick={() => setTab(item)} variant={tab === item ? "default" : "soft"} size="sm">{item}</Button>)}</div>
    <div className="mt-4 space-y-3">
      {tab === "pitch" ? <><div className="aq-subtle-panel p-4"><p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">30-second pitch</p><p className="mt-1 font-semibold">{project.storyDraft.pitch30}</p></div><div className="aq-subtle-panel p-4"><p className="text-xs font-semibold uppercase text-[var(--aq-muted)]">2-minute version</p><p className="mt-1 text-sm font-semibold">{project.storyDraft.walkthrough2m}</p></div></> : null}
      {tab === "star" ? <div className="aq-subtle-panel p-4"><p className="text-sm font-semibold"><b>Situation:</b> {project.storyDraft.star.situation}</p><p className="mt-2 text-sm font-semibold"><b>Task:</b> {project.storyDraft.star.task}</p><p className="mt-2 text-sm font-semibold"><b>Action:</b> {project.storyDraft.star.action}</p><p className="mt-2 text-sm font-semibold"><b>Result:</b> {project.storyDraft.star.result}</p></div> : null}
      {tab === "architecture" ? <div className="grid gap-2">{project.storyDraft.architecture.map((item, index) => <div key={item} className="flex gap-3 rounded-md border border-[var(--aq-border)] bg-white p-3 text-sm font-semibold dark:bg-[#081d38]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--aq-blue-700)] text-xs text-white">{index + 1}</span>{item}</div>)}</div> : null}
      {tab === "resume" ? <div className="grid gap-2">{project.storyDraft.resumeBullets.map((bullet) => <p key={bullet} className="rounded-md border border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] p-3 text-sm font-semibold text-white">{bullet}</p>)}<p className="aq-subtle-panel p-3 text-sm font-semibold">Review status: {project.status}. Content hash: {project.contentHash}</p></div> : null}
    </div>
  </div>;
}
