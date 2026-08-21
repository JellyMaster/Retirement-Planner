import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownBalanceStory } from "./DrawdownBalanceStory";

const inputs: DrawdownInputs = {
  startingBalance: 100_000,
  retirementAge: 65,
  endAge: 67,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 20_000,
  incomeTargetMode: "net",
  annualStatePension: 0,
  statePensionAge: 67,
  annualReturn: 0.04,
  annualFee: 0.005,
  inflationRate: 0,
  taxFreeCash: 0,
};

const years: DrawdownYear[] = [
  createYear(1, 65, 100_000, 90_000),
  createYear(2, 66, 90_000, 70_000),
  createYear(3, 67, 70_000, 50_000),
];

const result: DrawdownResult = {
  startingBalance: 100_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 0,
  balanceAfterTaxFreeCash: 100_000,
  years,
  finalBalance: 50_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: null,
  totalDesiredIncome: 60_000,
  totalStatePensionIncome: 0,
  totalPensionWithdrawals: 60_000,
  totalGrossIncome: 60_000,
  totalIncomeTax: 0,
  totalNetIncome: 60_000,
  totalNetIncomeShortfall: 0,
  averageEffectiveTaxRate: 0,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 10_000,
  totalFees: 0,
};

const legacyDrawdown: ScenarioDrawdownPreferences = {
  planningAge: 67,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 20_000,
  incomeTargetMode: "net",
  taxFreeCash: 0,
  endingBalanceMode: "percentage",
  endingBalancePercentage: 0.8,
};

describe("DrawdownBalanceStory", () => {
  it("summarises the balance story without referring to a chart", () => {
    render(
      <DrawdownBalanceStory
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("Understanding your pension balance")).toBeInTheDocument();
    expect(
      screen.getByText(/These key answers summarise what the balance story means for your retirement/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/balance chart/i)).not.toBeInTheDocument();
  });

  it("explains the pension remaining at the end of the plan", () => {
    render(
      <DrawdownBalanceStory
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("Will your pension last?")).toBeInTheDocument();
    expect(
      screen.getByText("50.0% of the pension available at retirement remains at age 67."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reached at age 67, at the end of the plan."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Target reserve")).not.toBeInTheDocument();
    expect(screen.queryByText(/Projected reserve/i)).not.toBeInTheDocument();
  });

  it("ignores legacy ending-balance preferences on the balance screen", () => {
    render(
      <DrawdownBalanceStory
        inputs={inputs}
        result={result}
        displayMode="nominal"
        drawdown={legacyDrawdown}
      />,
    );

    expect(screen.queryByText(/reserve/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/amount you chose to keep/i)).not.toBeInTheDocument();
  });

  it("adds educational context to the first falling year", () => {
    render(
      <DrawdownBalanceStory
        inputs={inputs}
        result={result}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("Age 65")).toBeInTheDocument();
    expect(
      screen.getByText(/A falling balance can be a normal part of funding retirement/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A reducing pension isn't necessarily a problem."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/continue providing the income you've planned for the whole period you're planning for/i),
    ).toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  openingBalance: number,
  closingBalance: number,
): DrawdownYear {
  return {
    year,
    age,
    openingBalance,
    desiredIncome: 20_000,
    incomeTargetMode: "net",
    statePensionIncome: 0,
    requiredPensionWithdrawal: 20_000,
    pensionWithdrawal: 20_000,
    grossIncome: 20_000,
    taxableIncome: 7_430,
    personalAllowance: 12_570,
    incomeTax: 0,
    netIncome: 20_000,
    effectiveTaxRate: 0,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: closingBalance - openingBalance + 20_000,
    fees: 0,
    closingBalance,
    isDepleted: false,
  };
}
