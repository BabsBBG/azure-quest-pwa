import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Film, GraduationCap, MonitorPlay, ShieldCheck } from "lucide-react";
import { certFromSlug, metaFor, pathFor } from "../data/certPaths";
import { docs } from "../data/docs";
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
  const completed = useAppStore((state) => state.progress.completedResources ?? []);
  const toggleResource = useAppStore((state) => state.toggleResource);
  const resourceIds = [...docInfo.links.map((_, i) => `${cert}:doc:${i}`), ...certVideos.map((v) => `${cert}:video:${v.id}`)];
  const done = resourceIds.filter((id) => completed.includes(id)).length;
  const pct = resourceIds.length ? Math.round((done / resourceIds.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className={`rounded-[2rem] bg-gradient-to-br ${meta.accent} p-5 text-white shadow-card sm:p-7`}>
        <Badge className="mb-3 bg-white/20 text-white">{cert} Learning Content</Badge>
        <h1 className="text-4xl font-black sm:text-6xl">Docs. Videos. Practice.</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/80">Dedicated video library plus official docs tracking, built for low-bandwidth study sessions.</p>
        <div className="mt-5 rounded-[1.4rem] bg-white/15 p-4"><div className="mb-2 flex justify-between text-sm font-black"><span>Learning completion</span><span>{pct}%</span></div><Progress value={pct} className="bg-white/25" /></div>
      </section>

      <Card>
        <CardHeader><CardTitle>Official Docs</CardTitle><FileText className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3">
          {docInfo.links.map((link, index) => {
            const id = `${cert}:doc:${index}`;
            const isDone = completed.includes(id);
            return (
              <div key={link.url} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="text-xl font-black">{link.label}</h3><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{link.description}</p></div>
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
              <div key={video.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-4">
                  <div className="hidden h-20 w-28 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 sm:grid"><MonitorPlay className="h-9 w-9" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2"><Badge>{video.source}</Badge><Badge className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">{video.duration}</Badge></div>
                    <h3 className="text-xl font-black">{video.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{video.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => void toggleResource(id)} variant={isDone ? "default" : "soft"}>{isDone ? "Watched" : "Mark watched"}</Button><Button asChild variant="ghost"><a href={video.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open video</a></Button></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader><CardTitle>Practice bridge</CardTitle><GraduationCap className="h-6 w-6" /></CardHeader>
        <p className="font-bold opacity-80">After each doc or video, run a 12-minute quiz sprint so learning becomes recall. That is how this app converts watching into readiness.</p>
        <Button asChild className="mt-4"><Link to={`/cert/${pathFor(cert)}/knowledge`}><ShieldCheck className="h-4 w-4" /> Start a quiz sprint</Link></Button>
      </Card>
    </motion.div>
  );
}
