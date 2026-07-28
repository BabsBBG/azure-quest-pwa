import { FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { certPaths, isCertActivatable } from "../data/certPaths";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { PRODUCT_NAME } from "../lib/brand";

const goals = [
  { id: "learn", title: "Learn", description: "Build official-source understanding before attempting runs." },
  { id: "practise", title: "Practise", description: "Use domain quizzes and recovery flows to find weak spots." },
  { id: "prove", title: "Prove", description: "Prepare project evidence, STAR answers, and interview stories." }
];

const experienceLevels = [
  { id: "new", title: "New to cloud security" },
  { id: "building", title: "Building hands-on experience" },
  { id: "working", title: "Already working in security" }
];

function safeReturnPath(value: unknown) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth") || value.startsWith("/onboarding")) return "/";
  return value;
}

export function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const activeCerts = useMemo(() => certPaths.filter((path) => isCertActivatable(path.cert)), []);
  const editing = params.get("edit") === "true";
  const metadata = auth.user?.user_metadata;
  const [primaryCert, setPrimaryCert] = useState(typeof metadata?.praxisgrid_primary_cert === "string" ? metadata.praxisgrid_primary_cert : activeCerts[0]?.cert ?? "SC-300");
  const [goal, setGoal] = useState(typeof metadata?.praxisgrid_goal === "string" ? metadata.praxisgrid_goal : goals[0].id);
  const [experience, setExperience] = useState(typeof metadata?.praxisgrid_experience === "string" ? metadata.praxisgrid_experience : experienceLevels[0].id);
  const returnTo = safeReturnPath(params.get("from") ?? (location.state as { from?: string } | null)?.from);

  if (!auth.user) return <Navigate to="/auth?mode=signup" replace />;
  if (auth.onboardingComplete && !editing) return <Navigate to={returnTo} replace />;

  async function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await auth.completeOnboarding({ primaryCert, goal, experience });
    navigate(returnTo, { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-[var(--aq-ink)] dark:bg-[#061227]">
      <form onSubmit={finish} className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl content-center gap-5">
        <section className="aq-hero p-5 sm:p-6">
          <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Onboarding</Badge>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{editing ? "Update" : "Set up"} your {PRODUCT_NAME} workspace.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-[var(--aq-muted)]">Choose a starting certification and goal so Learn, Practise, and Prove open with the right context.</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div>
                <Badge className="mb-2">Step 1</Badge>
                <CardTitle className="text-2xl">Pick your starting path</CardTitle>
              </div>
              <GraduationCap className="h-7 w-7 text-[var(--aq-blue-600)]" />
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              {activeCerts.map((path) => (
                <button
                  key={path.cert}
                  type="button"
                  aria-pressed={primaryCert === path.cert}
                  onClick={() => setPrimaryCert(path.cert)}
                  className={`rounded-md border p-4 text-left transition ${primaryCert === path.cert ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white shadow-sm" : "aq-row-card"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={primaryCert === path.cert ? "bg-white/15 text-white dark:bg-white/15 dark:text-white" : ""}>{path.cert}</Badge>
                    {primaryCert === path.cert ? <CheckCircle2 className="h-5 w-5" /> : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{path.title}</h2>
                  <p className={`mt-2 text-sm font-semibold ${primaryCert === path.cert ? "text-white/80" : "text-[var(--aq-muted)]"}`}>{path.summary}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <Badge className="mb-2">Step 2</Badge>
                <CardTitle className="text-2xl">Focus the workspace</CardTitle>
              </div>
              <Sparkles className="h-7 w-7 text-[var(--aq-blue-600)]" />
            </CardHeader>
            <div className="grid gap-3">
              {goals.map((item) => (
                <button key={item.id} type="button" aria-pressed={goal === item.id} onClick={() => setGoal(item.id)} className={`rounded-md border p-4 text-left transition ${goal === item.id ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : "aq-row-card"}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className={`mt-1 text-sm font-semibold ${goal === item.id ? "text-white/80" : "text-[var(--aq-muted)]"}`}>{item.description}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <Badge className="mb-2">Step 3</Badge>
              <CardTitle>Experience level</CardTitle>
            </div>
            <ShieldCheck className="h-6 w-6 text-[var(--aq-blue-600)]" />
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-3">
            {experienceLevels.map((item) => (
              <button key={item.id} type="button" aria-pressed={experience === item.id} onClick={() => setExperience(item.id)} className={`rounded-md border p-4 text-left font-semibold transition ${experience === item.id ? "border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white" : "aq-row-card"}`}>
                {item.title}
              </button>
            ))}
          </div>
          {auth.error ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">{auth.error}</p> : null}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[var(--aq-muted)]">Onboarding stores only workspace preferences on your signed-in profile.</p>
            <Button type="submit" variant="hero" size="lg" disabled={auth.loading}>
              {auth.loading ? "Saving..." : editing ? "Save workspace" : "Enter workspace"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </form>
    </main>
  );
}
