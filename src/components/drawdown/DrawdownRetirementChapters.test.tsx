import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownRetirementChapters } from "./DrawdownRetirementChapters";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 65,
  endAge: 67,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0,
  taxFreeCash: 0,
};

const years: DrawdownYear[] = [
  createYear(1, 65, 30_000, 0, 2_000, 28_000, 470_000),
  createYear(2, 66, 30_000, 0, 2_500, 27_500, 440_000),
  createYear(3, 67, 18_000, 12_000, 3_000, 27_000, 420_000),
];

const result: DrawdownResult = {
  startingBalance: 500_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 0,
  balanceAfterTaxFreeCash: 500_000,
  years,
  finalBalance: 420_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: null,
  totalDesiredIncome: 90_000,
  totalStatePensionIncome: 12_000,
  totalPensionWithdrawals: 78_000,
  totalGrossIncome: 90_000,
  totalIncomeTax: 7_500,
  totalNetIncome: 82_500,
  totalNetIncomeShortfall: 0,
  averageEffectiveTaxRate: 7_500 / 90_000,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 20_000,
  totalFees: 4_000,
};

describe("DrawdownRetirementChapters", () => {
  it("summarises retirement income using educational questions", () => {
    render(
      <DrawdownRetirementChapters
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(
      screen.getByText("The key answers behind your retirement income"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Will your planned income be available throughout retirement?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Yes, throughout the plan")).toBeInTheDocument();
    expect(screen.getByText("When does State Pension begin helping?")).toBeInTheDocument();
    expect(screen.getByText("When is estimated tax highest?")).toBeInTheDocument();
    expect(
      screen.getByText("How much money is available to spend on average?"),
    ).toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  pensionWithdrawal: number,
  statePensionIncome: number,
  incomeTax: number,
  netIncome: number,
  closingBalance: number,
): DrawdownYear {
  return {
    year,
    age,
    openingBalance: closingBalance + pensionWithdrawal,
    desiredIncome: 30_000,
    incomeTargetMode: "net",
    statePensionIncome,
    requiredPensionWithdrawal: pensionWithdrawal,
    pensionWithdrawal,
    grossIncome: pensionWithdrawal + statePensionIncome,
    taxableIncome: 20_000,
    personalAllowance: 12_570,
    incomeTax,
    netIncome,
    effectiveTaxRate: 0.08,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: 10_000,
    fees: 1_000,
    closingBalance,
    isDepleted: false,
  };
}
