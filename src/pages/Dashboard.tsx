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
import { curatedDomainQuizzes } from "../data/curatedDomainQuizzes";
import { readinessAll } from "../utils/readiness";

export function Dashboard() {
  const progress = useAppStore((state) => state.progress);
  const attempts = useAppStore((state) => state.attempts);
  const questions = useAppStore((state) => state.questions);
  const reports = readinessAll(attempts, questions);
  const weakTags = Object.entries(progress.weakTags).sort((a, b) => b[1] - a[1]).filter(([, score]) => score > 0).slice(0, 4);
  const dailyPct = Math.min(100, (progress.completedToday / progress.dailyGoal) * 100);
  const featuredQuizzes = curatedDomainQuizzes.filter((_, index) => index % 5 === 0).slice(0, 9);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
      <section className="aq-hero overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Certification progress system</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Train by evidence, not points.</h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-[var(--aq-muted)]">Certification runs, 12-minute quick quizzes, scenario challenges, KQL Gym, progress signals, and real history analytics.</p>
          </div>
          <motion.div animate={{ rotate: [0, -1, 1, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="grid h-20 w-20 shrink-0 place-items-center rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-700)] text-2xl font-bold text-white shadow-sm sm:h-28 sm:w-28 sm:text-3xl">PG</motion.div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard emoji="STR" label="Streak" value={`${progress.streak} days`} hint="Current streak" />
        <StatCard emoji="TOD" label="Today" value={`${progress.completedToday}/${progress.dailyGoal}`} hint="Daily questions" />
        {reports.map(r => <StatCard key={r.cert} emoji={r.cert.split("-")[1]} label={`${r.cert} Progress`} value={`${r.readiness}%`} hint={r.status} />)}
      </div>

      <Card>
        <CardHeader><div><CardTitle>Progress command</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Your study plan is based on practice evidence.</p></div><Gauge className="h-6 w-6 text-blue-500" /></CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          {reports.map(r => <Link key={r.cert} to="/readiness" className="aq-row-card p-4"><div className="mb-2 flex justify-between font-semibold"><span>{r.cert}</span><span>{r.readiness}%</span></div><Progress value={r.readiness}/><p className="mt-2 text-xs font-semibold text-[var(--aq-muted)]">{r.recommendation}</p></Link>)}
        </div>
      </Card>

      <Card>
        <CardHeader><div><CardTitle>Daily goal</CardTitle><p className="text-sm font-semibold text-[var(--aq-muted)]">{progress.completedToday}/{progress.dailyGoal} questions today</p></div><Badge>Focus</Badge></CardHeader>
        <Progress value={dailyPct} />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white"><CardHeader><CardTitle className="text-white">Certification Runs</CardTitle><Swords className="h-7 w-7" /></CardHeader><CardContent><div className="grid gap-3">
          {(["SC-300","SC-500"] as const).map(cert => <Button key={cert} asChild size="lg" variant="soft" className="justify-between"><Link to={`/arena?cert=${cert}&mode=timed&count=50&minutes=100&examTitle=${encodeURIComponent(`${cert} Certification Run`)}`}>{cert} certification run <ArrowRight className="h-5 w-5" /></Link></Button>)}
          <Button asChild size="lg" variant="soft" className="justify-between"><Link to="/cert/az-500/readiness">AZ-500 retiring: view history <ArrowRight className="h-5 w-5" /></Link></Button>
          <Button asChild size="lg" variant="default" className="justify-between border-white/40 bg-white text-[var(--aq-blue-800)]"><Link to="/arena?cert=SC-500&mode=weak&count=15&minutes=15&examTitle=Weak%20Area%20Blitz">Weak Area Blitz <Zap className="h-5 w-5" /></Link></Button>
        </div></CardContent></Card>

        <Card className="border-blue-700 bg-blue-700 text-white"><CardHeader><div><CardTitle>Daily Practice</CardTitle><p className="text-sm font-semibold opacity-85">Choose a focus area. 10 questions. 10 minutes.</p></div><Trophy className="h-7 w-7" /></CardHeader><CardContent><div className="grid gap-3">
          <Button asChild size="lg" variant="soft" className="h-16 justify-between"><Link to="/arena?cert=SC-300&mode=daily&count=10&minutes=10&fighter=Identity%20Focus&examTitle=Daily%20Practice%20-%20Identity%20Focus"><span><UserRound className="mr-2 inline h-5 w-5" /> Identity Focus</span><ArrowRight className="h-5 w-5" /></Link></Button>
          <Button asChild size="lg" variant="soft" className="h-16 justify-between"><Link to="/arena?cert=SC-500&mode=daily&count=10&minutes=10&fighter=Security%20Focus&examTitle=Daily%20Practice%20-%20Security%20Focus"><span><Shield className="mr-2 inline h-5 w-5" /> Security Focus</span><ArrowRight className="h-5 w-5" /></Link></Button>
        </div></CardContent></Card>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button asChild size="lg" variant="hero" className="h-16 justify-between sm:h-20"><Link to="/readiness"><span>Progress</span><Target className="shrink-0" /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-16 justify-between sm:h-20"><Link to="/cases"><span>Scenarios</span><BriefcaseBusiness className="shrink-0" /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-16 justify-between sm:h-20"><Link to="/kql"><span>KQL Gym</span><Code2 className="shrink-0" /></Link></Button>
        <Button asChild size="lg" variant="soft" className="h-16 justify-between sm:h-20"><Link to="/readiness"><span>Runs</span><BookOpenCheck className="shrink-0" /></Link></Button>
      </section>

      <Card><CardHeader><div><CardTitle>Quick Quizzes</CardTitle><p className="text-sm font-bold text-slate-500 dark:text-slate-400">10 questions / 12 minutes / focused skill.</p></div><BookOpenCheck className="h-6 w-6 text-sky-500" /></CardHeader><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featuredQuizzes.map((quiz) => <Link key={quiz.id} to={quiz.publicationStatus === "published" ? `/arena?cert=${quiz.cert}&mode=quiz&count=${quiz.targetQuestions}&minutes=${quiz.minutes}&quizId=${quiz.id}&examTitle=${encodeURIComponent(quiz.title)}&domain=${encodeURIComponent(quiz.domain)}&tags=${encodeURIComponent(quiz.focusTags.join(","))}` : `/cert/${quiz.cert.toLowerCase()}/knowledge`} className="aq-row-card p-4"><p className="font-semibold">{quiz.title}</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{quiz.track} / {quiz.publicationStatus}</p><p className="text-xs font-semibold text-[var(--aq-muted)]">{quiz.targetQuestions}Q / {quiz.minutes}m / Domain {quiz.domainNumber}</p></Link>)}
      </div></Card>

      <section className="grid gap-4 sm:grid-cols-3"><Button asChild size="lg" variant="hero" className="h-20 justify-between"><Link to="/study"><span>Study Review</span><Brain /></Link></Button><Button asChild size="lg" variant="success" className="h-20 justify-between"><Link to="/flashcards"><span>Flashcards</span><Gauge /></Link></Button><Button asChild size="lg" variant="default" className="h-20 justify-between"><Link to="/history"><span>Activity History</span><History /></Link></Button></section>

      <Card><CardHeader><CardTitle>Certification run menu</CardTitle><Trophy className="h-6 w-6 text-[var(--aq-blue-600)]" /></CardHeader><div className="grid gap-3 sm:grid-cols-2">{examBlueprints.map((exam) => <Link key={exam.id} to={`/arena?cert=${exam.cert}&mode=timed&count=${exam.targetQuestions}&minutes=${exam.minutes}&examId=${exam.id}&examTitle=${encodeURIComponent(exam.title)}${exam.focusDomain ? `&domain=${encodeURIComponent(exam.focusDomain)}` : ""}`} className="aq-row-card p-4"><p className="font-semibold">{exam.title}</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{exam.subtitle}</p><p className="text-sm font-semibold text-[var(--aq-muted)]">{exam.targetQuestions}Q / {exam.minutes}m / {exam.vibe}</p></Link>)}</div></Card>

      <section className="grid gap-4 sm:grid-cols-2"><Card><CardHeader><div><CardTitle>Target areas</CardTitle><p className="text-sm font-semibold text-[var(--aq-muted)]">Review these first.</p></div><Brain className="h-7 w-7 text-[var(--aq-blue-600)]" /></CardHeader><CardContent>{weakTags.length ? <div className="grid gap-2">{weakTags.map(([tag, score]) => <div key={tag} className="aq-subtle-panel flex items-center justify-between p-3 font-semibold"><span>{tag}</span><span>{score}</span></div>)}</div> : <div className="aq-subtle-panel p-4 font-semibold">No target areas yet. Start a practice run to build your map.</div>}</CardContent></Card><Card><CardHeader><CardTitle>Latest run</CardTitle><Badge>{attempts[0]?.percentage ?? 0}%</Badge></CardHeader><p className="font-semibold text-[var(--aq-muted)]">{attempts[0] ? `${attempts[0].title} / ${attempts[0].score}/${attempts[0].total} / +${attempts[0].readinessDelta ?? 0} progress` : "No saved attempts yet."}</p></Card></section>
    </motion.div>
  );
}
