import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setWhatIfViewMode } from "../whatIfDisplaySettings";
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
  beforeEach(() => {
    setWhatIfViewMode("simple");
  });

  it("shows the decision summary and before-after result", () => {
    renderInsights();

    expect(
      screen.getByRole("heading", { name: "Would lower fees matter?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("£725,000")).toBeInTheDocument();
    expect(screen.getByText("£29,000/year")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "More flexibility" })).toBeInTheDocument();
    expect(screen.getByText(/\+£25,000/)).toBeInTheDocument();
    expect(screen.getByText(/\+£1,000\/year/)).toBeInTheDocument();
  });

  it("shows the no-change state before an experiment changes", () => {
    renderInsights({ hasChanged: false, projectedPension: 700_000, annualIncome: 28_000 });

    expect(screen.getByRole("status")).toHaveTextContent("No change yet");
    expect(
      screen.getByText("Move an experiment control to compare it with the saved plan."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Move the experiment control to see how it affects your pension and retirement income.",
      ),
    ).toBeInTheDocument();
  });

  it("shows retirement impact details when drawdown outcomes are supplied", () => {
    const baseline = {
      targetNetSpending: 30_000,
      sustainableNetSpending: 28_000,
      annualHeadroom: -2_000,
      headroomPercent: -2_000 / 30_000,
      status: "shortfall" as const,
      targetEndingBalance: 100_000,
      modelledEndingBalance: 100_000,
      livingStandard: "minimum" as const,
    };
    const outcome = {
      targetNetSpending: 29_500,
      sustainableNetSpending: 33_000,
      annualHeadroom: 3_500,
      headroomPercent: 3_500 / 29_500,
      status: "comfortable" as const,
      targetEndingBalance: 100_000,
      modelledEndingBalance: 110_000,
      livingStandard: "moderate" as const,
    };

    renderInsights({ baselineRetirementOutcome: baseline, retirementOutcome: outcome });

    expect(screen.getByText("Retirement impact details")).toBeInTheDocument();
  });

  it("explains a retirement-age change in plain English and opens detailed view", () => {
    const baseline = {
      targetNetSpending: 45_400,
      sustainableNetSpending: 44_685,
      annualHeadroom: -715,
      headroomPercent: -715 / 45_400,
      status: "shortfall" as const,
      targetEndingBalance: 966_983,
      modelledEndingBalance: 967_046,
      livingStandard: "moderate" as const,
    };
    const outcome = {
      ...baseline,
      targetNetSpending: 45_400,
    };

    renderInsights({
      activeExperiment: "retirement-age",
      baselineRetirementAge: 68,
      retirementAge: 66,
      planningAge: 90,
      statePensionAge: 68,
      baselineAnnualIncome: 49_379,
      annualIncome: 45_081,
      baselineProjectedPension: 966_983,
      projectedPension: 900_000,
      baselineRetirementOutcome: baseline,
      retirementOutcome: outcome,
      hasChanged: true,
    });

    expect(
      screen.getByRole("heading", { name: "What happens if I retire at 66?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 years earlier than your saved plan \(68\)/i)).toBeInTheDocument();
    expect(screen.getByText("£319/year")).toBeInTheDocument();
    expect(screen.getByText("2 years", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your income target would not be met" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/modelled through to age 90/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /see the financial details/i }));

    expect(screen.getByText("Retirement impact details")).toBeInTheDocument();
    expect(screen.getByText("Pension at retirement")).toBeInTheDocument();
  });
});
