import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ExperimentInsights } from "./ExperimentInsights";

function renderInsights(
  overrides: Partial<React.ComponentProps<typeof ExperimentInsights>> = {},
) {
  const props: React.ComponentProps<typeof ExperimentInsights> = {
    activeExperiment: "fees",
    baselineProjectedPension: 700_000,
    projectedPension: 725_000,
    baselineAnnualIncome: 28_000,
    annualIncome: 29_000,
    baselinePreparedness: 93,
    preparedness: 97,
    currentAge: 47,
    retirementAge: 65,
    statePensionAge: 67,
    extraContributionAge: 56,
    hasChanged: true,
    onSelectExperiment: vi.fn(),
    ...overrides,
  };

  render(<ExperimentInsights {...props} />);
  return props;
}

describe("ExperimentInsights", () => {
  it("shows a consistent decision summary and plan health", () => {
    renderInsights();

    expect(
      screen.getByRole("heading", { name: "Would lower fees matter?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("£725,000")).toBeInTheDocument();
    expect(screen.getByText("£29,000/year")).toBeInTheDocument();
    expect(screen.getAllByText("Close").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("meter", { name: "Impact of this decision" }),
    ).toHaveAttribute("aria-valuetext");
  });

  it("shows the plan timeline", () => {
    renderInsights({ downturnAge: 60, activeExperiment: "market-downturn" });

    expect(screen.getByLabelText("Experiment timeline")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Extra saving")).toBeInTheDocument();
    expect(screen.getByText("Market fall")).toBeInTheDocument();
    expect(screen.getByText("Retire")).toBeInTheDocument();
    expect(screen.getByText("State Pension")).toBeInTheDocument();
  });

  it("opens the recommended next experiment", async () => {
    const user = userEvent.setup();
    const onSelectExperiment = vi.fn();
    renderInsights({ onSelectExperiment });

    await user.click(
      screen.getByRole("button", { name: "Open experiment" }),
    );

    expect(onSelectExperiment).toHaveBeenCalledWith("returns");
  });
});
