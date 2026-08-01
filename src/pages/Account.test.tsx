import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../hooks/useAuth";
import { AuthPage } from "./AuthPage";

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
});
