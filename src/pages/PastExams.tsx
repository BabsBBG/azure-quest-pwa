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
      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader>
          <div>
            <CardTitle className="text-3xl">Past Exams, Quizzes & Labs</CardTitle>
            <p className="font-bold opacity-75">Saved score reports with timing, domains, retakes, and weak-area evidence.</p>
          </div>
          <Badge className="bg-amber-300 text-slate-950">{attempts.length} saved</Badge>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/15 p-4"><p className="text-2xl font-black">{totals.exams}</p><p className="text-xs font-black opacity-75">Exam attempts</p></div>
          <div className="rounded-2xl bg-white/15 p-4"><p className="text-2xl font-black">{totals.quizzes}</p><p className="text-xs font-black opacity-75">Quiz attempts</p></div>
          <div className="rounded-2xl bg-white/15 p-4"><p className="text-2xl font-black">{totals.avg}%</p><p className="text-xs font-black opacity-75">Average readiness evidence</p></div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Filter reports</CardTitle><Filter className="h-5 w-5 text-sky-500" /></CardHeader>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold dark:bg-white/10"><Search className="h-4 w-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title" className="w-full bg-transparent outline-none" /></label>
          <select value={cert} onChange={(e) => setCert(e.target.value as Cert | "all")} className="rounded-2xl bg-slate-100 px-4 py-3 font-black dark:bg-slate-900"><option value="all">All certs</option><option value="SC-300">SC-300</option><option value="AZ-500">AZ-500</option><option value="SC-500">SC-500</option></select>
          <select value={kind} onChange={(e) => setKind(e.target.value as AttemptKind | "all")} className="rounded-2xl bg-slate-100 px-4 py-3 font-black dark:bg-slate-900">{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
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
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{attempt.cert}</Badge>
                      <Badge className="bg-violet-500 text-white">{kindLabels[attemptKind]}</Badge>
                      <Badge className={attempt.percentage >= 70 ? "bg-emerald-400 text-slate-950" : "bg-amber-300 text-slate-950"}>{attempt.percentage >= 70 ? "Pass" : "Review"}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-2xl">{title}</CardTitle>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{attempt.score}/{attempt.total} · {attempt.percentage}%</p>
                  </div>
                  <div className="text-right"><p className="text-3xl font-black">+{attempt.readinessDelta ?? 0}</p><p className="text-xs font-black text-slate-500 dark:text-slate-400">Readiness pts</p></div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm font-black text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(attempt.completedAt).toLocaleString()}</p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatSeconds(attempt.timeTakenSeconds)} taken</p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {limit ? `${formatSeconds(limit)} limit` : "No limit saved"}</p>
                  </div>

                  <div className="grid gap-3">
                    {Object.entries(attempt.domains).map(([domain, stats]) => {
                      const pct = Math.round((stats.correct / stats.total) * 100);
                      return <div key={domain} className="rounded-2xl bg-slate-100 p-3 dark:bg-white/10"><div className="mb-2 flex items-center justify-between gap-3 text-sm font-black"><span>{domain}</span><span>{stats.correct}/{stats.total} · {pct}%</span></div><Progress value={pct} /></div>;
                    })}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button asChild variant="hero" size="lg"><Link to={`${queryBase}&seed=${encodeURIComponent(attempt.retakeSeed ?? "")}`}><RotateCcw className="h-5 w-5" /> Retake same set</Link></Button>
                    <Button asChild variant="soft" size="lg"><Link to={queryBase}><Medal className="h-5 w-5" /> New randomized set</Link></Button>
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
