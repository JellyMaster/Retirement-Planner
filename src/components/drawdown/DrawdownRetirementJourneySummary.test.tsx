import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownRetirementJourneySummary } from "./DrawdownRetirementJourneySummary";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 60,
  endAge: 90,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 35_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0.025,
  taxFreeCash: 0,
  spendingPhases: [
    { startAge: 60, annualIncome: 35_000, label: "Active retirement" },
    { startAge: 75, annualIncome: 30_000, label: "Settled retirement" },
  ],
};

const years: DrawdownYear[] = [
  createYear(1, 60, 500_000, 490_000),
  createYear(8, 67, 430_000, 420_000, { statePensionIncome: 12_000 }),
  createYear(16, 75, 360_000, 350_000),
  createYear(31, 90, 200_000, 180_000),
];

const result: DrawdownResult = {
  startingBalance: 500_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 0,
  balanceAfterTaxFreeCash: 500_000,
  years,
  finalBalance: 180_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: null,
  totalDesiredIncome: 1_085_000,
  totalStatePensionIncome: 288_000,
  totalPensionWithdrawals: 797_000,
  totalGrossIncome: 1_085_000,
  totalIncomeTax: 100_000,
  totalNetIncome: 985_000,
  totalNetIncomeShortfall: 0,
  averageEffectiveTaxRate: 0.1,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 400_000,
  totalFees: 70_000,
};

describe("DrawdownRetirementJourneySummary", () => {
  it("keeps the milestone path as the main retirement story", () => {
    render(<DrawdownRetirementJourneySummary inputs={inputs} result={result} />);

    expect(screen.getByText("The important moments in your retirement")).toBeInTheDocument();
    expect(screen.getByText("Your retirement begins")).toBeInTheDocument();
    expect(screen.getByText("Your State Pension begins")).toBeInTheDocument();
    expect(screen.getByText("Your planned spending changes")).toBeInTheDocument();
    expect(screen.getByText("Your planning period ends")).toBeInTheDocument();
  });

  it("uses four compact key answers without duplicating the spending milestone", () => {
    render(<DrawdownRetirementJourneySummary inputs={inputs} result={result} />);

    expect(screen.getByText("Retirement starts")).toBeInTheDocument();
    expect(screen.getByText("State Pension starts")).toBeInTheDocument();
    expect(screen.getByText("Private pension lasts")).toBeInTheDocument();
    expect(screen.getByText("Planned income")).toBeInTheDocument();
    expect(screen.queryByText("When does planned spending first change?")).not.toBeInTheDocument();
    expect(screen.queryByText(/depletion/i)).not.toBeInTheDocument();
  });

  it("finishes with a quiet educational explanation of the journey", () => {
    render(<DrawdownRetirementJourneySummary inputs={inputs} result={result} />);

    expect(
      screen.getByText(/This journey highlights the key moments where your income or pension changes/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("What does this journey tell you?")).not.toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  openingBalance: number,
  closingBalance: number,
  overrides: Partial<DrawdownYear> = {},
): DrawdownYear {
  return {
    year,
    age,
    openingBalance,
    desiredIncome: 35_000,
    incomeTargetMode: "net",
    statePensionIncome: 0,
    requiredPensionWithdrawal: 35_000,
    pensionWithdrawal: 35_000,
    grossIncome: 35_000,
    taxableIncome: 22_430,
    personalAllowance: 12_570,
    incomeTax: 4_486,
    netIncome: 30_514,
    effectiveTaxRate: 0.128,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: closingBalance - openingBalance + 35_000,
    fees: 0,
    closingBalance,
    isDepleted: false,
    ...overrides,
  };
}
