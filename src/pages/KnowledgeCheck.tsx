import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Clock, FileQuestion, FlaskConical, Play, RotateCcw } from "lucide-react";
import { certFromSlug, metaFor, pathFor } from "../data/certPaths";
import { examBlueprints } from "../data/examBlueprints";
import { quizBlueprints } from "../data/quizBlueprints";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

export function KnowledgeCheck() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const meta = metaFor(cert);
  const attempts = useAppStore((state) => state.attempts).filter((a) => a.cert === cert);
  const certQuizzes = quizBlueprints.filter((q) => q.cert === cert);
  const certExams = examBlueprints.filter((e) => e.cert === cert);
  const latest = attempts[0];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className={`pro-panel rounded-2xl border border-emerald-900/10 p-5 text-emerald-950 shadow-card dark:border-emerald-300/10 dark:text-white sm:p-6`}>
        <Badge className="mb-3">{cert} Exam Center</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Practice exams and quizzes.</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium text-emerald-900/70 dark:text-emerald-50/75">Focused sprints and full mocks. Answers stay hidden until you finish, so timing stays realistic.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Quiz Sprints</CardTitle><Clock /></CardHeader><p className="font-semibold text-slate-500 dark:text-slate-400">10 questions · 12 minutes</p></Card>
        <Card><CardHeader><CardTitle>Mock Exams</CardTitle><FileQuestion /></CardHeader><p className="font-semibold text-slate-500 dark:text-slate-400">50 questions · 100 minutes</p></Card>
        <Card><CardHeader><CardTitle>Latest</CardTitle><BarChart3 /></CardHeader><p className="font-semibold text-slate-500 dark:text-slate-400">{latest ? `${latest.percentage}% · ${latest.title}` : "No attempts yet"}</p></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quiz Sprintss</CardTitle><BrainCircuit className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {certQuizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className="mb-2">{quiz.domain}</Badge>
                  <h3 className="text-base font-semibold">{quiz.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{quiz.focusTags.join(" · ")}</p>
                </div>
                <Button asChild size="sm" variant="hero"><Link to={`/arena?cert=${cert}&mode=quiz&count=10&minutes=12&quizId=${quiz.id}&domain=${encodeURIComponent(quiz.domain)}&tags=${encodeURIComponent(quiz.focusTags.join(","))}&examTitle=${encodeURIComponent(`${cert} ${quiz.title}`)}`}><Play className="h-4 w-4" /> Start</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Numbered Mock Examss</CardTitle><FileQuestion className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {certExams.map((exam) => {
            const best = attempts.filter((a) => a.blueprintId === exam.id).sort((a, b) => b.percentage - a.percentage)[0];
            return (
              <div key={exam.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="mb-2 bg-emerald-900 text-white dark:bg-emerald-300 dark:text-emerald-950">{exam.title}</Badge>
                    <h3 className="text-base font-semibold">Weighted structure changes every launch</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">50 questions · 100 minutes · unanswered grade wrong</p>
                  </div>
                  <Button asChild size="sm" variant="hero"><Link to={`/arena?cert=${cert}&mode=timed&count=50&minutes=100&examId=${exam.id}&examTitle=${encodeURIComponent(exam.title)}`}><Play className="h-4 w-4" /> Start</Link></Button>
                </div>
                <div className="mt-3"><Progress value={best?.percentage ?? 0} /><p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Best: {best ? `${best.percentage}%` : "Not attempted"}</p></div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg" variant="soft"><Link to={`/cases?cert=${cert}`}><FlaskConical /> Case Files</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/kql?cert=${cert}`}>KQL Gym</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/history?cert=${cert}`}><RotateCcw /> Past Attempts</Link></Button>
      </div>
    </motion.div>
  );
}
