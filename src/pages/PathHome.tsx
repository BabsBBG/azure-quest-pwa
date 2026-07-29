import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, BriefcaseBusiness, ClipboardList, Gauge, ShieldCheck, WifiOff } from "lucide-react";
import { certPaths, pathFor } from "../data/certPaths";
import { useAppStore } from "../store/useAppStore";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../lib/brand";

const homeDestinations = [
  {
    title: "Learn",
    description: "Use approved learning summaries and official-source links before practice.",
    to: "/cert/sc-300",
    icon: BookOpen,
    meta: "Study paths and source context"
  },
  {
    title: "Practise",
    description: "Run domain quizzes and focused assessment practice with clear trust labels.",
    to: "/cert/sc-300/knowledge",
    icon: ClipboardList,
    meta: "Quizzes, runs, review"
  },
  {
    title: "Prove",
    description: "Import project evidence, build interview stories, and recover mock sessions.",
    to: "/cert/sc-300/job",
    icon: BriefcaseBusiness,
    meta: "Career Lab and Interview Studio"
  }
];

export function PathHome() {
  const readiness = useAppStore((state) => state.progress.readiness);
  const settings = useAppStore((state) => state.settings);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="aq-hero overflow-hidden p-5 sm:p-8">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{PRODUCT_NAME}</Badge>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{PRODUCT_TAGLINE}</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold text-[var(--aq-muted)] sm:text-base">Choose how you want to build evidence today: learn the source material, practise safely, or prove capability with project-backed interview preparation.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[var(--aq-muted)]">
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--aq-border)] bg-white px-3 py-2 dark:bg-[#0b1b33]"><Gauge className="h-4 w-4" /> One active goal</span>
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--aq-border)] bg-white px-3 py-2 dark:bg-[#0b1b33]"><ShieldCheck className="h-4 w-4" /> Provider-neutral trust copy</span>
          {settings.lowBandwidth ? <span className="inline-flex items-center gap-2 rounded-md border border-[var(--aq-border)] bg-white px-3 py-2 dark:bg-[#0b1b33]"><WifiOff className="h-4 w-4" /> Low-bandwidth mode on</span> : null}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {homeDestinations.map((destination, index) => {
          const Icon = destination.icon;
          return (
            <motion.div key={destination.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Link to={destination.to} className="block h-full">
                <Card className="aq-row-card flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md border border-[var(--aq-blue-200)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-700)] dark:border-[var(--aq-blue-600)] dark:bg-[#08264a] dark:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--aq-blue-600)]" />
                  </div>
                  <Badge className="mb-3 w-fit">{destination.meta}</Badge>
                  <CardTitle className="text-2xl">{destination.title}</CardTitle>
                  <p className="mt-3 text-sm font-semibold text-[var(--aq-muted)]">{destination.description}</p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2">Certification Progress</Badge>
            <CardTitle>Active certification paths</CardTitle>
            <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">SC-300 and SC-500 remain the active preparation paths. AZ-500 history is preserved during retirement.</p>
          </div>
          <Gauge className="h-6 w-6 text-[var(--aq-blue-600)]" />
        </CardHeader>
        <div className="grid gap-3">
          {certPaths.map((path) => {
          const value = Math.round(readiness[path.cert] ?? 0);
          const disabled = path.status !== "ACTIVE";
          return (
            <Link key={path.cert} to={`/cert/${pathFor(disabled ? path.replacementCert ?? "SC-500" : path.cert)}`} className={`aq-row-card block p-4 ${disabled ? "opacity-85" : ""}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{path.cert}</Badge>
                <Badge>{path.role}</Badge>
                {path.status !== "ACTIVE" ? <Badge className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-300 dark:text-slate-950">{path.status}</Badge> : null}
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_10rem] md:items-center">
                <div>
                  <h3 className="text-lg font-semibold">{path.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">{disabled ? "Historical activity preserved; new activation disabled." : path.examFormat}</p>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold text-[var(--aq-muted)]"><span>Progress</span><span>{value}%</span></div>
                  <Progress value={value} />
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </Card>
    </motion.div>
  );
}
