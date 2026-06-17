import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Clock, Play, ShieldCheck } from "lucide-react";
import { caseFiles } from "../data/caseFiles";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export function CaseFiles() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader><div><Badge className="bg-amber-300 text-slate-950">Case File Mode</Badge><CardTitle className="mt-3 text-4xl">Real exam-style enterprise cases</CardTitle><p className="font-bold opacity-75">One company, one architecture, 6–8 questions. Built for scenario stamina.</p></div><BriefcaseBusiness className="h-8 w-8" /></CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {caseFiles.map(file => (
          <Card key={file.id} className="overflow-hidden">
            <CardHeader><div><div className="flex flex-wrap gap-2"><Badge>{file.cert}</Badge><Badge className="bg-violet-500 text-white">{file.org}</Badge></div><CardTitle className="mt-3 text-2xl">{file.title}</CardTitle></div><ShieldCheck className="h-6 w-6 text-emerald-500" /></CardHeader>
            <CardContent>
              <p className="font-bold text-slate-600 dark:text-slate-300">{file.summary}</p>
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs font-bold text-sky-100 dark:bg-black/40">{file.architecture}</pre>
              <div className="mt-4 flex flex-wrap gap-2">{file.tags.map(t => <Badge key={t} className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">{t}</Badge>)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-3 font-black dark:bg-white/10"><Clock className="mr-2 inline h-4 w-4" /> {file.questions}Q · {file.minutes}m</div>
                <Button asChild variant="hero" size="lg"><Link to={`/arena?cert=${file.cert}&mode=case&count=${file.questions}&minutes=${file.minutes}&domain=${encodeURIComponent(file.focusDomain ?? "")}&tags=${encodeURIComponent(file.tags.join(","))}&examTitle=${encodeURIComponent(file.title)}`}><Play className="h-4 w-4" /> Start case</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
