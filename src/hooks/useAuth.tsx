import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { UserRole } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { upsertProfile } from "../lib/cloudSync";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  onboardingComplete: boolean;
  role: UserRole;
  roleLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (args: { email: string; password: string; name?: string }) => Promise<void>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: (args?: { redirectTo?: string }) => Promise<void>;
  resetPassword: (args: { email: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (args: { name: string }) => Promise<void>;
  completeOnboarding: (args: { primaryCert: string; goal: string; experience: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Authentication failed. Please check your details and try again.";
}

function profileName(user?: User | null) {
  const metadataName = user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  return typeof metadataName === "string" && metadataName.trim().length > 0 ? metadataName : null;
}

function hasCompletedOnboarding(user?: User | null) {
  return user?.user_metadata?.praxisgrid_onboarded === true;
}

function syncProfile(session: Session | null) {
  if (!session?.user) return;
  void upsertProfile({
    email: session.user.email,
    fullName: profileName(session.user)
  }).catch(() => undefined);
}

async function readCurrentRole(user: User | null): Promise<UserRole> {
  if (!supabase || !user) return "USER";
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (error || !data?.role) return "USER";
  return data.role as UserRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [role, setRole] = useState<UserRole>("USER");
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applySession(nextSession: Session | null) {
    setSession(nextSession);
    syncProfile(nextSession);
    if (!nextSession?.user) {
      setRole("USER");
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const nextRole = await readCurrentRole(nextSession.user);
    setRole(nextRole);
    setRoleLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(authErrorMessage(sessionError));
      void applySession(data.session ?? null).finally(() => setLoading(false));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession).finally(() => setLoading(false));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    onboardingComplete: hasCompletedOnboarding(session?.user),
    role,
    roleLoading,
    error,
    clearError: () => setError(null),
    signUp: async ({ email, password, name }) => {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable accounts.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name ?? "" } }
      });
      if (signUpError) setError(authErrorMessage(signUpError));
      else syncProfile(data.session ?? null);
      setLoading(false);
    },
    signIn: async ({ email, password }) => {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable accounts.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(authErrorMessage(signInError));
      else syncProfile(data.session ?? null);
      setLoading(false);
    },
    signInWithGoogle: async (args) => {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google sign-in.");
        return;
      }
      setLoading(true);
      setError(null);
      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}${args?.redirectTo ?? "/account"}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined
      });
      if (oauthError) setError(authErrorMessage(oauthError));
      setLoading(false);
    },
    resetPassword: async ({ email }) => {
      if (!supabase) {
        setError("Account sign-in is not available in this environment.");
        return;
      }
      setLoading(true);
      setError(null);
      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/auth?mode=signin`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (resetError) setError(authErrorMessage(resetError));
      setLoading(false);
    },
    signOut: async () => {
      if (!supabase) return;
      setLoading(true);
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(authErrorMessage(signOutError));
      setLoading(false);
    },
    updateProfile: async ({ name }) => {
      if (!supabase) return;
      setLoading(true);
      setError(null);
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (updateError) setError(authErrorMessage(updateError));
      else if (data.user) {
        if (session) setSession({ ...session, user: data.user });
        await upsertProfile({ email: data.user.email, fullName: name }).catch(() => undefined);
      }
      setLoading(false);
    },
    completeOnboarding: async ({ primaryCert, goal, experience }) => {
      if (!supabase || !session?.user) {
        setError("Sign in is required to complete onboarding.");
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          ...session.user.user_metadata,
          praxisgrid_onboarded: true,
          praxisgrid_primary_cert: primaryCert,
          praxisgrid_goal: goal,
          praxisgrid_experience: experience
        }
      });
      if (updateError) setError(authErrorMessage(updateError));
      else if (data.user) {
        setSession({ ...session, user: data.user });
        await upsertProfile({ email: data.user.email, fullName: profileName(data.user) }).catch(() => undefined);
      }
      setLoading(false);
    }
  }), [error, loading, role, roleLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
