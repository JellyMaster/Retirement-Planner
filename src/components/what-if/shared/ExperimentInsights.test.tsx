import { render, screen } from "@testing-library/react";
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
  it("shows the decision summary and before-after result", () => {
    renderInsights();

    expect(
      screen.getByRole("heading", { name: "Would lower fees matter?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("£725,000")).toBeInTheDocument();
    expect(screen.getByText("£29,000/year")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "More flexibility" })).toBeInTheDocument();
    expect(screen.getByText("+£25,000")).toBeInTheDocument();
    expect(screen.getByText("+£1,000/year")).toBeInTheDocument();
  });

  it("shows the saved-plan state before an experiment changes", () => {
    renderInsights({ hasChanged: false, projectedPension: 700_000, annualIncome: 28_000 });

    expect(screen.getByRole("heading", { name: "Your saved plan" })).toBeInTheDocument();
    expect(
      screen.getByText("Move an experiment control to compare it with the saved plan."),
    ).toBeInTheDocument();
  });

  it("shows retirement impact details when drawdown outcomes are supplied", () => {
    const baseline = {
      status: "tight" as const,
      sustainableNetSpending: 28_000,
      annualHeadroom: -2_000,
      modelledEndingBalance: 100_000,
      targetEndingBalance: 100_000,
      livingStandard: "minimum" as const,
    };
    const outcome = {
      status: "comfortable" as const,
      sustainableNetSpending: 30_000,
      annualHeadroom: 500,
      modelledEndingBalance: 110_000,
      targetEndingBalance: 100_000,
      livingStandard: "moderate" as const,
    };

    renderInsights({ baselineRetirementOutcome: baseline, retirementOutcome: outcome });

    expect(screen.getByText("See retirement impact details")).toBeInTheDocument();
  });
});
