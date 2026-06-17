import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Gauge, Target, TrendingUp } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { readinessAll, domainAverages, mistakeTaxonomy } from "../utils/readiness";
import { certFromSlug, metaFor } from "../data/certPaths";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import type { Cert } from "../types";

function heatTone(pct: number) {
  if (pct >= 85) return "bg-emerald-500 text-white";
  if (pct >= 70) return "bg-sky-500 text-white";
  if (pct >= 55) return "bg-amber-300 text-slate-950";
  return "bg-rose-500 text-white";
}

export function Readiness() {
  const { cert: slug } = useParams();
  const selectedCert = slug ? certFromSlug(slug) : undefined;
  const attempts = useAppStore(s => s.attempts);
  const questions = useAppStore(s => s.questions);
  const allReports = readinessAll(attempts, questions);
  const reports = selectedCert ? allReports.filter((r) => r.cert === selectedCert) : allReports;
  const domains = domainAverages(selectedCert ? attempts.filter((a) => a.cert === selectedCert) : attempts);
  const mistakes = Object.entries(mistakeTaxonomy(selectedCert ? attempts.filter((a) => a.cert === selectedCert) : attempts)).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const recent = attempts.filter((a) => !selectedCert || a.cert === selectedCert).slice(0, 8);
  const meta = selectedCert ? metaFor(selectedCert) : undefined;

  return <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-5">
    <Card className="luxury-panel text-white"><CardHeader><div><Badge className="bg-amber-300 text-slate-950">Exam readiness only</Badge><CardTitle className="mt-3 text-3xl sm:text-5xl">{selectedCert ? `${selectedCert} Readiness Command Center` : "Exam Readiness Command Center"}</CardTitle><p className="font-bold opacity-75">Score trends, timing, hard-question accuracy, domain heatmap, mistake patterns, and next best action.</p></div><Gauge className="h-7 w-7" /></CardHeader></Card>

    {!selectedCert ? <div className="grid gap-3 sm:grid-cols-3">{(["SC-300", "AZ-500", "SC-500"] as Cert[]).map((c) => <Button key={c} asChild variant="soft"><Link to={`/cert/${c.toLowerCase()}/readiness`}>{c} readiness</Link></Button>)}</div> : null}

    <div className="grid gap-4 md:grid-cols-3">{reports.map(r => <Card key={r.cert} className="border-0 shadow-card"><CardHeader><div><Badge>{r.cert}</Badge><CardTitle className="mt-2 text-3xl">{r.readiness}%</CardTitle><p className="font-black text-slate-500 dark:text-slate-400">{r.status}</p></div><Target className="h-6 w-6 text-emerald-500" /></CardHeader><Progress value={r.readiness}/><CardContent><div className="grid gap-2 text-sm font-black"><p>Mock exam average: {r.examAverage}%</p><p>Quiz average: {r.quizAverage}%</p><p>Consistency: {r.consistency}%</p><p>Timing discipline: {r.timeManagement}%</p><p>Hard-question accuracy: {r.hardAccuracy}%</p><p>Weakest domain: {r.weakestDomain ?? "Run a mock"}</p></div><div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-bold dark:bg-white/10">{r.recommendation}</div><Button asChild className="mt-4 w-full" variant="hero"><Link to={`/arena?cert=${r.cert}&mode=timed&count=50&minutes=100&examTitle=${encodeURIComponent(`${r.cert} Weighted Mock`)}`}>Start weighted mock <ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card>)}</div>

    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <CardHeader><CardTitle>Expanded domain heatmap</CardTitle><Activity className="h-5 w-5 text-sky-500" /></CardHeader>
        <CardContent>
          {Object.keys(domains).length ? <div className="grid gap-3 sm:grid-cols-2">{Object.entries(domains).map(([domain, s]) => <div key={domain} className={`rounded-[1.25rem] p-4 ${heatTone(s.percentage)}`}><div className="flex justify-between gap-3 text-sm font-black"><span>{domain}</span><span>{s.percentage}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${s.percentage}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-xl bg-white/15 p-2">{s.correct}/{s.total}<br/>score</div><div className="rounded-xl bg-white/15 p-2">{s.total}<br/>seen</div><div className="rounded-xl bg-white/15 p-2">{s.percentage < 70 ? "Drill" : "Hold"}<br/>action</div></div></div>)}</div> : <p className="font-bold text-slate-500">Take a quiz or mock exam to build the heatmap.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Why you miss</CardTitle><Brain className="h-5 w-5 text-violet-500" /></CardHeader>
        <CardContent>{mistakes.length ? <div className="grid gap-2">{mistakes.map(([label,count]) => <div key={label} className="flex justify-between rounded-2xl bg-slate-100 p-3 text-sm font-black dark:bg-white/10"><span>{label}</span><span>{count}</span></div>)}</div> : <p className="font-bold text-slate-500">Mistake categories appear after attempts.</p>}</CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle>Recent performance trend</CardTitle><TrendingUp className="h-5 w-5 text-emerald-500" /></CardHeader>
      <CardContent>{recent.length ? <div className="grid gap-3">{recent.map((a, idx) => <div key={a.id} className="grid gap-2 rounded-2xl bg-slate-100 p-3 dark:bg-white/10 sm:grid-cols-[1fr_auto]"><div><p className="font-black">{idx + 1}. {a.title}</p><p className="text-xs font-bold text-slate-500 dark:text-slate-400">{a.kind} · {new Date(a.startedAt).toLocaleString()} · {Math.round(a.timeTakenSeconds / 60)} min</p></div><div className={`rounded-xl px-3 py-2 text-sm font-black ${heatTone(a.percentage)}`}>{a.percentage}%</div></div>)}</div> : <p className="font-bold text-slate-500">No attempts yet.</p>}</CardContent>
    </Card>

    {selectedCert && meta ? <div className="grid gap-3 sm:grid-cols-3"><Button asChild variant="hero" size="lg"><Link to={`/cert/${selectedCert.toLowerCase()}/knowledge`}>Practice {selectedCert}</Link></Button><Button asChild variant="soft" size="lg"><Link to={`/cert/${selectedCert.toLowerCase()}/job`}>Interview readiness</Link></Button><Button asChild variant="soft" size="lg"><Link to={`/history?cert=${selectedCert}`}>Past attempts</Link></Button></div> : null}
  </motion.div>;
}
