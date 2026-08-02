import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../hooks/useAuth";
import { AuthPage } from "./AuthPage";

afterEach(() => cleanup());

describe("AuthPage", () => {
  it("renders public logged-out auth UI without Supabase env vars", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/auth?mode=signup"]}>
          <AuthPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText("Account sign-in is not available in this environment. Please try again later.")).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue with Google" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeDisabled();
  });

  it("does not require an email field on the recovery password update form", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/auth?mode=update-password"]}>
          <AuthPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByRole("heading", { name: "Set a new password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });
});
