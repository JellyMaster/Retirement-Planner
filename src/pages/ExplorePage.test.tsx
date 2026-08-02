import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { ScenarioProvider } from "../components/scenarios";
import { ThemeProvider } from "../theme/ThemeProvider";
import { ExplorePage } from "./ExplorePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <ScenarioProvider>
          <ExplorePage />
        </ScenarioProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("ExplorePage", () => {
  it("presents personalised learning, the live risk lesson and essentials", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Understand the decisions behind your retirement",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Topics worth understanding now" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Same returns. Different retirement outcome.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "One-year market fall" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Demonstrate what averages can hide" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Explore retirement age" }),
    ).toHaveAttribute("href", "/what-if");
    expect(
      screen.getByRole("link", { name: "Review Drawdown" }),
    ).toHaveAttribute("href", "/drawdown");

    await user.click(screen.getByText("Gross versus net income"));
    expect(
      screen.getByText(/A gross target describes total taxable income/i),
    ).toBeVisible();
  });
});
