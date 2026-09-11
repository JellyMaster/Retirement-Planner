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

  it("keeps retirement impact details out of simple view and shows them in detailed view", () => {
    const baseline = {
      targetNetSpending: 30_000,
      sustainableNetSpending: 28_000,
      annualHeadroom: -2_000,
      headroomPercent: -2_000 / 30_000,
      status: "shortfall" as const,
      targetEndingBalance: 100_000,
      modelledEndingBalance: 100_000,
      livingStandard: "minimum" as const,
      includesStatePension: true,
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
      includesStatePension: true,
    };

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

    expect(screen.queryByText("Retirement impact details")).not.toBeInTheDocument();

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

    expect(screen.getByRole("heading", { name: "Retirement impact details" })).toBeInTheDocument();
  });

  it("assesses a retirement-age change against the saved plan assumptions", () => {
    const baseline = {
      targetNetSpending: 45_400,
      sustainableNetSpending: 44_685,
      annualHeadroom: -715,
      headroomPercent: -715 / 45_400,
      status: "shortfall" as const,
      targetEndingBalance: 966_983,
      modelledEndingBalance: 967_046,
      livingStandard: "moderate" as const,
      includesStatePension: true,
    };
    const outcome = {
      ...baseline,
      sustainableNetSpending: 45_081,
    };

    renderInsights({
      activeExperiment: "retirement-age",
      baselineRetirementAge: 68,
      retirementAge: 66,
      planningAge: 90,
      statePensionAge: 68,
      baselineAnnualIncome: 44_685,
      annualIncome: 45_081,
      baselineProjectedPension: 966_983,
      projectedPension: 900_000,
      baselineRetirementOutcome: baseline,
      retirementOutcome: outcome,
      hasChanged: true,
    });

    expect(
      screen.getByRole("heading", { name: "Could retiring at 66 support your plan?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your income target")).toBeInTheDocument();
    expect(screen.getByText("Estimated supportable retirement income")).toBeInTheDocument();
    expect(screen.getByText("£45,400/year")).toBeInTheDocument();
    expect(screen.getByText("£45,081/year")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your target income may not be fully supported" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/State Pension is included in this assessment from age 68/i)).toBeInTheDocument();
    expect(screen.queryByText("Retirement impact details")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /see the financial details/i }));

    expect(screen.getByRole("heading", { name: "Retirement impact details" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Could retiring at 66 support your plan?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sustainable retirement income")).toBeInTheDocument();
  });
});
