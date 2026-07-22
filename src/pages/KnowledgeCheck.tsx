import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Clock, DatabaseZap, FileQuestion, FlaskConical, Play, RotateCcw } from "lucide-react";
import { certFromSlug, isCertActivatable, metaFor, pathFor } from "../data/certPaths";
import { examBlueprints } from "../data/examBlueprints";
import { quizBlueprints } from "../data/quizBlueprints";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { approvedSourceGroundedQuestions, generationRuns, sourceGroundingSummary } from "../data/sourceGrounding";

export function KnowledgeCheck() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const meta = metaFor(cert);
  const attempts = useAppStore((state) => state.attempts).filter((a) => a.cert === cert);
  const certQuizzes = quizBlueprints.filter((q) => q.cert === cert);
  const certExams = examBlueprints.filter((e) => e.cert === cert);
  const approvedSourceQuestions = approvedSourceGroundedQuestions().filter((question) => question.cert === cert);
  const latestGenerationRun = generationRuns[0];
  const sourceSummary = sourceGroundingSummary();
  const active = isCertActivatable(cert);
  const latest = attempts[0];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="aq-hero overflow-hidden p-5 sm:p-7">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{cert} Assessment Center</Badge>
        {meta.status !== "ACTIVE" ? <Badge className="mb-3 ml-2 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-300 dark:text-slate-950">{meta.status}</Badge> : null}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Domain quizzes and certification runs.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold text-[var(--aq-muted)]">Focused quick quizzes and finite certification runs. Answers stay hidden until you finish, so timing stays realistic.</p>
        <div className="mt-4">
          <Button asChild variant="soft"><Link to="/exam-walkthrough">Open Exam Walkthrough</Link></Button>
        </div>
        {meta.transitionMessage ? <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">{meta.transitionMessage}</p> : null}
      </section>

      <QuestionBankNotice />

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Source-grounded preview</Badge>
            <CardTitle>Approved source-grounded preview</CardTitle>
            <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">Approved records are tracked separately from the demo practice bank until the full reviewed question set is large enough to replace seed content.</p>
          </div>
          <DatabaseZap className="h-6 w-6 text-[var(--aq-blue-600)]" />
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="aq-metric">
            <p className="text-2xl font-bold">{approvedSourceQuestions.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Reviewed preview items</p>
          </div>
          <div className="aq-metric">
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Source chunk required</p>
          </div>
          <div className="aq-metric">
            <p className="text-2xl font-bold">{sourceSummary.drafts}</p>
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Drafts held</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="aq-subtle-panel p-3 text-sm font-semibold">Official source docs tracked: {sourceSummary.docs}</div>
          <div className="aq-subtle-panel p-3 text-sm font-semibold">Source links prepared: {sourceSummary.chunks}</div>
          <div className="aq-subtle-panel p-3 text-sm font-semibold">Generation disabled during quizzes</div>
        </div>
        {latestGenerationRun ? (
          <div className="mt-4 rounded-md border border-[var(--aq-border)] bg-white p-3 text-sm font-semibold dark:bg-[#081d38]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Review state: {latestGenerationRun.status === "completed" ? "sample reviewed" : "not serving"}</span>
              <span>Drafts withheld from quizzes</span>
              <span>Source-linked before serving</span>
            </div>
          </div>
        ) : null}
        {approvedSourceQuestions.length ? (
          <div className="mt-4 grid gap-3">
            {approvedSourceQuestions.map((question) => (
              <div key={question.id} className="aq-subtle-panel p-3">
                <div className="mb-2 flex flex-wrap gap-2"><Badge>{question.domain}</Badge><Badge>Source chunk linked</Badge></div>
                <p className="text-sm font-semibold">{question.stem}</p>
                <a className="mt-2 inline-flex text-xs font-bold text-[var(--aq-blue-700)] underline dark:text-[var(--aq-blue-300)]" href={question.sourceUrl} target="_blank" rel="noreferrer">Microsoft Learn source</a>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="aq-metric flex flex-col items-center text-center">
          <Clock className="mb-2 h-6 w-6 shrink-0 text-blue-600 dark:text-blue-300" />
          <p className="text-base font-bold leading-tight sm:text-lg">10Q / 12m</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Quick Quizzes</p>
        </Card>
        <Card className="aq-metric flex flex-col items-center text-center">
          <FileQuestion className="mb-2 h-6 w-6 shrink-0 text-blue-600 dark:text-blue-300" />
          <p className="text-base font-bold leading-tight sm:text-lg">50Q / 100m</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">Certification Runs</p>
        </Card>
        <Card className="aq-metric flex flex-col items-center text-center">
          <BarChart3 className="mb-2 h-6 w-6 shrink-0 text-blue-600 dark:text-blue-300" />
          <p className="text-base font-bold leading-tight sm:text-lg">{latest ? `${latest.percentage}%` : "-"}</p>
          <p className="mt-1 w-full truncate text-xs font-bold uppercase tracking-[0.04em] text-[var(--aq-muted)]">{latest ? latest.title : "Latest"}</p>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Quizzes</CardTitle><BrainCircuit className="h-6 w-6" /></CardHeader>
        <div className="mb-3"><QuestionBankNotice compact /></div>
        {!active ? <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">New {cert} quiz activation is disabled. Existing attempts remain in Activity History. Continue with {meta.replacementCert ?? "an active certification"}.</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {certQuizzes.map((quiz) => (
            <div key={quiz.id} className="aq-row-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className="mb-2">{quiz.domain}</Badge>
                  <h3 className="text-base font-semibold">{quiz.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">{quiz.focusTags.join(" / ")}</p>
                </div>
                  <Button asChild size="sm" variant={active ? "hero" : "soft"} className="shrink-0"><Link to={active ? `/arena?cert=${cert}&mode=quiz&count=10&minutes=12&quizId=${quiz.id}&domain=${encodeURIComponent(quiz.domain)}&tags=${encodeURIComponent(quiz.focusTags.join(","))}&examTitle=${encodeURIComponent(`${cert} ${quiz.title}`)}` : `/cert/${pathFor(meta.replacementCert ?? "SC-500")}/knowledge`}><Play className="h-4 w-4" /> {active ? "Start" : `Use ${meta.replacementCert ?? "active path"}`}</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Certification Runs</CardTitle><FileQuestion className="h-6 w-6" /></CardHeader>
        <div className="mb-3"><QuestionBankNotice compact /></div>
        {!active ? <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">New {cert} certification runs are disabled while this certification retires. Historical scores are preserved.</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {certExams.map((exam) => {
            const best = attempts.filter((a) => a.blueprintId === exam.id).sort((a, b) => b.percentage - a.percentage)[0];
            return (
              <div key={exam.id} className="aq-row-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{exam.title}</Badge>
                    <h3 className="text-base font-semibold">Weighted structure changes every launch</h3>
                    <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">50 questions / 100 minutes / unanswered grade wrong</p>
                  </div>
                  <Button asChild size="sm" variant={active ? "hero" : "soft"} className="shrink-0"><Link to={active ? `/arena?cert=${cert}&mode=timed&count=50&minutes=100&examId=${exam.id}&examTitle=${encodeURIComponent(exam.title)}` : `/cert/${pathFor(meta.replacementCert ?? "SC-500")}/readiness`}><Play className="h-4 w-4" /> {active ? "Start" : `Use ${meta.replacementCert ?? "active path"}`}</Link></Button>
                </div>
                <div className="mt-3"><Progress value={best?.percentage ?? 0} /><p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Best: {best ? `${best.percentage}%` : "Not attempted"}</p></div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg" variant="soft"><Link to={`/cases?cert=${cert}`}><FlaskConical /> Scenario Challenges</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/kql?cert=${cert}`}>KQL Gym</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/history?cert=${cert}`}><RotateCcw /> Activity History</Link></Button>
      </div>
    </motion.div>
  );
}
