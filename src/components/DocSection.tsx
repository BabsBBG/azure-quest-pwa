import { ExternalLink } from "lucide-react";
import type { ExamDocs } from "../data/docs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function DocSection({ examKey, doc }: { examKey: string; doc: ExamDocs }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950">{examKey.toUpperCase()}</Badge>
          <CardTitle className="text-2xl">{doc.title}</CardTitle>
          <p className="mt-2 font-bold text-slate-600 dark:text-slate-300">{doc.description}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-center dark:bg-white/10">
          <p className="text-2xl font-black">{doc.passingScore}</p>
          <p className="text-xs font-black text-slate-500 dark:text-slate-400">passing score</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {doc.domains.map((domain) => (
            <div key={domain.name} className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                <span>{domain.name}</span>
                <span>{domain.weight}</span>
              </div>
              <Progress value={Number(domain.weight.split("-")[1]?.replace("%", "") ?? 25)} />
            </div>
          ))}
        </div>
        <div className="grid gap-3">
          {doc.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-300 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{link.label}</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{link.description}</p>
                </div>
                <ExternalLink className="h-5 w-5 text-slate-400" />
              </div>
            </a>
          ))}
        </div>
        <Button asChild variant="soft" size="lg" className="w-full">
          <a href={doc.links[0]?.url} target="_blank" rel="noreferrer">Open study guide</a>
        </Button>
      </CardContent>
    </Card>
  );
}
