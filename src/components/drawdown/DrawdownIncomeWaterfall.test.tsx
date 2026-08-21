import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { DrawdownIncomeWaterfall } from "./DrawdownIncomeWaterfall";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 65,
  endAge: 68,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 40_000,
  incomeTargetMode: "net",
  annualStatePension: 11_500,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.0025,
  inflationRate: 0,
  taxFreeCash: 0,
};

const result: DrawdownResult = {
  startingBalance: 500_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 0,
  balanceAfterTaxFreeCash: 500_000,
  years: [
    createYear(1, 65, 40_000, 40_000, 0, 2_000, 40_000, 0),
    createYear(2, 66, 40_000, 40_000, 0, 2_000, 40_000, 0),
    createYear(3, 67, 40_000, 28_500, 11_500, 1_500, 40_000, 500),
  ],
  finalBalance: 410_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: 67,
  totalDesiredIncome: 120_000,
  totalStatePensionIncome: 11_500,
  totalPensionWithdrawals: 108_500,
  totalGrossIncome: 120_000,
  totalIncomeTax: 5_500,
  totalNetIncome: 119_500,
  totalNetIncomeShortfall: 500,
  averageEffectiveTaxRate: 0.0458,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 50_000,
  totalFees: 3_000,
};

describe("DrawdownIncomeWaterfall", () => {
  it("shows the transition from private pension to State Pension in plain language", () => {
    render(
      <DrawdownIncomeWaterfall
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("How your retirement is funded")).toBeInTheDocument();
    expect(screen.getByText("Age 65")).toBeInTheDocument();
    expect(screen.getByText("Age 67")).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        "At age 67, £28,500 comes from the private pension and £11,500 from State Pension.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Below your plan by £500")).toBeInTheDocument();
    expect(screen.getAllByText("Available to spend").length).toBeGreaterThan(0);
  });

  it("explains how State Pension changes the private-pension withdrawal", () => {
    render(
      <DrawdownIncomeWaterfall
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    const milestone = screen.getByLabelText(
      "How State Pension changes your retirement income mix",
    );

    expect(milestone).toHaveTextContent("Your State Pension starts at age 67");
    expect(milestone).toHaveTextContent("£11,500/year");
    expect(milestone).toHaveTextContent("£40,000");
    expect(milestone).toHaveTextContent("£28,500/year");
    expect(milestone).toHaveTextContent("comes from the Government");
  });

  it("does not show a State Pension milestone when the plan has no State Pension", () => {
    const noStatePensionResult: DrawdownResult = {
      ...result,
      years: result.years.map((year) => ({
        ...year,
        statePensionIncome: 0,
      })),
    };

    render(
      <DrawdownIncomeWaterfall
        inputs={{ ...inputs, annualStatePension: 0 }}
        result={noStatePensionResult}
        displayMode="nominal"
      />,
    );

    expect(
      screen.queryByLabelText("How State Pension changes your retirement income mix"),
    ).not.toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  desiredIncome: number,
  pensionWithdrawal: number,
  statePensionIncome: number,
  incomeTax: number,
  netIncome: number,
  netIncomeShortfall: number,
) {
  return {
    year,
    age,
    openingBalance: 500_000 - year * 20_000,
    desiredIncome,
    incomeTargetMode: "net" as const,
    statePensionIncome,
    requiredPensionWithdrawal: pensionWithdrawal,
    pensionWithdrawal,
    grossIncome: pensionWithdrawal + statePensionIncome,
    taxableIncome: 20_000,
    personalAllowance: 12_570,
    incomeTax,
    netIncome,
    effectiveTaxRate: 0.05,
    netIncomeShortfall,
    incomeShortfall: 0,
    investmentGrowth: 15_000,
    fees: 1_000,
    closingBalance: 500_000 - year * 30_000,
    isDepleted: false,
  };
}
