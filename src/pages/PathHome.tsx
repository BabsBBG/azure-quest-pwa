import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gauge, GraduationCap, ShieldCheck, WifiOff } from "lucide-react";
import { certPaths, pathFor } from "../data/certPaths";
import { useAppStore } from "../store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

export function PathHome() {
  const readiness = useAppStore((state) => state.progress.readiness);
  const settings = useAppStore((state) => state.settings);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="overflow-hidden rounded-[2.2rem] pro-panel border border-emerald-900/10 p-5 text-emerald-950 shadow-card dark:border-emerald-300/10 dark:text-white sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1.25fr_.75fr] md:items-end">
          <div>
            <Badge className="mb-4 bg-emerald-900 text-white dark:bg-emerald-300 dark:text-emerald-950">Azure Quest Pro</Badge>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Choose your certification path.</h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-emerald-900/70 dark:text-emerald-50/75">Focused practice exams, readiness analytics, project storytelling, and interview simulation for Microsoft security roles.</p>
          </div>
          <div className="grid gap-3 rounded-[1.6rem] bg-emerald-900/5 p-4 dark:bg-white/5">
            <div className="flex items-center gap-3"><Gauge className="h-6 w-6" /><span className="font-semibold">Readiness replaces XP</span></div>
            <div className="flex items-center gap-3"><GraduationCap className="h-6 w-6" /><span className="font-semibold">Practice-first build</span></div>
            <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6" /><span className="font-semibold">Job interview simulator</span></div>
            {settings.lowBandwidth ? <div className="flex items-center gap-3"><WifiOff className="h-6 w-6" /><span className="font-semibold">Low-bandwidth mode on</span></div> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {certPaths.map((path, index) => {
          const value = Math.round(readiness[path.cert] ?? 0);
          return (
            <motion.div key={path.cert} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Link to={`/cert/${pathFor(path.cert)}`}>
                <Card className="group overflow-hidden border-0 bg-white/90 p-0 shadow-card transition hover:-translate-y-1 hover:shadow-glow dark:bg-slate-900/90">
                  <div className={`h-2 bg-gradient-to-r ${path.accent}`} />
                  <CardHeader className="items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className="bg-emerald-900 text-white dark:bg-emerald-300 dark:text-emerald-950">{path.cert}</Badge>
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-emerald-900/5 dark:text-white">{path.role}</Badge>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl">{path.title}</CardTitle>
                      <p className="mt-2 max-w-2xl text-base font-medium text-slate-500 dark:text-slate-400">{path.summary}</p>
                    </div>
                    <div className="min-w-32 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/5">
                      <div className="text-3xl font-semibold">{value}%</div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">READINESS</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={value} />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{path.examFormat}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">Open path <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </section>
    </motion.div>
  );
}
