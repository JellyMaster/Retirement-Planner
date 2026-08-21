import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { DrawdownAssumptionsPanel } from "./DrawdownAssumptionsPanel";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 60,
  endAge: 95,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 35_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 68,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0.025,
  taxFreeCash: 25_000,
};

describe("DrawdownAssumptionsPanel", () => {
  it("groups the calculation inputs into educational sections", () => {
    render(<DrawdownAssumptionsPanel inputs={inputs} displayMode="today" />);

    expect(screen.getByText("Your retirement plan")).toBeInTheDocument();
    expect(screen.getByText("Investment assumptions")).toBeInTheDocument();
    expect(screen.getByText("Tax assumptions")).toBeInTheDocument();
    expect(screen.getByText("Understanding the illustration")).toBeInTheDocument();
    expect(screen.getByText("How to read the results")).toBeInTheDocument();
  });

  it("explains the assumptions in plain English", () => {
    render(<DrawdownAssumptionsPanel inputs={inputs} displayMode="today" />);

    expect(screen.getByText("Expected investment return")).toBeInTheDocument();
    expect(screen.getByText(/Actual investment returns will vary from year to year/i)).toBeInTheDocument();
    expect(screen.getByText("Today’s money")).toBeInTheDocument();
    expect(screen.getByText("Future money")).toBeInTheDocument();
    expect(screen.getByText("Illustration, not prediction")).toBeInTheDocument();
  });

  it("keeps the technical calculation order as an optional reference", () => {
    render(<DrawdownAssumptionsPanel inputs={inputs} displayMode="today" />);

    const reference = screen.getByText("See how each retirement year is calculated").closest("details");
    expect(reference).not.toHaveAttribute("open");
    expect(screen.getByText(/educational retirement illustration, not a guarantee or personal financial advice/i)).toBeInTheDocument();
  });
});
