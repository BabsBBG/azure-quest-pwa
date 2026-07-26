import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { upsertProfile } from "../lib/cloudSync";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  error: string | null;
  clearError: () => void;
  signUp: (args: { email: string; password: string; name?: string }) => Promise<void>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (args: { name: string }) => Promise<void>;
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

function syncProfile(session: Session | null) {
  if (!session?.user) return;
  void upsertProfile({
    email: session.user.email,
    fullName: profileName(session.user)
  }).catch(() => undefined);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(authErrorMessage(sessionError));
      setSession(data.session ?? null);
      syncProfile(data.session ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      syncProfile(nextSession);
      setLoading(false);
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
    signInWithGoogle: async () => {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google sign-in.");
        return;
      }
      setLoading(true);
      setError(null);
      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/account`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined
      });
      if (oauthError) setError(authErrorMessage(oauthError));
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
        await upsertProfile({ email: data.user.email, fullName: name }).catch(() => undefined);
      }
      setLoading(false);
    }
  }), [error, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
