import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, Brain, BriefcaseBusiness, Code2, Gauge, History, Shield, Swords, Target, Trophy, UserRound, Zap } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { StatCard } from "../components/game/StatCard";
import { examBlueprints } from "../data/examBlueprints";
import { quizBlueprints } from "../data/quizBlueprints";
import { readinessAll } from "../utils/readiness";

export function Dashboard() {
  const progress = useAppStore((state) => state.progress);
  const attempts = useAppStore((state) => state.attempts);
  const questions = useAppStore((state) => state.questions);
  const reports = readinessAll(attempts, questions);
  const weakTags = Object.entries(progress.weakTags).sort((a, b) => b[1] - a[1]).filter(([, score]) => score > 0).slice(0, 4);
  const dailyPct = Math.min(100, (progress.completedToday / progress.dailyGoal) * 100);
  const featuredQuizzes = quizBlueprints.filter((_, index) => index % 5 === 0).slice(0, 9);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-card dark:bg-white dark:text-slate-950">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="bg-amber-300 text-slate-950">Exam readiness system</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Train by readiness, not points.</h1>
            <p className="mt-2 max-w-xl text-sm font-bold opacity-75">Weighted mocks, 12-minute sprints, case files, KQL Gym, Learn tracking, and real history analytics.</p>
          </div>
          <motion.div animate={{ rotate: [0, -2, 2, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-sky-300 to-violet-500 text-3xl font-black shadow-glow">AQ</motion.div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard emoji="STR" label="Streak" value={`${progress.streak} days`} hint="Current streak" />
        <StatCard emoji="TOD" label="Today" value={`${progress.completedToday}/${progress.dailyGoal}`} hint="Daily questions" />
        {reports.map(r => <StatCard key={r.cert} emoji={r.cert.split("-")[1]} label={`${r.cert} Ready`} value={`${r.readiness}%`} hint={r.status} />)}
      </div>

      <Card>
        <CardHeader><div><CardTitle>Readiness command</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Your study plan is based on readiness evidence.</p></div><Gauge className="h-6 w-6 text-emerald-500" /></CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          {reports.map(r => <Link key={r.cert} to="/readiness" className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10"><div className="mb-2 flex justify-between font-black"><span>{r.cert}</span><span>{r.readiness}%</span></div><Progress value={r.readiness}/><p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{r.recommendation}</p></Link>)}
        </div>
      </Card>

      <Card>
        <CardHeader><div><CardTitle>Daily goal</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{progress.completedToday}/{progress.dailyGoal} questions today</p></div><Badge className="bg-emerald-400 text-slate-950">Focus</Badge></CardHeader>
        <Progress value={dailyPct} />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-sky-500 to-blue-700 text-white"><CardHeader><CardTitle>Weighted Mock Exams</CardTitle><Swords className="h-7 w-7" /></CardHeader><CardContent><div className="grid gap-3">
          {(["SC-300","AZ-500","SC-500"] as const).map(cert => <Button key={cert} asChild size="lg" variant="soft" className="justify-between"><Link to={`/arena?cert=${cert}&mode=timed&count=50&minutes=100&examTitle=${encodeURIComponent(`${cert} Weighted Mock`)}`}>{cert} weighted mock <ArrowRight className="h-5 w-5" /></Link></Button>)}
          <Button asChild size="lg" variant="default" className="justify-between bg-slate-950 text-white dark:bg-slate-950 dark:text-white"><Link to="/arena?cert=AZ-500&mode=weak&count=15&minutes=15&examTitle=Weak%20Area%20Blitz">Weak Area Blitz <Zap className="h-5 w-5" /></Link></Button>
        </div></CardContent></Card>

        <Card className="bg-gradient-to-br from-violet-600 to-slate-950 text-white"><CardHeader><div><CardTitle>Daily Boss</CardTitle><p className="text-sm font-black opacity-85">Pick your fighter. 10 questions. 10 minutes.</p></div><Trophy className="h-7 w-7" /></CardHeader><CardContent><div className="grid gap-3">
          <Button asChild size="lg" variant="soft" className="h-16 justify-between"><Link to="/arena?cert=SC-300&mode=daily&count=10&minutes=10&fighter=Ninja%20Identity&examTitle=Daily%20Boss%20-%20Ninja%20Identity"><span><UserRound className="mr-2 inline h-5 w-5" /> Ninja Identity</span><ArrowRight className="h-5 w-5" /></Link></Button>
          <Button asChild size="lg" variant="soft" className="h-16 justify-between"><Link to="/arena?cert=AZ-500&mode=daily&count=10&minutes=10&fighter=Ninja%20General%20Security&examTitle=Daily%20Boss%20-%20Ninja%20General%20Security"><span><Shield className="mr-2 inline h-5 w-5" /> Ninja General Security</span><ArrowRight className="h-5 w-5" /></Link></Button>
        </div></CardContent></Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        <Button asChild size="lg" variant="hero" className="h-20 justify-between"><Link to="/readiness"><span>Readiness</span><Target /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-20 justify-between"><Link to="/cases"><span>Case Files</span><BriefcaseBusiness /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-20 justify-between"><Link to="/kql"><span>KQL Gym</span><Code2 /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-20 justify-between"><Link to="/learn"><span>Learn Tracker</span><BookOpenCheck /></Link></Button>
      </section>

      <Card><CardHeader><div><CardTitle>Quiz Sprints</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">10 questions · 12 minutes · focused skill.</p></div><BookOpenCheck className="h-6 w-6 text-sky-500" /></CardHeader><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featuredQuizzes.map((quiz) => <Link key={quiz.id} to={`/arena?cert=${quiz.cert}&mode=quiz&count=${quiz.targetQuestions}&minutes=${quiz.minutes}&quizId=${quiz.id}&examTitle=${encodeURIComponent(quiz.title)}&domain=${encodeURIComponent(quiz.domain)}&tags=${encodeURIComponent(quiz.focusTags.join(","))}`} className="rounded-2xl bg-slate-100 p-4 transition hover:scale-[1.01] hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15"><p className="font-black">{quiz.title}</p><p className="text-sm font-black text-slate-700 dark:text-slate-200">{quiz.subtitle}</p><p className="text-xs font-bold text-slate-500 dark:text-slate-400">{quiz.targetQuestions}Q · {quiz.minutes}m · Domain {quiz.domainNumber}</p></Link>)}
      </div></Card>

      <section className="grid gap-4 sm:grid-cols-3"><Button asChild size="lg" variant="hero" className="h-20 justify-between"><Link to="/study"><span>Study Bites</span><Brain /></Link></Button><Button asChild size="lg" variant="success" className="h-20 justify-between"><Link to="/flashcards"><span>Swipe Cards</span><Gauge /></Link></Button><Button asChild size="lg" variant="default" className="h-20 justify-between"><Link to="/history"><span>Past Exams & Quizzes</span><History /></Link></Button></section>

      <Card><CardHeader><CardTitle>Mock exam menu</CardTitle><Trophy className="h-6 w-6 text-amber-500" /></CardHeader><div className="grid gap-3 sm:grid-cols-2">{examBlueprints.map((exam) => <Link key={exam.id} to={`/arena?cert=${exam.cert}&mode=timed&count=${exam.targetQuestions}&minutes=${exam.minutes}&examId=${exam.id}&examTitle=${encodeURIComponent(exam.title)}${exam.focusDomain ? `&domain=${encodeURIComponent(exam.focusDomain)}` : ""}`} className="rounded-2xl bg-slate-100 p-4 transition hover:scale-[1.01] hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15"><p className="font-black">{exam.title}</p><p className="text-sm font-black text-slate-700 dark:text-slate-200">{exam.subtitle}</p><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{exam.targetQuestions}Q · {exam.minutes}m · {exam.vibe}</p></Link>)}</div></Card>

      <section className="grid gap-4 sm:grid-cols-2"><Card><CardHeader><div><CardTitle>Weak areas</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Review these first.</p></div><Brain className="h-7 w-7 text-violet-500" /></CardHeader><CardContent>{weakTags.length ? <div className="grid gap-2">{weakTags.map(([tag, score]) => <div key={tag} className="flex items-center justify-between rounded-2xl bg-slate-100 p-3 font-black dark:bg-white/10"><span>{tag}</span><span>{score}</span></div>)}</div> : <div className="rounded-2xl bg-emerald-100 p-4 font-black text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">No weak spots yet. Start a practice run to build your map.</div>}</CardContent></Card><Card><CardHeader><CardTitle>Latest run</CardTitle><Badge>{attempts[0]?.percentage ?? 0}%</Badge></CardHeader><p className="font-bold text-slate-600 dark:text-slate-300">{attempts[0] ? `${attempts[0].title} · ${attempts[0].score}/${attempts[0].total} · +${attempts[0].readinessDelta ?? 0} readiness` : "No saved attempts yet."}</p></Card></section>
    </motion.div>
  );
}
