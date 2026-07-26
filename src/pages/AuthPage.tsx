import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../lib/brand";

type AuthMode = "signin" | "signup" | "reset";

function modeFromQuery(value: string | null): AuthMode {
  if (value === "signup" || value === "reset") return value;
  return "signin";
}

export function AuthPage() {
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const mode = modeFromQuery(params.get("mode"));

  const title = useMemo(() => {
    if (mode === "signup") return "Create your PraxisGrid account";
    if (mode === "reset") return "Reset your password";
    return "Sign in to PraxisGrid";
  }, [mode]);

  if (auth.user) return <Navigate to="/" replace />;

  function setMode(nextMode: AuthMode) {
    auth.clearError();
    setNotice(null);
    setParams({ mode: nextMode });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (mode === "signup") {
      await auth.signUp({ email, password, name });
      setNotice("Check your inbox if email verification is required for this Supabase project.");
      return;
    }
    if (mode === "reset") {
      await auth.resetPassword({ email });
      setNotice("If the address exists, Supabase will send a password reset link.");
      return;
    }
    await auth.signIn({ email, password });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Badge className="border-[#004b9b] bg-[#004b9b] text-white dark:bg-[#004b9b] dark:text-white">{PRODUCT_NAME}</Badge>
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">{PRODUCT_TAGLINE}</h1>
            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-slate-700">
              A private learning workspace for certification practice, project evidence, and interview preparation.
            </p>
          </div>
          <div className="grid gap-3 text-sm font-semibold text-slate-700">
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--aq-blue-700)]" /> Personal progress and repository analysis stay tied to your account.</p>
            <p className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[var(--aq-blue-700)]" /> PraxisGrid is independent and not affiliated with certification providers.</p>
          </div>
        </motion.div>

        <section
          className="rounded-md border border-[var(--aq-border)] bg-white p-5 text-slate-950 shadow-[var(--aq-shadow)] sm:p-6"
          style={{ colorScheme: "light" }}
        >
          <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge className="mb-2">{mode === "signup" ? "Signup" : mode === "reset" ? "Recovery" : "Signin"}</Badge>
              <h2 className="text-xl font-bold leading-tight text-slate-950">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-700">Google and email sign-in use Supabase. Your account controls access to Learn, Practise, and Prove.</p>
            </div>
            <Mail className="h-7 w-7 text-[var(--aq-blue-700)]" />
          </header>
          <div>
            <Button type="button" variant="soft" disabled={auth.loading || !auth.configured} onClick={() => void auth.signInWithGoogle()} className="mb-4 w-full justify-center bg-white text-[var(--aq-ink)] hover:bg-[var(--aq-blue-50)]">
              <KeyRound className="h-4 w-4" />
              Continue with Google
            </Button>
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
              <span className="h-px flex-1 bg-[var(--aq-border)]" />
              {mode === "reset" ? "Recovery email" : "Email access"}
              <span className="h-px flex-1 bg-[var(--aq-border)]" />
            </div>

            {!auth.configured ? (
              <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">Account sign-in is not available in this environment. Please try again later.</p>
            ) : null}

            <form onSubmit={submit} className="grid gap-3">
              {mode === "signup" ? (
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Name
                  <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" />
                </label>
              ) : null}
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Email
                <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" autoComplete="email" />
              </label>
              {mode !== "reset" ? (
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Password
                  <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="Minimum 6 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </label>
              ) : null}
              {auth.error ? <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">{auth.error}</p> : null}
              {notice ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{notice}</p> : null}
              <Button type="submit" variant="hero" disabled={auth.loading || !auth.configured}>{auth.loading ? "Working..." : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
              {mode !== "signin" ? <button type="button" className="text-[#0057b8] underline underline-offset-4" onClick={() => setMode("signin")}>Sign in</button> : null}
              {mode !== "signup" ? <button type="button" className="text-[#0057b8] underline underline-offset-4" onClick={() => setMode("signup")}>Create account</button> : null}
              {mode !== "reset" ? <button type="button" className="text-[#0057b8] underline underline-offset-4" onClick={() => setMode("reset")}>Forgot password?</button> : null}
            </div>
            <p className="mt-5 text-xs font-semibold text-slate-700">
              By continuing, you agree to the <Link className="text-[#0057b8] underline underline-offset-4" to="/terms">Terms</Link> and <Link className="text-[#0057b8] underline underline-offset-4" to="/privacy">Privacy</Link>.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
