import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, ClipboardList, Moon, Sun, UserRound, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../hooks/useAuth";
import { Switch } from "./ui/switch";
import { PRODUCT_INITIALS, PRODUCT_NAME, PRODUCT_TAGLINE, PROVIDER_NEUTRAL_DISCLAIMER } from "../lib/brand";

const navItems = [
  { to: "/cert/sc-300", label: "Learn", icon: BookOpen },
  { to: "/cert/sc-300/knowledge", label: "Practise", icon: ClipboardList },
  { to: "/cert/sc-300/job", label: "Prove", icon: BriefcaseBusiness }
];

function currentCertFromPath(pathname: string) {
  if (pathname.includes("az-500") || pathname.includes("AZ-500")) return "az-500";
  if (pathname.includes("sc-500") || pathname.includes("SC-500")) return "sc-500";
  return "sc-300";
}

function pageTitleFromPath(pathname: string): string {
  if (pathname === "/") return "Paths";
  if (pathname.includes("/knowledge")) return "Domain Quizzes";
  if (pathname.includes("/readiness")) return "Certification Progress";
  if (pathname.includes("/job")) return "Career Lab";
  if (pathname.includes("/account")) return "Account";
  if (pathname.includes("/arena")) return "Assessment";
  if (pathname.includes("/flashcards")) return "Flashcards";
  if (pathname.includes("/history")) return "Activity History";
  if (pathname.includes("/cases")) return "Scenario Challenges";
  if (pathname.includes("/kql")) return "KQL Gym";
  if (pathname.includes("/study")) return "Targeted Practice";
  if (pathname.includes("/cert/")) return "Overview";
  return PRODUCT_NAME;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const certSlug = currentCertFromPath(pathname);
  const mobileNav = navItems.map((item) => ({ ...item, to: item.to.replace("sc-300", certSlug).replace("SC-300", certSlug.toUpperCase()) }));
  const pageTitle = pageTitleFromPath(pathname);
  const showMobileNav = !pathname.includes("/arena");

  return (
    <div className={cn(
      "min-h-screen text-[var(--aq-ink)]",
      settings.lowBandwidth
        ? "bg-slate-50 dark:bg-slate-950"
        : "aq-page-shell"
    )}>
      <header className="sticky top-0 z-40 border-b border-[var(--aq-border)] bg-white/95 shadow-sm backdrop-blur dark:bg-[#061227]/95">
        {/* Mobile app bar */}
        <div className="flex h-14 items-center justify-between px-4 sm:hidden">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-700)] text-sm font-extrabold text-white shadow-sm">{PRODUCT_INITIALS}</span>
            <span className="text-base font-extrabold">{PRODUCT_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/account" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)]" aria-label="Account">
              <UserRound className="h-4 w-4" />
            </Link>
            <button
              onClick={() => void setSettings({ darkMode: !settings.darkMode })}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)]"
              aria-label="Toggle dark mode"
            >
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Desktop header */}
        <div className="mx-auto hidden max-w-6xl items-center justify-between px-4 py-3 sm:flex">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-700)] text-lg font-extrabold text-white shadow-sm">{PRODUCT_INITIALS}</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold">{PRODUCT_NAME}</span>
              <span className="block text-xs font-semibold text-[var(--aq-muted)]">{user?.email ?? PRODUCT_TAGLINE}</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {mobileNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md border px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)] dark:bg-[#0f3a67] dark:text-[#e7f3ff]"
                      : "border-transparent text-[var(--aq-muted)] hover:border-[var(--aq-border)] hover:bg-[var(--aq-blue-50)] hover:text-[var(--aq-blue-800)]"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/account" className="hidden items-center gap-2 rounded-lg border border-[var(--aq-border)] bg-white px-3 py-2 text-sm font-bold text-[var(--aq-blue-800)] shadow-sm hover:bg-[var(--aq-blue-50)] dark:bg-[#0d1d36] dark:text-white md:flex">
              <UserRound className="h-4 w-4" />
              Account
            </Link>
            <div className="hidden items-center gap-2 rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-50)] px-3 py-2 text-sm font-bold md:flex">
              {settings.lowBandwidth ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              <Switch checked={settings.lowBandwidth} onCheckedChange={(v) => void setSettings({ lowBandwidth: v })} label="Low bandwidth" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--aq-border)] bg-[var(--aq-blue-50)] px-3 py-2 text-sm font-bold">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Switch checked={settings.darkMode} onCheckedChange={(v) => void setSettings({ darkMode: v })} label="Dark mode" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-10">
        {children}
        <footer className="mt-8 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
          {PROVIDER_NEUTRAL_DISCLAIMER}
        </footer>
      </main>

      {showMobileNav ? <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-md border border-[var(--aq-border)] bg-white/95 p-2 shadow-[var(--aq-shadow)] backdrop-blur dark:bg-[#061227]/95 sm:hidden">
        <div className="grid grid-cols-3 gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center text-[0.58rem] font-bold leading-tight transition",
                    isActive
                      ? "border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)] shadow-sm dark:bg-[#0f3a67] dark:text-[#e7f3ff]"
                      : "border-transparent text-[var(--aq-muted)]"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav> : null}
    </div>
  );
}
