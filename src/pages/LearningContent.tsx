import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpenCheck, ExternalLink, FileText, Film, GraduationCap, MonitorPlay, ShieldCheck } from "lucide-react";
import { certFromSlug, metaFor, pathFor } from "../data/certPaths";
import { docs } from "../data/docs";
import { approvedLearningSummaries } from "../data/learningSummaries";
import { videos } from "../data/videos";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

export function LearningContent() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const meta = metaFor(cert);
  const docInfo = docs[pathFor(cert) as keyof typeof docs];
  const certVideos = videos.filter((video) => video.exam === cert);
  const summaries = approvedLearningSummaries(cert);
  const completed = useAppStore((state) => state.progress.completedResources ?? []);
  const toggleResource = useAppStore((state) => state.toggleResource);
  const resourceIds = [...docInfo.links.map((_, i) => `${cert}:doc:${i}`), ...certVideos.map((v) => `${cert}:video:${v.id}`)];
  const done = resourceIds.filter((id) => completed.includes(id)).length;
  const pct = resourceIds.length ? Math.round((done / resourceIds.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="aq-hero p-5 sm:p-7">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{cert} Learning Content</Badge>
        <h1 className="text-4xl font-bold sm:text-5xl">Docs. Videos. Practice.</h1>
        <p className="mt-3 max-w-2xl text-lg font-semibold text-[var(--aq-muted)]">Dedicated video library plus official docs tracking, built for low-bandwidth study sessions.</p>
        <div className="aq-subtle-panel mt-5 p-4"><div className="mb-2 flex justify-between text-sm font-semibold"><span>Learning completion</span><span>{pct}%</span></div><Progress value={pct} /></div>
      </section>

      <Card>
        <CardHeader><CardTitle>Approved Learning Summaries</CardTitle><BookOpenCheck className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3">
          {summaries.map((summary) => (
            <div key={summary.versionId} className="aq-row-card p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2"><Badge>{summary.domainTitle}</Badge><Badge>Blueprint {summary.blueprintVersion}</Badge><Badge>v{summary.versionNumber}</Badge></div>
                  <h3 className="text-xl font-semibold">{summary.overview}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="aq-subtle-panel p-3">
                      <p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Study Order</p>
                      <ul className="mt-2 space-y-1 text-sm font-semibold text-[var(--aq-muted)]">{summary.learningSequence.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div className="aq-subtle-panel p-3">
                      <p className="text-xs font-bold uppercase text-[var(--aq-muted)]">Watch For</p>
                      <ul className="mt-2 space-y-1 text-sm font-semibold text-[var(--aq-muted)]">{summary.commonMistakes.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                  {summary.sourceLinks.slice(0, 2).map((source) => (
                    <Button key={`${summary.versionId}:${source.sourceTextHash}`} asChild variant="ghost" size="sm">
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Source</a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Official Docs</CardTitle><FileText className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3">
          {docInfo.links.map((link, index) => {
            const id = `${cert}:doc:${index}`;
            const isDone = completed.includes(id);
            return (
              <div key={link.url} className="aq-row-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="text-xl font-semibold">{link.label}</h3><p className="text-sm font-semibold text-[var(--aq-muted)]">{link.description}</p></div>
                  <div className="flex gap-2"><Button onClick={() => void toggleResource(id)} variant={isDone ? "default" : "soft"}>{isDone ? "Completed" : "Mark done"}</Button><Button asChild variant="ghost"><a href={link.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open</a></Button></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dedicated Video Library</CardTitle><Film className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3">
          {certVideos.map((video) => {
            const id = `${cert}:video:${video.id}`;
            const isDone = completed.includes(id);
            return (
              <div key={video.id} className="aq-row-card p-4">
                <div className="flex gap-4">
                  <div className="hidden h-20 w-28 shrink-0 place-items-center rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-700)] dark:bg-[#081d38] dark:text-[var(--aq-ink)] sm:grid"><MonitorPlay className="h-9 w-9" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2"><Badge>{video.source}</Badge><Badge>{video.duration}</Badge></div>
                    <h3 className="text-xl font-semibold">{video.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">{video.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => void toggleResource(id)} variant={isDone ? "default" : "soft"}>{isDone ? "Watched" : "Mark watched"}</Button><Button asChild variant="ghost"><a href={video.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open video</a></Button></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">
        <CardHeader><CardTitle className="text-white">Practice bridge</CardTitle><GraduationCap className="h-6 w-6" /></CardHeader>
        <p className="font-semibold opacity-85">After each doc or video, run a 12-minute quick quiz so learning becomes recall. That is how this app converts watching into progress evidence.</p>
        <Button asChild className="mt-4"><Link to={`/cert/${pathFor(cert)}/knowledge`}><ShieldCheck className="h-4 w-4" /> Start a quick quiz</Link></Button>
      </Card>
    </motion.div>
  );
}
