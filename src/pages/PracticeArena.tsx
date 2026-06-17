import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, ShieldCheck } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { Cert, ExamMode, Question, QuizOption } from "../types";
import { buildExam, scoreAttempt } from "../utils/quizEngine";
import { formatSeconds } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { examBlueprints, domainWeights } from "../data/examBlueprints";

function validCert(value: string | null): Cert {
  if (value === "AZ-500" || value === "SC-500" || value === "SC-300") return value;
  return "SC-300";
}

function validMode(value: string | null): ExamMode {
  return value === "quiz" || value === "endless" || value === "weak" || value === "daily" || value === "case" || value === "kql" ? value : "timed";
}

function optionTone(optionId: QuizOption["id"], selected: QuizOption["id"] | null) {
  if (optionId === selected) return "bg-emerald-900 text-white ring-2 ring-emerald-300 dark:bg-emerald-300 dark:text-emerald-950";
  return "bg-white text-emerald-950 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:bg-emerald-900/70";
}

export function PracticeArena() {
  const [params] = useSearchParams();
  const questions = useAppStore((state) => state.questions);
  const recordAttempt = useAppStore((state) => state.recordAttempt);
  const userProgress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);

  const cert = validCert(params.get("cert"));
  const mode = validMode(params.get("mode"));
  const count = Number(params.get("count") ?? (mode === "daily" || mode === "quiz" ? 10 : mode === "case" ? 8 : mode === "kql" ? 8 : mode === "weak" ? 15 : 50));
  const minutes = Number(params.get("minutes") ?? (mode === "quiz" ? 12 : mode === "daily" ? 10 : mode === "case" ? 20 : mode === "kql" ? 15 : mode === "weak" ? 15 : 100));
  const timeLimitSeconds = minutes * 60;
  const weakTags = Object.entries(userProgress.weakTags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag]) => tag);
  const seedParam = params.get("seed") ?? undefined;
  const examTitle = params.get("examTitle") ?? `${cert} ${mode === "quiz" ? "Quiz Sprint" : mode === "daily" ? "Daily Boss" : mode === "case" ? "Case File" : "Mock Exam"}`;
  const blueprintId = params.get("examId") ?? undefined;
  const quizId = params.get("quizId") ?? undefined;
  const focusDomain = params.get("domain") ?? undefined;
  const focusTags = params.get("tags")?.split(",").filter(Boolean) ?? [];
  const fighter = params.get("fighter");
  const blueprint = blueprintId ? examBlueprints.find((item) => item.id === blueprintId) : undefined;
  const weights = blueprint?.domainWeights ?? (!focusDomain && mode === "timed" ? domainWeights[cert] : undefined);

  const exam = useMemo(
    () => buildExam({ bank: questions, cert, mode, count, weakTags, seed: seedParam, focusDomain, focusTags, domainWeights: weights }),
    // Fresh randomized structure each launch unless a retake seed is supplied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cert, mode, count, seedParam, focusDomain, params.toString()]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<QuizOption["id"] | null>(null);
  const [selections, setSelections] = useState<Record<string, QuizOption["id"] | null>>({});
  const [secondsByQuestion, setSecondsByQuestion] = useState<Record<string, number>>({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const qStart = useRef(Date.now());
  const question = exam.questions[index];

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (!finished && elapsed >= timeLimitSeconds) setFinished(true);
  }, [elapsed, finished, timeLimitSeconds]);

  useEffect(() => {
    qStart.current = Date.now();
    setSelected(null);
  }, [index]);

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

  function next() {
    if (!selected || !question) return;
    if (index + 1 >= exam.questions.length) setFinished(true);
    else setIndex((v) => v + 1);
  }

  const finalAttempt = useMemo(() => scoreAttempt({
    cert,
    mode,
    kind: mode === "quiz" ? "quiz" : mode === "daily" ? "daily" : mode === "case" ? "case" : mode === "kql" ? "kql" : mode === "timed" ? "exam" : "practice",
    title: examTitle,
    blueprintId,
    quizId,
    startedAt,
    seed: exam.seed,
    questions: exam.questions,
    selections,
    secondsByQuestion,
    timeLimitSeconds
  }), [blueprintId, cert, exam.questions, exam.seed, examTitle, mode, quizId, secondsByQuestion, selections, startedAt, timeLimitSeconds]);

  useEffect(() => {
    if (finished && !saved) {
      setSaved(true);
      void recordAttempt(finalAttempt);
      if (finalAttempt.percentage >= 70 && !settings.reduceAnimations && !settings.lowBandwidth) void confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
    }
  }, [finalAttempt, finished, recordAttempt, saved, settings.reduceAnimations, settings.lowBandwidth]);

  if (!exam.questions.length) {
    return <Card><CardTitle>No questions found for this run.</CardTitle><p className="mt-2 font-medium text-slate-500">Try a mixed exam or another quiz.</p></Card>;
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card className={finalAttempt.passed ? "bg-emerald-700 text-white" : "bg-slate-950 text-white"}>
          <CardHeader>
            <div>
              <Badge className="bg-white/20 text-white">{finalAttempt.kind.toUpperCase()} COMPLETE</Badge>
              <CardTitle className="mt-3 text-3xl">{examTitle}</CardTitle>
              <p className="font-medium opacity-80">{formatSeconds(finalAttempt.timeTakenSeconds)} used · {formatSeconds(timeLimitSeconds)} limit</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold">{finalAttempt.percentage}%</div>
              <p className="text-sm font-semibold">{finalAttempt.passed ? "Passed" : "Needs review"}</p>
            </div>
          </CardHeader>
          <Progress value={finalAttempt.percentage} className="bg-white/30" />
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/20 p-3"><p className="text-xl font-semibold">{finalAttempt.score}</p><p className="text-xs font-semibold">Correct</p></div>
            <div className="rounded-xl bg-white/20 p-3"><p className="text-xl font-semibold">{finalAttempt.total}</p><p className="text-xs font-semibold">Total</p></div>
            <div className="rounded-xl bg-white/20 p-3"><p className="text-xl font-semibold">+{finalAttempt.readinessDelta ?? 0}</p><p className="text-xs font-semibold">Readiness</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Domain report</CardTitle><ShieldCheck className="h-6 w-6 text-emerald-500" /></CardHeader>
          <div className="grid gap-3">
            {Object.entries(finalAttempt.domains).map(([domain, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              return <div key={domain} className="rounded-xl bg-slate-100 p-3 dark:bg-white/10"><div className="mb-2 flex justify-between gap-3 text-sm font-semibold"><span>{domain}</span><span>{stats.correct}/{stats.total} · {pct}%</span></div><Progress value={pct} /></div>;
            })}
          </div>
        </Card>


        <Card>
          <CardHeader><CardTitle>Answer review</CardTitle><CheckCircle2 className="h-6 w-6 text-sky-500" /></CardHeader>
          <div className="space-y-3">
            {exam.questions.map((q, i) => {
              const chosen = selections[q.id];
              const chosenText = q.options.find((o) => o.id === chosen)?.text ?? "Unanswered";
              const correctText = q.options.find((o) => o.id === q.answer)?.text ?? q.answer;
              const ok = chosen === q.answer;
              return (
                <details key={q.id} className="rounded-xl bg-slate-100 p-4 dark:bg-white/10">
                  <summary className="cursor-pointer text-sm font-semibold">{i + 1}. {ok ? "Correct" : "Missed"} · {q.domain}</summary>
                  <p className="mt-3 font-semibold">{q.stem}</p>
                  <div className="mt-3 grid gap-2 text-sm font-medium">
                    <p className={ok ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>Your answer: {chosen ? `${chosen}. ${chosenText}` : "Unanswered"}</p>
                    <p className="text-emerald-700 dark:text-emerald-300">Correct answer: {q.answer}. {correctText}</p>
                    <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                    {!ok && chosen && q.whyWrong[chosen] ? <p className="rounded-xl bg-white p-3 dark:bg-black/20">Why your answer missed: {q.whyWrong[chosen]}</p> : null}
                  </div>
                </details>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild size="lg" variant="hero"><Link to={`/arena?cert=${cert}&mode=${mode}&count=${count}&minutes=${minutes}&examTitle=${encodeURIComponent(examTitle)}${focusDomain ? `&domain=${encodeURIComponent(focusDomain)}` : ""}${focusTags.length ? `&tags=${encodeURIComponent(focusTags.join(","))}` : ""}${blueprintId ? `&examId=${blueprintId}` : ""}${quizId ? `&quizId=${quizId}` : ""}`}><RotateCcw /> New randomized structure</Link></Button>
          <Button asChild size="lg" variant="soft"><Link to={`/arena?cert=${cert}&mode=${mode}&count=${count}&minutes=${minutes}&seed=${encodeURIComponent(exam.seed)}&examTitle=${encodeURIComponent(examTitle)}${focusDomain ? `&domain=${encodeURIComponent(focusDomain)}` : ""}${focusTags.length ? `&tags=${encodeURIComponent(focusTags.join(","))}` : ""}`}>Retake same questions</Link></Button>
          <Button asChild size="lg" variant="default"><Link to="/history">Past Exams & Quizzes</Link></Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm"><Link to={`/cert/${cert.toLowerCase()}/knowledge`}><ArrowLeft className="h-4 w-4" /> Knowledge</Link></Button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge>{examTitle}</Badge>
          {fighter ? <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">{fighter}</Badge> : null}
          <Badge className={timeLeft < 60 ? "bg-rose-500 text-white" : "bg-emerald-100 text-emerald-950"}><Clock className="h-3 w-3" /> {formatSeconds(timeLeft)}</Badge>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <Badge className="mb-2 bg-emerald-900 text-white dark:bg-emerald-300 dark:text-emerald-950">{question.scenarioOrg}</Badge>
            <CardTitle className="text-xl">Question {index + 1}/{exam.questions.length}</CardTitle>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{question.domain}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">{attempted}/{exam.questions.length}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">answered</p>
          </div>
        </CardHeader>
        <Progress value={progressPercent} />
      </Card>

      <motion.div key={question.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <Card className="border-2 border-slate-950/10 dark:border-white/10">
          <CardContent>
            <p className="text-xl font-semibold leading-tight">{question.stem}</p>
            {question.diagram ? <pre className="rounded-xl bg-slate-950 p-4 text-sm font-medium text-sky-200 dark:bg-black/40">{question.diagram}</pre> : null}
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {question.options.map((option) => (
            <motion.button whileTap={{ scale: 0.98 }} key={option.id} onClick={() => choose(option.id)} className={`flex min-h-16 items-center gap-3 rounded-xl p-4 text-left text-base font-semibold shadow-sm transition ${optionTone(option.id, selected)}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/10 text-sm dark:bg-white/10">{option.id}</span>
              <span className="flex-1">{option.text}</span>
              {selected === option.id ? <CheckCircle2 className="h-5 w-5" /> : null}
            </motion.button>
          ))}
        </div>

        <div className="sticky bottom-24 z-20 sm:static">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Button onClick={next} disabled={!selected} size="lg" variant="hero" className="h-12 w-full text-sm">{index + 1 >= exam.questions.length ? "Finish run" : "Next question"}</Button>
            <Button onClick={() => setFinished(true)} size="lg" variant="soft" className="h-12 text-sm">Finish now · grade answered</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
