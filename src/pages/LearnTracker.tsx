import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, ExternalLink, Film, FileText } from "lucide-react";
import { docs } from "../data/docs";
import { videos } from "../data/videos";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import type { Cert } from "../types";

const certs: Cert[] = ["SC-300", "AZ-500", "SC-500"];

export function LearnTracker() {
  const completed = useAppStore(s => s.progress.completedResources ?? []);
  const toggle = useAppStore(s => s.toggleResource);
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-4">
      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950"><CardHeader><div><Badge className="bg-amber-300 text-slate-950">Official Learn Tracker</Badge><CardTitle className="mt-3 text-4xl">Docs, videos, and completion evidence</CardTitle><p className="font-bold opacity-75">Mark resources complete so readiness reflects study, not just quiz scores.</p></div><BookOpenCheck className="h-8 w-8" /></CardHeader></Card>
      {certs.map(cert => {
        const docSet = (docs as any)[cert.toLowerCase()] ?? (docs as any)[cert];
        const certVideos = (videos as any)[cert.toLowerCase()] ?? (videos as any)[cert] ?? [];
        const resources = [ ...(docSet?.links ?? []).map((r:any,i:number)=>({ ...r, id:`${cert}:doc:${i}`, type:"doc" })), ...certVideos.map((r:any,i:number)=>({ ...r, id:`${cert}:video:${i}`, label:r.title, type:"video" })) ];
        const done = resources.filter((r:any)=>completed.includes(r.id)).length;
        const pct = resources.length ? Math.round((done/resources.length)*100) : 0;
        return <Card key={cert}><CardHeader><div><Badge>{cert}</Badge><CardTitle className="mt-2">{docSet?.title ?? `${cert} Learning`}</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{done}/{resources.length} resources complete</p></div><Badge className="bg-emerald-400 text-slate-950">{pct}%</Badge></CardHeader><Progress value={pct} /><CardContent><div className="grid gap-3 md:grid-cols-2">{resources.map((r:any)=><div key={r.id} className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{r.label}</p><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{r.description ?? r.domain ?? "Official learning resource"}</p></div>{r.type === "video" ? <Film className="h-5 w-5 text-violet-500" /> : <FileText className="h-5 w-5 text-sky-500" />}</div><div className="mt-3 flex gap-2"><Button onClick={() => void toggle(r.id)} variant={completed.includes(r.id) ? "success" : "soft"}>{completed.includes(r.id) ? <CheckCircle2 className="h-4 w-4" /> : null}{completed.includes(r.id) ? "Complete" : "Mark done"}</Button>{r.url ? <Button asChild variant="ghost"><a href={r.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open</a></Button> : null}</div></div>)}</div></CardContent></Card>
      })}
    </motion.div>
  );
}
