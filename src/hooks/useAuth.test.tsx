import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn()
}));

vi.mock("../lib/cloudSync", () => ({
  upsertProfile: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("../lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: mocks.signInWithOAuth
    }
  }
}));

function GoogleSignInProbe() {
  const auth = useAuth();

  return (
    <button type="button" onClick={() => void auth.signInWithGoogle({ redirectTo: "/cert/sc-300/job" })} disabled={auth.loading}>
      Continue with Google
    </button>
  );
}

describe("AuthProvider Google SSO", () => {
  beforeEach(() => {
    mocks.signInWithOAuth.mockReset();
    mocks.signInWithOAuth.mockResolvedValue({ error: null });
    window.history.replaceState({}, "", "/account");
  });

  it("starts Supabase Google OAuth with the requested internal redirect", async () => {
    render(
      <AuthProvider>
        <GoogleSignInProbe />
      </AuthProvider>
    );

    const button = await screen.findByRole("button", { name: "Continue with Google" });
    await waitFor(() => expect(button).not.toBeDisabled());

    fireEvent.click(button);

    await waitFor(() => {
      expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: "http://localhost:3000/cert/sc-300/job" }
      });
    });
  });
});
