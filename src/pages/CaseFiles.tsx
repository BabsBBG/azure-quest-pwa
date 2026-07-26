import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Clock, Play, ShieldCheck } from "lucide-react";
import { caseFiles } from "../data/caseFiles";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { QuestionBankNotice } from "../components/QuestionBankNotice";

export function CaseFiles() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="aq-hero">
        <CardHeader><div><Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Scenario Challenge</Badge><CardTitle className="mt-3 text-4xl">Enterprise scenario practice</CardTitle><p className="font-semibold text-[var(--aq-muted)]">One company, one architecture, 6-8 questions. Built for scenario stamina.</p></div><BriefcaseBusiness className="h-8 w-8 text-[var(--aq-blue-600)]" /></CardHeader>
      </Card>
      <QuestionBankNotice compact />
      <div className="grid gap-4 md:grid-cols-2">
        {caseFiles.map(file => (
          <Card key={file.id} className="aq-row-card overflow-hidden">
            <CardHeader><div><div className="flex flex-wrap gap-2"><Badge>{file.cert}</Badge><Badge>{file.org}</Badge></div><CardTitle className="mt-3 text-2xl">{file.title}</CardTitle></div><ShieldCheck className="h-6 w-6 text-[var(--aq-blue-600)]" /></CardHeader>
            <CardContent>
              <p className="font-semibold text-[var(--aq-muted)]">{file.summary}</p>
              <pre className="mt-4 whitespace-pre-wrap rounded-md border border-[var(--aq-border)] bg-[#061227] p-4 text-xs font-semibold text-[#d7ebff]">{file.architecture}</pre>
              <div className="mt-4 flex flex-wrap gap-2">{file.tags.map(t => <Badge key={t}>{t}</Badge>)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="aq-subtle-panel p-3 font-semibold"><Clock className="mr-2 inline h-4 w-4" /> {file.questions}Q / {file.minutes}m</div>
                <Button asChild variant="hero" size="lg"><Link to={`/arena?cert=${file.cert}&mode=case&count=${file.questions}&minutes=${file.minutes}&domain=${encodeURIComponent(file.focusDomain ?? "")}&tags=${encodeURIComponent(file.tags.join(","))}&examTitle=${encodeURIComponent(file.title)}`}><Play className="h-4 w-4" /> Start scenario</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
