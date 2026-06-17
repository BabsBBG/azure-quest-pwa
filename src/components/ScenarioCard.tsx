import { Link } from "react-router-dom";
import { ArrowRight, Clock, Gauge } from "lucide-react";
import type { ScenarioTopic } from "../data/scenarios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { DomainBadge } from "./DomainBadge";

export function ScenarioCard({ scenario, exam, domain }: { scenario: ScenarioTopic; exam: "sc-300" | "sc-500"; domain: string }) {
  return (
    <Link to={`/scenarios/${exam}/${scenario.id}`} className="block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-glow">
        <CardHeader>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <DomainBadge label={exam.toUpperCase()} tone={exam === "sc-300" ? "blue" : "violet"} />
              <Badge className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100">{scenario.difficulty}</Badge>
            </div>
            <CardTitle>{scenario.title}</CardTitle>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{scenario.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {scenario.estimatedTime}</span>
            <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {domain}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenario.tags.slice(0, 4).map((tag) => <Badge key={tag} className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">{tag}</Badge>)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
