import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../store/useAppStore";
import { KqlGym } from "./KqlGym";

describe("KqlGym", () => {
  beforeEach(() => {
    useAppStore.setState({
      attempts: [],
      recordAttempt: async (attempt) => {
        useAppStore.setState((state) => ({ attempts: [...state.attempts, attempt] }));
      }
    });
  });

  it("shows the demo warning and hides explanations until completion", async () => {
    render(<KqlGym />);

    expect(screen.getByText(/Demo practice bank/i)).toBeInTheDocument();
    expect(screen.queryByText(/Location filtering isolates/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Location !in/i }));
    expect(screen.queryByText(/Location filtering isolates/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Finish now/i }));

    await waitFor(() => {
      expect(screen.getByText(/Location filtering isolates/i)).toBeInTheDocument();
    });
  });
});
