import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, Gauge, Home, Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { Switch } from "./ui/switch";

const navItems = [
  { to: "/", label: "Paths", icon: Home },
  { to: "/cert/sc-300/knowledge", label: "Exams", icon: BookOpen },
  { to: "/cert/sc-300/readiness", label: "Ready", icon: Gauge },
  { to: "/cert/sc-300/job", label: "Jobs", icon: BriefcaseBusiness }
];

function currentCertFromPath(pathname: string) {
  if (pathname.includes("az-500") || pathname.includes("AZ-500")) return "az-500";
  if (pathname.includes("sc-500") || pathname.includes("SC-500")) return "sc-500";
  return "sc-300";
}

export function Layout({ children }: { children: React.ReactNode }) {
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const { pathname } = useLocation();
  const certSlug = currentCertFromPath(pathname);
  const mobileNav = navItems.map((item) => item.to === "/" ? item : { ...item, to: item.to.replace("sc-300", certSlug) });

  return (
    <div className={cn(
      "min-h-screen text-slate-950 dark:text-white",
      settings.lowBandwidth
        ? "bg-slate-50 dark:bg-slate-950"
        : "bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,#ffffff,#f7fff9)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,#020d09,#052e22)]"
    )}>
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur-xl dark:border-emerald-300/10 dark:bg-emerald-950/86">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900 text-lg text-white shadow-glow dark:bg-emerald-300 dark:text-emerald-950">AQ</span>
            <span>
              Azure Quest
              <span className="block text-xs font-extrabold text-slate-500 dark:text-slate-400">Practice exams · interview readiness</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            <Link to="/" className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-400/10">Paths</Link>
            <Link to={`/cert/${certSlug}/knowledge`} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-400/10">Exams</Link>
            <Link to={`/cert/${certSlug}/readiness`} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-400/10">Readiness</Link>
            <Link to={`/cert/${certSlug}/job`} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-400/10">Job Readiness</Link>
            <Link to={`/history?cert=${certSlug.toUpperCase()}`} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-400/10">History</Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold dark:bg-emerald-400/10 md:flex">
              {settings.lowBandwidth ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              <Switch checked={settings.lowBandwidth} onCheckedChange={(v) => void setSettings({ lowBandwidth: v })} label="Low bandwidth" />
            </div>
            <div className="items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold dark:bg-emerald-400/10 flex">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Switch checked={settings.darkMode} onCheckedChange={(v) => void setSettings({ darkMode: v })} label="Dark mode" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:pb-10">{children}</main>

      <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-900/10 bg-white/94 p-2 shadow-card backdrop-blur-xl dark:border-emerald-300/10 dark:bg-emerald-950/94 sm:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.68rem] font-semibold transition",
                    isActive ? "bg-emerald-900 text-white dark:bg-emerald-300 dark:text-emerald-950" : "text-emerald-900/55 dark:text-emerald-50/55"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
