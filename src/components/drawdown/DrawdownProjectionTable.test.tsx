import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownProjectionTable } from "./DrawdownProjectionTable";

const years: DrawdownYear[] = [
  {
    year: 2040,
    age: 60,
    openingBalance: 500_000,
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
    investmentGrowth: 25_000,
    fees: 2_500,
    closingBalance: 487_500,
    isDepleted: false,
  },
  {
    year: 2047,
    age: 67,
    openingBalance: 430_000,
    desiredIncome: 35_000,
    incomeTargetMode: "net",
    statePensionIncome: 12_000,
    requiredPensionWithdrawal: 23_000,
    pensionWithdrawal: 23_000,
    grossIncome: 35_000,
    taxableIncome: 22_430,
    personalAllowance: 12_570,
    incomeTax: 4_486,
    netIncome: 30_514,
    effectiveTaxRate: 0.128,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: 21_500,
    fees: 2_150,
    closingBalance: 426_350,
    isDepleted: false,
  },
];

describe("DrawdownProjectionTable", () => {
  it("uses the same collapsed reference-table pattern as income and balance", () => {
    render(
      <DrawdownProjectionTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("Retirement by year")).toBeInTheDocument();
    expect(screen.getByText("See how your retirement changes each year")).toBeInTheDocument();

    fireEvent.click(screen.getByText("See how your retirement changes each year"));

    expect(screen.getByText("Choose the level of detail you need")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plain English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Detailed" })).toBeInTheDocument();
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
  });

  it("uses the retirement journey educational language in the plain-English table", () => {
    render(
      <DrawdownProjectionTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
      />,
    );

    fireEvent.click(screen.getByText("See how your retirement changes each year"));

    expect(screen.getByRole("columnheader", { name: "Money from your pension" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Money available to spend" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Money left in your pension" })).toBeInTheDocument();
  });

  it("describes highlighted milestones without technical jargon", () => {
    render(
      <DrawdownProjectionTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
      />,
    );

    fireEvent.click(screen.getByText("See how your retirement changes each year"));

    expect(screen.getByText("State Pension begins")).toBeInTheDocument();
    expect(screen.getByText("Planned income no longer fully met")).toBeInTheDocument();
    expect(screen.getByText("Private pension fully used")).toBeInTheDocument();
    expect(screen.queryByText("Pension depleted")).not.toBeInTheDocument();
    expect(screen.queryByText("Income shortfall")).not.toBeInTheDocument();
  });
});
