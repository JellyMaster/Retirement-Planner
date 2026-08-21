import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownBalanceYearTable } from "./DrawdownBalanceYearTable";

const years: DrawdownYear[] = [
  createYear(1, 60, 100_000, 10_000, 5_000, 1_000, 104_000),
  createYear(2, 61, 104_000, 5_000, 8_000, 1_000, 100_000),
];

describe("DrawdownBalanceYearTable", () => {
  it("marks the currently selected year with the same eye indicator used by the income table", () => {
    render(
      <DrawdownBalanceYearTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
        selectedAge={61}
      />,
    );

    expect(screen.getByLabelText("Currently selected year")).toBeInTheDocument();
    expect(screen.getByText(/The eye marks the year currently selected/i)).toBeInTheDocument();
  });

  it("shows both the cash change and percentage change for each year", () => {
    render(
      <DrawdownBalanceYearTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
        selectedAge={60}
      />,
    );

    expect(screen.getByText("+£4,000")).toBeInTheDocument();
    expect(screen.getByText("↑ 4.0%")).toBeInTheDocument();
    expect(screen.getByText("−£4,000")).toBeInTheDocument();
    expect(screen.getByText("↓ 3.85%")).toBeInTheDocument();
  });
});

function createYear(
  year: number,
  age: number,
  openingBalance: number,
  investmentGrowth: number,
  pensionWithdrawal: number,
  fees: number,
  closingBalance: number,
): DrawdownYear {
  return {
    year,
    age,
    openingBalance,
    desiredIncome: pensionWithdrawal,
    incomeTargetMode: "net",
    statePensionIncome: 0,
    requiredPensionWithdrawal: pensionWithdrawal,
    pensionWithdrawal,
    grossIncome: pensionWithdrawal,
    taxableIncome: pensionWithdrawal,
    personalAllowance: 12_570,
    incomeTax: 0,
    netIncome: pensionWithdrawal,
    effectiveTaxRate: 0,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth,
    fees,
    closingBalance,
    isDepleted: false,
  };
}
