import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RetirementSpendingOutcome } from "../../../engine/drawdown/createRetirementSpendingOutcome";
import { setWhatIfViewMode } from "../whatIfDisplaySettings";
import { ExperimentInsights } from "./ExperimentInsights";

function createRetirementOutcome(
  overrides: Partial<RetirementSpendingOutcome> = {},
): RetirementSpendingOutcome {
  return {
    targetNetSpending: 30_000,
    sustainableNetSpending: 28_000,
    annualHeadroom: -2_000,
    headroomPercent: -2_000 / 30_000,
    status: "shortfall",
    targetEndingBalance: 100_000,
    modelledEndingBalance: 100_000,
    livingStandard: "minimum",
    includesStatePension: true,
    savedPlanSupportsTarget: false,
    savedPlanFirstNetIncomeShortfallAge: 80,
    savedPlanDepletionAge: 80,
    savedPlanEndingBalance: 0,
    ...overrides,
  };
}

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

  it("keeps retirement impact details out of simple view and shows them in detailed view", () => {
    const baseline = createRetirementOutcome();
    const outcome = createRetirementOutcome({
      targetNetSpending: 29_500,
      sustainableNetSpending: 33_000,
      annualHeadroom: 3_500,
      headroomPercent: 3_500 / 29_500,
      status: "comfortable",
      modelledEndingBalance: 110_000,
      livingStandard: "moderate",
      savedPlanSupportsTarget: true,
      savedPlanFirstNetIncomeShortfallAge: null,
      savedPlanDepletionAge: null,
      savedPlanEndingBalance: 90_000,
    });

    const { rerender } = render(<ExperimentInsights
      activeExperiment="fees"
      baselineProjectedPension={700_000}
      projectedPension={725_000}
      baselineAnnualIncome={28_000}
      annualIncome={29_000}
      baselinePreparedness={93}
      preparedness={97}
      baselineRetirementOutcome={baseline}
      retirementOutcome={outcome}
      currentAge={47}
      retirementAge={65}
      statePensionAge={67}
      extraContributionAge={56}
      hasChanged
      onSelectExperiment={vi.fn()}
    />);

    expect(screen.queryByRole("heading", { name: "Extra financial checks" })).not.toBeInTheDocument();

    setWhatIfViewMode("detailed");
    rerender(<ExperimentInsights
      activeExperiment="fees"
      baselineProjectedPension={700_000}
      projectedPension={725_000}
      baselineAnnualIncome={28_000}
      annualIncome={29_000}
      baselinePreparedness={93}
      preparedness={97}
      baselineRetirementOutcome={baseline}
      retirementOutcome={outcome}
      currentAge={47}
      retirementAge={65}
      statePensionAge={67}
      extraContributionAge={56}
      hasChanged
      onSelectExperiment={vi.fn()}
    />);

    expect(screen.getByRole("heading", { name: "Extra financial checks" })).toBeInTheDocument();
  });

  it("benchmarks a retirement-age change against the saved plan while keeping the ending-balance check separate", () => {
    const baseline = createRetirementOutcome({
      targetNetSpending: 45_400,
      sustainableNetSpending: 44_685,
      annualHeadroom: -715,
      headroomPercent: -715 / 45_400,
      targetEndingBalance: 966_983,
      modelledEndingBalance: 967_046,
      livingStandard: "moderate",
      savedPlanSupportsTarget: true,
      savedPlanFirstNetIncomeShortfallAge: null,
      savedPlanDepletionAge: null,
      savedPlanEndingBalance: 748_820,
    });
    const outcome = createRetirementOutcome({
      targetNetSpending: 45_400,
      sustainableNetSpending: 28_515,
      annualHeadroom: -16_885,
      headroomPercent: -16_885 / 45_400,
      targetEndingBalance: 589_047,
      modelledEndingBalance: 589_103,
      livingStandard: "moderate",
      savedPlanSupportsTarget: false,
      savedPlanFirstNetIncomeShortfallAge: 74,
      savedPlanDepletionAge: 74,
      savedPlanEndingBalance: 0,
    });

    renderInsights({
      activeExperiment: "retirement-age",
      baselineRetirementAge: 68,
      retirementAge: 60,
      planningAge: 90,
      statePensionAge: 68,
      baselineAnnualIncome: 44_685,
      annualIncome: 28_515,
      baselineProjectedPension: 966_983,
      projectedPension: 589_047,
      baselineRetirementOutcome: baseline,
      retirementOutcome: outcome,
      hasChanged: true,
    });

    expect(
      screen.getByRole("heading", { name: "Does retiring at 60 still support your plan?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your retirement income goal")).toBeInTheDocument();
    expect(screen.getByText("Does your income plan last?")).toBeInTheDocument();
    expect(screen.getByText("£45,400/year")).toBeInTheDocument();
    expect(screen.getByText("No — shortfall from age 74")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Your saved plan no longer works through the full planning period",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/State Pension remains included from age 68; only the retirement-age decision has changed/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Extra financial checks" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /see the financial details/i }));

    expect(screen.getByRole("heading", { name: "Extra financial checks" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Does retiring at 60 still support your plan?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Income while keeping your target balance")).toBeInTheDocument();
    expect(screen.getByText("Ending-balance check")).toBeInTheDocument();
  });
});
