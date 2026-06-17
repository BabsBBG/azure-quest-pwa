import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, BriefcaseBusiness, Gauge, GraduationCap, HelpCircle, ShieldCheck } from "lucide-react";
import { certFromSlug, metaFor, pathFor } from "../data/certPaths";
import { docs } from "../data/docs";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

const actionCards = [
  { key: "knowledge", title: "Knowledge Check", description: "Quizzes, mock exams, case files, KQL Gym, and past attempts.", icon: HelpCircle },
  { key: "readiness", title: "Exam Readiness", description: "Readiness score, weak domains, trends, and next best action.", icon: Gauge },
  { key: "job", title: "Job Readiness", description: "Mock interviews, project stories, STAR answers, and what to say.", icon: BriefcaseBusiness }
];

export function CertHome() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const meta = metaFor(cert);
  const readiness = Math.round(useAppStore((state) => state.progress.readiness[cert] ?? 0));
  const docInfo = docs[pathFor(cert) as keyof typeof docs];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${meta.accent} p-5 text-white shadow-card sm:p-6`}>
        <Badge className="mb-4 bg-white/20 text-white">{cert}</Badge>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-base font-bold text-white/80">{meta.summary}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.4rem] bg-white/15 p-4"><div className="text-4xl font-black">{readiness}%</div><p className="text-xs font-black opacity-80">EXAM READINESS</p></div>
          <div className="rounded-[1.4rem] bg-white/15 p-4"><div className="text-xl font-black">{meta.quizFormat}</div><p className="text-xs font-black opacity-80">QUIZ SPRINTS</p></div>
          <div className="rounded-[1.4rem] bg-white/15 p-4"><div className="text-xl font-black">Pass target {meta.readinessTarget}%</div><p className="text-xs font-black opacity-80">GOAL</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} to={`/cert/${pathFor(cert)}/${card.key}`}>
              <Card className="group h-full transition hover:-translate-y-1 hover:shadow-glow">
                <CardHeader>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"><Icon className="h-6 w-6" /></div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-slate-500 dark:text-slate-400">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <Card>
        <CardHeader><CardTitle>Domain map</CardTitle><BookOpen className="h-6 w-6" /></CardHeader>
        <div className="grid gap-3">
          {docInfo.domains.map((domain) => (
            <div key={domain.name} className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10">
              <div className="mb-2 flex justify-between gap-3 text-sm font-black"><span>{domain.name}</span><span>{domain.weight}</span></div>
              <Progress value={Number(domain.weight.match(/\d+/)?.[0] ?? 25)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader><CardTitle>Job-readiness promise</CardTitle><ShieldCheck className="h-6 w-6" /></CardHeader>
        <p className="text-lg font-bold opacity-80">This path does not only prepare you to pass. It prepares you to explain your projects, answer interviewer follow-ups, and sound like someone who has built real cloud security controls.</p>
        <Link className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-slate-950 dark:bg-slate-950 dark:text-white" to={`/cert/${pathFor(cert)}/job`}><GraduationCap className="h-5 w-5" /> Start Job Readiness</Link>
      </Card>
    </motion.div>
  );
}
