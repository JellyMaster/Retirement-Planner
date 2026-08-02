import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithProviders } from "../test/renderWithProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/plan");
  });

  it("presents one guided editor and a live plan snapshot", () => {
    renderWithProviders(<RetirementPlannerPage />);

    expect(
      screen.getByRole("heading", { name: "Build your retirement plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Edit retirement plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your pension details" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your plan at a glance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Your saved choices" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Illustrated outcome" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Time to retirement")).toBeInTheDocument();
    expect(screen.getByText("Monthly contributions")).toBeInTheDocument();
    expect(screen.getByText("Projected pension")).toBeInTheDocument();
    expect(screen.getByText("Estimated annual income")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "View overview" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Explore a What If?" }),
    ).toHaveAttribute("href", "/what-if?experiment=retirement-age");
    expect(screen.getByRole("link", { name: "Review drawdown" })).toHaveAttribute(
      "href",
      "/drawdown?tab=overview",
    );

    expect(
      screen.queryByRole("navigation", { name: /retirement planning workspace/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /how uncertain is the outcome/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /recommended actions/i }),
    ).not.toBeInTheDocument();
  });

  it("shows validation guidance instead of the live metrics", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RetirementPlannerPage />);

    const currentAgeInput = screen.getByRole("spinbutton", {
      name: /current age/i,
    });
    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "10");

    expect(
      screen.getByText(/current age must be between 18 and 100/i),
    ).toBeInTheDocument();
    expect(screen.getByText("The plan needs attention")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Your saved choices" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Illustrated outcome" }),
    ).not.toBeInTheDocument();
  });
});
