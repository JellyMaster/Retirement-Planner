import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownBalanceChart } from "./DrawdownBalanceChart";

const year: DrawdownYear = {
  year: 2040,
  age: 60,
  openingBalance: 100_000,
  desiredIncome: 5_000,
  incomeTargetMode: "net",
  statePensionIncome: 0,
  requiredPensionWithdrawal: 5_000,
  pensionWithdrawal: 5_000,
  grossIncome: 5_000,
  taxableIncome: 5_000,
  personalAllowance: 12_570,
  incomeTax: 0,
  netIncome: 5_000,
  effectiveTaxRate: 0,
  netIncomeShortfall: 0,
  incomeShortfall: 0,
  investmentGrowth: 10_000,
  fees: 1_000,
  closingBalance: 104_000,
  isDepleted: false,
};

describe("DrawdownBalanceChart", () => {
  it("shows the inflation effect needed to reconcile a year in today's money", () => {
    render(
      <DrawdownBalanceChart
        years={[year]}
        depletionAge={null}
        inflationRate={0.04}
        displayMode="today"
        selectedAge={60}
      />,
    );

    expect(screen.getByText("− Effect of inflation")).toBeInTheDocument();
    expect(screen.getByText("−£4,000")).toBeInTheDocument();
    expect(screen.getAllByText("£100,000")).toHaveLength(2);
    expect(
      screen.getByText(/Today's money removes the effect of inflation/i),
    ).toBeInTheDocument();
  });

  it("does not add an inflation step in future money", () => {
    render(
      <DrawdownBalanceChart
        years={[year]}
        depletionAge={null}
        inflationRate={0.04}
        displayMode="nominal"
        selectedAge={60}
      />,
    );

    expect(screen.queryByText(/Effect of inflation/i)).not.toBeInTheDocument();
    expect(screen.getByText("£104,000")).toBeInTheDocument();
  });

  it("adds withdrawal-rate, growth-coverage and balance-trend context", () => {
    render(
      <DrawdownBalanceChart
        years={[year]}
        depletionAge={null}
        inflationRate={0.04}
        displayMode="nominal"
        selectedAge={60}
      />,
    );

    expect(screen.getByText("5.0% of opening pension")).toBeInTheDocument();
    expect(
      screen.getByText("166.67% of withdrawals and fees covered"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Balance trend: up 4.0%"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your pension finished the year higher than it started."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Investment growth covered 166.67% of the money taken out and fees this year.",
      ),
    ).toBeInTheDocument();
  });
});
