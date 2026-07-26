import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ArrowLeft, CheckCircle2, FileSearch, Filter, History, KeyRound, ListChecks, ShieldCheck, SplitSquareHorizontal, UserCog } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { approvedLearningSummaries } from "../data/learningSummaries";
import { sourceQuestionCandidates } from "../data/sourceGrounding";
import { createContentOrchestrationWorkflow, runContentOrchestrationWorkflow } from "../data/contentOrchestration";
import { createSourceVersionDiff, createTargetedReplacementJob, impactRecordsForSourceDiff } from "../data/sourceImpactGraph";
import { critiqueSourceGroundedQuestion } from "../utils/questionCritic";
import { PRODUCT_NAME, PROVIDER_NEUTRAL_DISCLAIMER } from "../lib/brand";

const workflow = runContentOrchestrationWorkflow(createContentOrchestrationWorkflow({ idempotencyKey: "admin-review-studio" }));
const sourceDiff = createSourceVersionDiff({
  sourceDocumentId: "mslearn-sc300-study-guide",
  previousContentHash: "sc300-admin-old",
  nextContentHash: "sc300-admin-new",
  changedSections: ["Implement authentication and access management"]
});
const impactRecords = impactRecordsForSourceDiff(sourceDiff);
const replacementJob = createTargetedReplacementJob(sourceDiff, impactRecords);
const reviewedCandidate = sourceQuestionCandidates[0];
const criticReport = critiqueSourceGroundedQuestion(reviewedCandidate);

const queueRows = [
  { id: "queue-generation", label: "Generation Jobs", count: workflow.generationJob ? 1 : 0, status: workflow.generationJob?.status ?? "none", role: "MAIN_ADMIN" },
  { id: "queue-critic", label: "Critic Reports", count: sourceQuestionCandidates.length, status: criticReport.status, role: "CONTENT_REVIEWER" },
  { id: "queue-impact", label: "Source Impact", count: impactRecords.filter((item) => item.riskState !== "unchanged").length, status: replacementJob.status, role: "MAIN_ADMIN" },
  { id: "queue-summaries", label: "Learning Summaries", count: approvedLearningSummaries().length, status: "approved", role: "CONTENT_REVIEWER" }
];

export function AdminReviewStudio() {
  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-950 dark:bg-[#061227] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-[var(--aq-border)] bg-white px-4 py-4 dark:bg-[#081d38] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 lg:block">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Back Office</p>
              <h1 className="mt-1 text-xl font-extrabold">{PRODUCT_NAME} Admin</h1>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /> Learner</Link></Button>
          </div>
          <nav className="mt-5 grid gap-2">
            {[
              ["Review Queues", ListChecks],
              ["Source Impact", FileSearch],
              ["Critic Gates", ShieldCheck],
              ["Audit Trail", History],
              ["Roles", UserCog]
            ].map(([label, Icon]) => {
              const LucideIcon = Icon as typeof ListChecks;
              return <a key={label as string} href={`#${String(label).toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-bold text-[var(--aq-muted)] hover:border-[var(--aq-border)] hover:bg-[var(--aq-blue-50)] hover:text-[var(--aq-blue-800)]"><LucideIcon className="h-4 w-4" /> {label as string}</a>;
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[var(--aq-border)] bg-white/95 px-4 py-3 backdrop-blur dark:bg-[#081d38]/95">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap gap-2"><Badge>Main Admin protected</Badge><Badge>Reviewer queue</Badge><Badge>Support read-only</Badge></div>
                <h2 className="mt-2 text-2xl font-extrabold">Review Studio</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="soft" size="sm"><Filter className="h-4 w-4" /> Filters</Button>
                <Button variant="soft" size="sm"><SplitSquareHorizontal className="h-4 w-4" /> Split Pane</Button>
                <Button variant="hero" size="sm"><CheckCircle2 className="h-4 w-4" /> Review Selected</Button>
              </div>
            </div>
          </header>

          <div className="space-y-4 p-4">
            <section id="roles" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-100">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h3 className="font-extrabold">Role boundary</h3>
                  <p className="mt-1 text-sm font-semibold">Main Admin can publish, run generation, and approve overrides. Content Reviewer can review queues and critic output. Support Admin can inspect learner reports without publication rights. Regular users have no admin access.</p>
                </div>
              </div>
            </section>

            <section id="review-queues" className="grid gap-3 md:grid-cols-4">
              {queueRows.map((row) => (
                <div key={row.id} className="rounded-md border border-[var(--aq-border)] bg-white p-4 shadow-sm dark:bg-[#081d38]">
                  <div className="flex items-center justify-between gap-2"><Badge>{row.role}</Badge><Activity className="h-4 w-4 text-[var(--aq-blue-700)]" /></div>
                  <p className="mt-3 text-sm font-bold text-[var(--aq-muted)]">{row.label}</p>
                  <div className="mt-1 flex items-end justify-between gap-2"><span className="text-3xl font-extrabold">{row.count}</span><span className="text-xs font-bold uppercase text-[var(--aq-muted)]">{row.status}</span></div>
                </div>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
              <div id="critic-gates" className="rounded-md border border-[var(--aq-border)] bg-white shadow-sm dark:bg-[#081d38]">
                <div className="border-b border-[var(--aq-border)] p-4">
                  <h3 className="text-lg font-extrabold">Dense Review Queue</h3>
                  <p className="text-sm font-semibold text-[var(--aq-muted)]">Drafts, critic output, source impact, and summaries awaiting human review.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-xs uppercase text-[var(--aq-muted)]">
                      <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Queue</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Role</th></tr>
                    </thead>
                    <tbody>
                      {[
                        { item: reviewedCandidate.id, queue: "Critic", status: criticReport.status, role: "Content Reviewer" },
                        { item: sourceDiff.id, queue: "Source Impact", status: replacementJob.status, role: "Main Admin" },
                        { item: workflow.id, queue: "Orchestration", status: workflow.status, role: "Main Admin" },
                        { item: approvedLearningSummaries()[0]?.versionId ?? "summary", queue: "Summaries", status: "approved", role: "Content Reviewer" }
                      ].map((row) => (
                        <tr key={`${row.queue}:${row.item}`} className="border-b border-[var(--aq-border)] last:border-0">
                          <td className="max-w-[260px] truncate px-4 py-3 font-bold">{row.item}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--aq-muted)]">{row.queue}</td>
                          <td className="px-4 py-3"><Badge>{row.status}</Badge></td>
                          <td className="px-4 py-3 font-semibold text-[var(--aq-muted)]">{row.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="rounded-md border border-[var(--aq-border)] bg-white shadow-sm dark:bg-[#081d38]">
                <div className="border-b border-[var(--aq-border)] p-4">
                  <h3 className="text-lg font-extrabold">Split-Pane Review</h3>
                  <p className="text-sm font-semibold text-[var(--aq-muted)]">{reviewedCandidate.id}</p>
                </div>
                <div className="space-y-4 p-4">
                  <div className="rounded-md border border-[var(--aq-border)] p-3">
                    <p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Stem</p>
                    <p className="mt-2 text-sm font-semibold">{reviewedCandidate.stem}</p>
                  </div>
                  <div className="rounded-md border border-[var(--aq-border)] p-3">
                    <p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Critic Findings</p>
                    <div className="mt-2 space-y-2">{criticReport.findings.length ? criticReport.findings.map((finding) => <p key={`${finding.checkId}:${finding.message}`} className="text-sm font-semibold">{finding.checkId}: {finding.message}</p>) : <p className="text-sm font-semibold">No hard findings.</p>}</div>
                  </div>
                  <div className="sticky bottom-4 flex flex-wrap gap-2 rounded-md border border-[var(--aq-border)] bg-white p-3 shadow-sm dark:bg-[#081d38]">
                    <Button size="sm" variant="soft"><AlertTriangle className="h-4 w-4" /> Return</Button>
                    <Button size="sm" variant="hero"><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                  </div>
                </div>
              </aside>
            </section>

            <section id="audit-trail" className="rounded-md border border-[var(--aq-border)] bg-white p-4 shadow-sm dark:bg-[#081d38]">
              <h3 className="text-lg font-extrabold">Audit Timeline</h3>
              <div className="mt-3 grid gap-2">
                {workflow.events.slice(-5).map((event) => <div key={event.id} className="rounded-md border border-[var(--aq-border)] p-3 text-sm font-semibold"><span className="font-extrabold">{event.type}</span> - {event.message}</div>)}
              </div>
            </section>

            <p className="text-xs font-semibold text-[var(--aq-muted)]">{PROVIDER_NEUTRAL_DISCLAIMER}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
