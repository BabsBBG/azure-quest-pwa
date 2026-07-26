import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { PRODUCT_NAME } from "../lib/brand";

export function Account() {
  const auth = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profileName, setProfileName] = useState(auth.user?.user_metadata?.full_name ?? "");

  const displayName = useMemo(() => auth.user?.user_metadata?.full_name || auth.user?.email || "Local learner", [auth.user]);

  useEffect(() => {
    setProfileName(auth.user?.user_metadata?.full_name ?? "");
  }, [auth.user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "sign-up") await auth.signUp({ email, password, name });
    else await auth.signIn({ email, password });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await auth.updateProfile({ name: profileName });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="aq-hero p-5 sm:p-6">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">Account</Badge>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Your {PRODUCT_NAME} profile.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold text-[var(--aq-muted)]">Sign in for an individual account while local demo practice and attempt history continue to work on this device.</p>
      </section>

      {!auth.configured ? (
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader><CardTitle>Accounts are not configured locally</CardTitle><ShieldCheck className="h-6 w-6 text-amber-500" /></CardHeader>
          <p className="font-semibold text-[var(--aq-muted)]">Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable Supabase email/password and Google accounts. Logged-out demo practice remains available.</p>
        </Card>
      ) : null}

      {auth.user ? (
        <Card>
          <CardHeader>
            <div>
              <Badge className="mb-2">Signed in</Badge>
              <CardTitle>{displayName}</CardTitle>
              <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">{auth.user.email}</p>
            </div>
            <UserRound className="h-8 w-8 text-[var(--aq-blue-600)]" />
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-1 text-sm font-semibold text-[var(--aq-muted)]">
                Display name
                <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" autoComplete="name" />
              </label>
              <Button type="submit" variant="hero" disabled={auth.loading} className="self-end">{auth.loading ? "Saving..." : "Save profile"}</Button>
            </form>
            {auth.error ? <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">{auth.error}</p> : null}
            <Button onClick={() => void auth.signOut()} variant="soft" disabled={auth.loading} className="mt-4"><LogOut className="h-4 w-4" /> Sign out</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div>
              <Badge className="mb-2">Logged out</Badge>
              <CardTitle>{mode === "sign-up" ? "Create account" : "Sign in"}</CardTitle>
              <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">Google and email sign-in use Supabase. Local demo practice and attempt history still work on this device.</p>
            </div>
            <LogIn className="h-8 w-8 text-[var(--aq-blue-600)]" />
          </CardHeader>
          <CardContent>
            <Button type="button" variant="soft" disabled={auth.loading || !auth.configured} onClick={() => void auth.signInWithGoogle()} className="mb-4 w-full justify-center bg-white text-[var(--aq-ink)] hover:bg-[var(--aq-blue-50)] dark:bg-[#0d1d36] dark:text-white dark:hover:bg-[#10284c]">
              <KeyRound className="h-4 w-4" />
              Continue with Google
            </Button>
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--aq-muted)]">
              <span className="h-px flex-1 bg-[var(--aq-border)]" />
              Email sign-in
              <span className="h-px flex-1 bg-[var(--aq-border)]" />
            </div>
            <p className="mb-4 rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] p-3 text-xs font-semibold text-[var(--aq-muted)]">PraxisGrid sign-in does not imply affiliation with Google, Microsoft, AWS, or certification providers.</p>
            <form onSubmit={submit} className="grid gap-3">
              {mode === "sign-up" ? (
                <label className="grid gap-1 text-sm font-semibold text-[var(--aq-muted)]">
                  Name
                  <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" />
                </label>
              ) : null}
              <label className="grid gap-1 text-sm font-semibold text-[var(--aq-muted)]">
                Email
                <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" autoComplete="email" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-[var(--aq-muted)]">
                Password
                <input className="aq-input px-4 py-3 text-[var(--aq-ink)]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="Minimum 6 characters" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} />
              </label>
              {auth.error ? <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">{auth.error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="hero" disabled={auth.loading || !auth.configured}>{auth.loading ? "Working..." : mode === "sign-up" ? "Create account" : "Sign in"}</Button>
                <Button type="button" variant="soft" onClick={() => { auth.clearError(); setMode(mode === "sign-up" ? "sign-in" : "sign-up"); }}>{mode === "sign-up" ? "I already have an account" : "Create account"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
