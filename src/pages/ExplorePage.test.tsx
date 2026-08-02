import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithAppProviders } from "../test/renderWithAppProviders";
import { ExplorePage } from "./ExplorePage";

function renderPage() {
  return renderWithAppProviders(<ExplorePage />);
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
    ).toHaveAttribute("href", "/what-if?experiment=retirement-age");

    const nextStepHeading = screen.getByRole("heading", {
      name: "Turn understanding into a decision",
    });
    const nextStepSection = nextStepHeading.closest("section");
    expect(nextStepSection).not.toBeNull();
    expect(
      within(nextStepSection as HTMLElement).getByRole("link", {
        name: "Review Drawdown",
      }),
    ).toHaveAttribute("href", "/drawdown?tab=overview");

    await user.click(screen.getByText("Gross versus net income"));
    expect(
      screen.getByText(/A gross target describes total taxable income/i),
    ).toBeVisible();
  });
});
