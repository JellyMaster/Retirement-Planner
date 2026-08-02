import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { ScenarioProvider } from "../components/scenarios";
import { ExplorePage } from "./ExplorePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <ScenarioProvider>
        <ExplorePage />
      </ScenarioProvider>
    </MemoryRouter>,
  );
}

describe("ExplorePage", () => {
  it("presents personalised learning, risk demonstrations and essentials", async () => {
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
      screen.getByRole("heading", { name: "Demonstrate what averages can hide" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Next to build")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Explore retirement age" }),
    ).toHaveAttribute("href", "/what-if");
    expect(
      screen.getByRole("link", { name: "Review drawdown" }),
    ).toHaveAttribute("href", "/drawdown");

    await user.click(screen.getByText("Gross versus net income"));
    expect(
      screen.getByText(/A gross target describes total taxable income/i),
    ).toBeVisible();
  });
});
