import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { DrawdownIncomeYearTable } from "./DrawdownIncomeYearTable";

const years: DrawdownYear[] = [
  {
    year: 1,
    age: 65,
    openingBalance: 500_000,
    desiredIncome: 30_000,
    incomeTargetMode: "net",
    statePensionIncome: 0,
    requiredPensionWithdrawal: 30_000,
    pensionWithdrawal: 30_000,
    grossIncome: 30_000,
    taxableIncome: 17_430,
    personalAllowance: 12_570,
    incomeTax: 3_486,
    netIncome: 26_514,
    effectiveTaxRate: 0.1162,
    netIncomeShortfall: 3_486,
    incomeShortfall: 0,
    investmentGrowth: 20_000,
    fees: 2_000,
    closingBalance: 488_000,
    isDepleted: false,
  },
];

describe("DrawdownIncomeYearTable", () => {
  it("uses the same educational terminology as the income explorer", () => {
    render(
      <DrawdownIncomeYearTable
        years={years}
        inflationRate={0}
        displayMode="nominal"
        selectedAge={65}
      />,
    );

    fireEvent.click(screen.getByText("See how your retirement income changes each year"));

    expect(screen.getByRole("columnheader", { name: "Money from your pension" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Money available to spend" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Your planned income" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Below your plan by" })).toBeInTheDocument();
    expect(screen.getByLabelText("Currently selected year")).toBeInTheDocument();
    expect(
      screen.getByText(/The eye marks the year selected in the income explorer above/i),
    ).toBeInTheDocument();
  });
});
