import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { DrawdownRetirementJourney } from "./DrawdownRetirementJourney";

const inputs: DrawdownInputs = {
  startingBalance: 600_000,
  retirementAge: 65,
  endAge: 95,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 40_000,
  incomeTargetMode: "net",
  annualStatePension: 11_500,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.0025,
  inflationRate: 0.02,
  taxFreeCash: 100_000,
  spendingPhases: [
    { startAge: 65, annualIncome: 40_000, label: "Active years" },
    { startAge: 75, annualIncome: 34_000, label: "Slower years" },
    { startAge: 85, annualIncome: 28_000, label: "Later life" },
  ],
};

const result: DrawdownResult = {
  startingBalance: 600_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 100_000,
  balanceAfterTaxFreeCash: 500_000,
  years: [
    createYear(1, 65, 500_000, 40_000, 38_000, 480_000, 0),
    createYear(2, 66, 480_000, 40_000, 37_000, 458_000, 0),
    createYear(3, 67, 458_000, 40_000, 25_500, 445_000, 11_500),
    createYear(11, 75, 390_000, 34_000, 20_000, 385_000, 11_500),
    createYear(21, 85, 310_000, 28_000, 14_000, 305_000, 11_500),
    createYear(30, 94, 230_000, 28_000, 14_000, 225_000, 11_500),
  ],
  finalBalance: 225_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: null,
  totalDesiredIncome: 1_020_000,
  totalStatePensionIncome: 322_000,
  totalPensionWithdrawals: 698_000,
  totalGrossIncome: 1_080_000,
  totalIncomeTax: 60_000,
  totalNetIncome: 1_020_000,
  totalNetIncomeShortfall: 0,
  averageEffectiveTaxRate: 0.0556,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 420_000,
  totalFees: 75_000,
};

describe("DrawdownRetirementJourney", () => {
  it("tells the retirement story using the important plan events", () => {
    render(
      <DrawdownRetirementJourney
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "What retirement could look like" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Retirement begins" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "State Pension begins" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Slower years" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Later life" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Planning horizon" })).toBeInTheDocument();
    expect(screen.getAllByText("Strong")).not.toHaveLength(0);
    expect(
      screen.getByLabelText("5 out of 5 retirement health rating"),
    ).toBeInTheDocument();
    expect(screen.getByText("Largest pension withdrawal")).toBeInTheDocument();
  });

  it("surfaces the first income shortfall as a warning event", () => {
    render(
      <DrawdownRetirementJourney
        inputs={inputs}
        result={{
          ...result,
          firstNetIncomeShortfallAge: 88,
          depletionAge: 90,
        }}
        displayMode="nominal"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Income shortfall begins" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Needs attention")).not.toHaveLength(0);
    expect(
      screen.getByLabelText("2 out of 5 retirement health rating"),
    ).toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  openingBalance: number,
  desiredIncome: number,
  pensionWithdrawal: number,
  closingBalance: number,
  statePensionIncome: number,
) {
  return {
    year,
    age,
    openingBalance,
    desiredIncome,
    incomeTargetMode: "net" as const,
    statePensionIncome,
    requiredPensionWithdrawal: pensionWithdrawal,
    pensionWithdrawal,
    grossIncome: desiredIncome + 2_000,
    taxableIncome: desiredIncome - 10_000,
    personalAllowance: 12_570,
    incomeTax: 2_000,
    netIncome: desiredIncome,
    effectiveTaxRate: 0.05,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: 20_000,
    fees: 1_000,
    closingBalance,
    isDepleted: false,
  };
}
