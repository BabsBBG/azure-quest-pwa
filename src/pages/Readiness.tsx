import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Gauge, Target, TrendingUp } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { readinessAll, domainAverages, mistakeTaxonomy } from "../utils/readiness";
import { certFromSlug, isCertActivatable, metaFor, pathFor } from "../data/certPaths";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import type { Cert } from "../types";
import { finiteRunCoverageSummary } from "../data/finiteCertificationRuns";

function heatTone(pct: number) {
  if (pct >= 85) return "bg-blue-500 text-white";
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
    <Card className="aq-hero"><CardHeader><div><Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Certification Progress</Badge><CardTitle className="mt-3 text-3xl font-bold sm:text-4xl">{selectedCert ? `${selectedCert} progress overview` : "Progress overview"}</CardTitle><p className="font-semibold text-[var(--aq-muted)]">Score trends, timing, hard-question accuracy, domain performance, misconception patterns, and next best action.</p></div><Gauge className="h-7 w-7 text-[var(--aq-blue-600)]" /></CardHeader></Card>
    <QuestionBankNotice compact />

    {!selectedCert ? <div className="grid gap-3 sm:grid-cols-3">{(["SC-300", "AZ-500", "SC-500"] as Cert[]).map((c) => <Button key={c} asChild variant="soft"><Link to={`/cert/${c.toLowerCase()}/readiness`}>{c} progress</Link></Button>)}</div> : null}

    <div className="grid gap-4 md:grid-cols-3">{reports.map(r => {
      const active = isCertActivatable(r.cert);
      const currentMeta = metaFor(r.cert);
      const hasPublishedRun = finiteRunCoverageSummary(r.cert).published > 0;
      return <Card key={r.cert} className="aq-row-card"><CardHeader><div><Badge>{r.cert}</Badge>{!active ? <Badge className="ml-2 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-300 dark:text-slate-950">{currentMeta.status}</Badge> : null}<CardTitle className="mt-2 text-3xl font-bold">{r.readiness}%</CardTitle><p className="font-semibold text-[var(--aq-muted)]">{r.status}</p></div><Target className="h-6 w-6 text-[var(--aq-blue-600)]" /></CardHeader><Progress value={r.readiness}/><CardContent><div className="grid gap-2 text-sm font-semibold"><p>Certification Run average: {r.examAverage}%</p><p>Quick Quiz average: {r.quizAverage}%</p><p>Consistency: {r.consistency}%</p><p>Timing discipline: {r.timeManagement}%</p><p>Hard-question accuracy: {r.hardAccuracy}%</p><p>Target domain: {r.weakestDomain ?? "Run a certification run"}</p></div><div className="aq-subtle-panel mt-4 p-3 text-sm font-semibold">{active && hasPublishedRun ? r.recommendation : active ? "Source-grounded certification run not ready. Approved coverage is incomplete, so demo questions are not used here as a fallback." : currentMeta.transitionMessage}</div>{active && hasPublishedRun ? <Button asChild className="mt-4 w-full" variant="hero"><Link to={`/cert/${r.cert.toLowerCase()}/knowledge`}>Open published runs <ArrowRight className="h-4 w-4" /></Link></Button> : active ? <Button type="button" className="mt-4 w-full" variant="soft" disabled>Certification run not ready</Button> : <Button asChild className="mt-4 w-full" variant="soft"><Link to={`/cert/${pathFor(currentMeta.replacementCert ?? "SC-500")}/knowledge`}>Continue with {currentMeta.replacementCert ?? "active path"} <ArrowRight className="h-4 w-4" /></Link></Button>}</CardContent></Card>;
    })}</div>

    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <CardHeader><CardTitle>Expanded domain heatmap</CardTitle><Activity className="h-5 w-5 text-sky-500" /></CardHeader>
        <CardContent>
          {Object.keys(domains).length ? <div className="grid gap-3">{Object.entries(domains).map(([domain, s]) => <div key={domain} className="aq-row-card p-4"><div className="flex justify-between gap-3 text-sm font-semibold"><span>{domain}</span><span>{s.percentage}%</span></div><Progress className="mt-3" value={s.percentage} /><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[var(--aq-muted)]"><div className="aq-subtle-panel p-2">{s.correct}/{s.total}<br/>score</div><div className="aq-subtle-panel p-2">{s.total}<br/>seen</div><div className="aq-subtle-panel p-2">{s.percentage < 70 ? "Target" : "Hold"}<br/>action</div></div></div>)}</div> : <p className="font-bold text-slate-500">Take a quick quiz or certification run to build the heatmap.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Why you miss</CardTitle><Brain className="h-5 w-5 text-[var(--aq-blue-600)]" /></CardHeader>
        <CardContent>{mistakes.length ? <div className="grid gap-2">{mistakes.map(([label,count]) => <div key={label} className="aq-subtle-panel flex justify-between p-3 text-sm font-semibold"><span>{label}</span><span>{count}</span></div>)}</div> : <p className="font-bold text-slate-500">Mistake categories appear after attempts.</p>}</CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle>Recent performance trend</CardTitle><TrendingUp className="h-5 w-5 text-blue-500" /></CardHeader>
      <CardContent>
        {recent.length ? (
          <div className="grid gap-3">
            {recent.map((a, idx) => {
              const prev = recent[idx + 1];
              const delta = prev ? a.percentage - prev.percentage : null;
              const date = new Date(a.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              const mins = Math.round(a.timeTakenSeconds / 60);
              return (
                <div key={a.id} className="aq-row-card space-y-2.5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge className="capitalize">{a.kind}</Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{date} / {mins}m</span>
                        {delta !== null && (
                          <span className={`text-xs font-semibold ${delta > 0 ? "text-blue-500" : delta < 0 ? "text-rose-500" : "text-slate-400"}`}>
                            {delta > 0 ? `up +${delta}%` : delta < 0 ? `down ${delta}%` : "steady"}
                          </span>
                        )}
                      </div>
                      <p className="truncate font-semibold">{a.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{a.score}/{a.total} correct</p>
                    </div>
                    <div className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold ${heatTone(a.percentage)}`}>{a.percentage}%</div>
                  </div>
                  <Progress value={a.percentage} />
                </div>
              );
            })}
          </div>
        ) : <p className="font-bold text-slate-500">No attempts yet.</p>}
      </CardContent>
    </Card>

    {selectedCert && meta ? <div className="grid gap-3 sm:grid-cols-3"><Button asChild variant="hero" size="lg"><Link to={`/cert/${selectedCert.toLowerCase()}/knowledge`}>Open Domain Quizzes</Link></Button><Button asChild variant="soft" size="lg"><Link to={`/cert/${selectedCert.toLowerCase()}/job`}>Career Lab</Link></Button><Button asChild variant="soft" size="lg"><Link to={`/history?cert=${selectedCert}`}>Activity History</Link></Button></div> : null}
  </motion.div>;
}
