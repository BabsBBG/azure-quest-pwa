import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Filter, Medal, RotateCcw, Search } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { formatSeconds } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import type { AttemptKind, Cert } from "../types";

const kindLabels: Record<AttemptKind | "all", string> = {
  all: "All",
  exam: "Exams",
  quiz: "Quizzes",
  daily: "Daily Boss",
  practice: "Practice",
  scenario: "Scenarios",
  case: "Case Files",
  kql: "KQL Gym"
};

export function PastExams() {
  const attempts = useAppStore((state) => state.attempts);
  const [kind, setKind] = useState<AttemptKind | "all">("all");
  const [cert, setCert] = useState<Cert | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => attempts.filter((attempt) => {
    const attemptKind = attempt.kind ?? (attempt.mode === "quiz" ? "quiz" : attempt.mode === "daily" ? "daily" : attempt.mode === "timed" ? "exam" : "practice");
    const title = attempt.title ?? `${attempt.cert} ${attempt.mode}`;
    return (kind === "all" || attemptKind === kind) && (cert === "all" || attempt.cert === cert) && title.toLowerCase().includes(query.toLowerCase());
  }), [attempts, cert, kind, query]);

  const totals = useMemo(() => {
    const exams = attempts.filter((a) => (a.kind ?? (a.mode === "timed" ? "exam" : "practice")) === "exam");
    const quizzes = attempts.filter((a) => (a.kind ?? (a.mode === "quiz" ? "quiz" : "practice")) === "quiz");
    const avg = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
    return { exams: exams.length, quizzes: quizzes.length, avg };
  }, [attempts]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-xl sm:text-2xl">Past Exams, Quizzes & Labs</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Score reports with timing, domains, retakes, and weak-area insights.</p>
          </div>
          <Badge className="shrink-0 bg-amber-300 text-slate-950">{attempts.length} attempts</Badge>
        </CardHeader>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/10 sm:rounded-2xl sm:p-4">
            <p className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{totals.exams}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Exam attempts</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/10 sm:rounded-2xl sm:p-4">
            <p className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{totals.quizzes}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Quiz attempts</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/10 sm:rounded-2xl sm:p-4">
            <p className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{totals.avg}%</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Average score</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Filter reports</CardTitle><Filter className="h-5 w-5 text-slate-400" /></CardHeader>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium dark:border-white/15 dark:bg-slate-800"><Search className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" /></label>
          <select value={cert} onChange={(e) => setCert(e.target.value as Cert | "all")} className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-white/15 dark:bg-slate-800 dark:text-white"><option value="all">All certs</option><option value="SC-300">SC-300</option><option value="AZ-500">AZ-500</option><option value="SC-500">SC-500</option></select>
          <select value={kind} onChange={(e) => setKind(e.target.value as AttemptKind | "all")} className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-white/15 dark:bg-slate-800 dark:text-white">{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </Card>

      {!filtered.length ? (
        <Card>
          <CardTitle>No matching attempts yet.</CardTitle>
          <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">Run a quiz sprint or mock exam to create a report.</p>
          <Button asChild className="mt-4" variant="hero" size="lg"><Link to="/arena?cert=SC-300&mode=quiz&count=10&minutes=12&examTitle=SC-300%20Quiz%20Sprint">Start first sprint</Link></Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((attempt) => {
            const attemptKind = attempt.kind ?? (attempt.mode === "quiz" ? "quiz" : attempt.mode === "daily" ? "daily" : attempt.mode === "timed" ? "exam" : "practice");
            const title = attempt.title ?? `${attempt.cert} ${attempt.mode}`;
            const limit = attempt.timeLimitSeconds;
            const queryBase = `/arena?cert=${attempt.cert}&mode=${attempt.mode}&count=${attempt.total}${limit ? `&minutes=${Math.round(limit / 60)}` : ""}&examTitle=${encodeURIComponent(title)}`;
            return (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{attempt.cert}</Badge>
                      <Badge className="bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300">{kindLabels[attemptKind]}</Badge>
                      <Badge className={attempt.percentage >= 70 ? "bg-blue-500 text-white" : "bg-amber-300 text-slate-950"}>{attempt.percentage >= 70 ? "Pass" : "Review"}</Badge>
                    </div>
                    <CardTitle className="truncate text-base sm:text-xl">{title}</CardTitle>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{attempt.score}/{attempt.total} correct · {attempt.percentage}%</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black">+{attempt.readinessDelta ?? 0}</p>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">readiness</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(attempt.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatSeconds(attempt.timeTakenSeconds)} taken</span>
                    {limit ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatSeconds(limit)} limit</span> : null}
                  </div>

                  <div className="grid gap-2">
                    {Object.entries(attempt.domains).map(([domain, stats]) => {
                      const pct = Math.round((stats.correct / stats.total) * 100);
                      return (
                        <div key={domain} className="rounded-xl bg-slate-100 p-3 dark:bg-white/10">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">{domain}</span>
                            <span className="shrink-0 text-sm font-bold text-slate-500 dark:text-slate-400">{stats.correct}/{stats.total} · {pct}%</span>
                          </div>
                          <Progress value={pct} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Button asChild variant="hero" size="lg"><Link to={`${queryBase}&seed=${encodeURIComponent(attempt.retakeSeed ?? "")}`}><RotateCcw className="h-4 w-4" /> Retake same set</Link></Button>
                    <Button asChild variant="soft" size="lg"><Link to={queryBase}><Medal className="h-4 w-4" /> New randomized</Link></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
