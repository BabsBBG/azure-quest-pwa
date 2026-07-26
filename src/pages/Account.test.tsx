import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../hooks/useAuth";
import { Account } from "./Account";

describe("Account", () => {
  it("renders logged-out account UI without Supabase env vars", async () => {
    render(
      <AuthProvider>
        <Account />
      </AuthProvider>
    );

    expect(await screen.findByText("Accounts are not configured locally")).toBeInTheDocument();
    expect(screen.getByText("Logged out")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });
});
