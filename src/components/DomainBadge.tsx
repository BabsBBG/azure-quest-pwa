import { Badge } from "./ui/badge";

export function DomainBadge({ label, tone = "slate" }: { label: string; tone?: "slate" | "blue" | "violet" | "emerald" }) {
  const tones = {
    slate: "bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-white",
    blue: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100",
    violet: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100",
    emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
  };
  return <Badge className={tones[tone]}>{label}</Badge>;
}
