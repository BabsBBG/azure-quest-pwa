import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Dumbbell, RotateCcw } from "lucide-react";
import { kqlTasks } from "../data/kqlTasks";
import { useAppStore } from "../store/useAppStore";
import { scoreAttempt } from "../utils/quizEngine";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import type { Cert, Question } from "../types";

const certs: Cert[] = ["AZ-500", "SC-300", "SC-500"];
function toQuestion(task: typeof kqlTasks[number]): Question {
  return { id: task.id, cert: task.cert, domain: "KQL Gym", difficulty: "medium", scenarioOrg: "Security Operations", stem: `${task.prompt}\n\n${task.snippet}`, diagram: null, options: task.options, answer: task.answer, explanation: task.explanation, whyWrong: {}, tags: task.tags };
}

export function KqlGym() {
  const recordAttempt = useAppStore(s => s.recordAttempt);
  const [cert, setCert] = useState<Cert>("AZ-500");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const tasks = useMemo(() => kqlTasks.filter(t => t.cert === cert), [cert]);
  const current = tasks[index];
  const done = Object.keys(selected).length === tasks.length && tasks.length > 0;
  const score = tasks.filter(t => selected[t.id] === t.answer).length;

  async function finish() {
    const questions = tasks.map(toQuestion);
    const selections = Object.fromEntries(tasks.map(t => [t.id, (selected[t.id] as any) ?? null]));
    const secondsByQuestion = Object.fromEntries(tasks.map(t => [t.id, 60]));
    const attempt = scoreAttempt({ cert, mode: "kql", kind: "kql", title: `${cert} KQL Gym`, startedAt, seed: crypto.randomUUID(), questions, selections, secondsByQuestion, timeLimitSeconds: 15*60 });
    await recordAttempt(attempt);
    setCompleted(true);
  }

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-4">
      <Card className="aq-hero"><CardHeader><div><Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">15-minute drill</Badge><CardTitle className="mt-3 text-4xl">KQL Gym</CardTitle><p className="font-semibold text-[var(--aq-muted)]">Complete queries, identify noisy logic, and learn Sentinel thinking.</p></div><Dumbbell className="h-8 w-8 text-[var(--aq-blue-600)]" /></CardHeader></Card>
      <QuestionBankNotice compact />
      <div className="flex flex-wrap gap-2">{certs.map(c => <Button key={c} onClick={() => {setCert(c); setIndex(0); setSelected({}); setCompleted(false);}} variant={cert===c ? "hero" : "soft"}>{c}</Button>)}</div>
      {!current ? <Card><CardTitle>No KQL tasks yet for this cert.</CardTitle></Card> : <Card>
        <CardHeader><div><Badge>{cert}</Badge><CardTitle className="mt-3">{current.title}</CardTitle></div><Code2 className="h-6 w-6 text-sky-500" /></CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">{current.prompt}</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-md border border-[var(--aq-border)] bg-[#061227] p-4 text-sm font-semibold text-[#d7ebff]">{current.snippet}</pre>
          <div className="mt-4 grid gap-3">{current.options.map(o => {
            const picked = selected[current.id] === o.id;
            const answered = selected[current.id];
            const right = o.id === current.answer;
            const tone = !completed
              ? picked ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)]" : "border-[var(--aq-border)] bg-white dark:bg-[#081d38]"
              : right ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : picked ? "border-rose-400 bg-rose-500 text-white" : "border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-muted)]";
            return <button key={o.id} aria-pressed={picked} onClick={() => setSelected(prev => ({...prev,[current.id]: o.id}))} className={`rounded-md border p-4 text-left font-semibold ${tone}`}><span className="mr-3 rounded-md bg-black/10 px-3 py-2">{o.id}</span>{o.text}</button>;
          })}</div>
          {completed ? <div className="aq-subtle-panel mt-4 p-4 font-semibold">{current.explanation}</div> : null}
          <div className="mt-5 flex flex-wrap gap-3"><Button disabled={!selected[current.id] || completed} onClick={() => index + 1 < tasks.length ? setIndex(i=>i+1) : void finish()} variant="hero" size="lg">{index + 1 < tasks.length ? "Next task" : "Save KQL run"}</Button><Button disabled={completed} onClick={() => void finish()} variant="soft" size="lg">Finish now</Button><Button onClick={()=>{setIndex(0); setSelected({}); setCompleted(false);}} variant="soft"><RotateCcw className="h-4 w-4" /> Reset</Button></div>
          <div className="mt-4"><Progress value={((index+1)/tasks.length)*100} /></div>
          {completed || done ? <p className="mt-3 font-semibold">Current score: {score}/{tasks.length}</p> : null}
        </CardContent>
      </Card>}
    </motion.div>
  );
}
