import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Layers3, PlayCircle } from "lucide-react";
import { scenarios } from "../data/scenarios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

function findScenario(exam: string | undefined, scenarioId: string | undefined) {
  if ((exam !== "sc-300" && exam !== "sc-500") || !scenarioId) return undefined;
  for (const domain of scenarios[exam].domains) {
    const scenario = domain.scenarios.find((item) => item.id === scenarioId);
    if (scenario) return { exam, domain, scenario };
  }
  return undefined;
}

export function ScenarioDetail() {
  const { exam, scenarioId } = useParams();
  const match = findScenario(exam, scenarioId);

  if (!match) {
    return <Card><CardTitle>Scenario not found.</CardTitle><Button asChild className="mt-4"><Link to="/scenarios">Back to scenarios</Link></Button></Card>;
  }

  const { scenario, domain } = match;
  const practiceCert = match.exam === "sc-300" ? "SC-300" : "AZ-500";
  const tags = scenario.tags.slice(0, 5).join(",");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Button asChild variant="ghost" size="sm"><Link to="/scenarios"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader>
          <div>
            <Badge className="mb-3 bg-sky-400 text-slate-950">{match.exam.toUpperCase()}</Badge>
            <CardTitle className="text-3xl">{scenario.title}</CardTitle>
            <p className="mt-2 font-bold opacity-75">{scenario.description}</p>
          </div>
          <Layers3 className="h-10 w-10" />
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm font-black text-slate-500 dark:text-slate-400">Domain</p><p className="mt-1 font-black">{domain.name}</p></Card>
        <Card><p className="text-sm font-black text-slate-500 dark:text-slate-400">Difficulty</p><p className="mt-1 font-black">{scenario.difficulty}</p></Card>
        <Card><p className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400"><Clock className="h-4 w-4" /> Estimated time</p><p className="mt-1 font-black">{scenario.estimatedTime}</p></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario objectives</CardTitle>
          <Badge>{domain.weight}</Badge>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 font-bold text-slate-600 dark:text-slate-300">
            <li>Identify the correct Microsoft security or identity control.</li>
            <li>Choose the least-privilege implementation path.</li>
            <li>Recognize traps that create standing access, broad exposure, or weak monitoring.</li>
          </ul>
          <div className="flex flex-wrap gap-2">{scenario.tags.map((tag) => <Badge key={tag} className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">{tag}</Badge>)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="hero" size="lg"><Link to={`/scenario-player/${match.exam}/${scenario.id}`}><PlayCircle className="h-5 w-5" /> Open scenario player</Link></Button>
        <Button asChild variant="soft" size="lg"><Link to={`/arena?cert=${practiceCert}&mode=weak&count=12&focus=${encodeURIComponent(tags)}&examTitle=${encodeURIComponent(scenario.title)}`}>Practice related questions</Link></Button>
      </div>
    </motion.div>
  );
}
