import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { scenarios } from "../data/scenarios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { QuestionBankNotice } from "../components/QuestionBankNotice";

function findScenario(exam: string | undefined, scenarioId: string | undefined) {
  if ((exam !== "sc-300" && exam !== "sc-500") || !scenarioId) return undefined;
  for (const domain of scenarios[exam].domains) {
    const scenario = domain.scenarios.find((item) => item.id === scenarioId);
    if (scenario) return { exam, domain, scenario };
  }
  return undefined;
}

export function ScenarioPlayer() {
  const { exam, scenarioId } = useParams();
  const match = findScenario(exam, scenarioId);

  if (!match) return <Card><CardTitle>Scenario not found.</CardTitle></Card>;

  const steps = [
    "Read the business request and identify the risk.",
    "Choose the Microsoft service or control that solves the risk with least privilege.",
    "Decide what must be configured first, then what should be monitored after deployment.",
    "Launch related practice questions and validate your understanding."
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Button asChild variant="ghost" size="sm"><Link to={`/scenarios/${match.exam}/${match.scenario.id}`}><ArrowLeft className="h-4 w-4" /> Scenario details</Link></Button>
      <Card className="aq-hero">
        <CardHeader>
          <div>
            <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Guided Player</Badge>
            <CardTitle className="text-3xl">{match.scenario.title}</CardTitle>
            <p className="mt-2 font-semibold text-[var(--aq-muted)]">{match.scenario.description}</p>
          </div>
          <ClipboardList className="h-10 w-10 text-[var(--aq-blue-600)]" />
        </CardHeader>
      </Card>
      <QuestionBankNotice compact />
      <div className="grid gap-3">
        {steps.map((step, index) => (
          <Card key={step} className="aq-row-card">
            <CardHeader>
              <Badge>Step {index + 1}</Badge>
              <CheckCircle2 className="h-6 w-6 text-[var(--aq-blue-600)]" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{step}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button asChild variant="hero" size="lg" className="w-full"><Link to={`/arena?cert=${match.exam === "sc-300" ? "SC-300" : "SC-500"}&mode=weak&count=12&examTitle=${encodeURIComponent(match.scenario.title)}`}>Start related practice</Link></Button>
    </motion.div>
  );
}
