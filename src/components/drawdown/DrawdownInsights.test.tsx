import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { DrawdownInsights } from "./DrawdownInsights";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 60,
  endAge: 90,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0.025,
  taxFreeCash: 0,
};

const fundedResult: DrawdownResult = {
  startingBalance: 500_000,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  incomeTargetMode: "net",
  taxFreeCashTaken: 0,
  balanceAfterTaxFreeCash: 500_000,
  years: [],
  finalBalance: 125_000,
  depletionAge: null,
  firstShortfallAge: null,
  firstNetIncomeShortfallAge: null,
  totalDesiredIncome: 900_000,
  totalStatePensionIncome: 276_000,
  totalPensionWithdrawals: 624_000,
  totalGrossIncome: 900_000,
  totalIncomeTax: 90_000,
  totalNetIncome: 810_000,
  totalNetIncomeShortfall: 0,
  averageEffectiveTaxRate: 0.1,
  totalIncomeShortfall: 0,
  totalInvestmentGrowth: 350_000,
  totalFees: 35_000,
};

describe("DrawdownInsights", () => {
  it("keeps reassuring and neutral observations free of attention tooltips", () => {
    render(
      <DrawdownInsights
        inputs={inputs}
        result={fundedResult}
        displayMode="nominal"
      />,
    );

    expect(screen.getByText("Your pension is expected to last through age 90")).toBeInTheDocument();
    expect(screen.getByText("Your planned income is fully supported")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /needs attention/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("explains a pension depletion warning accessibly", () => {
    render(
      <DrawdownInsights
        inputs={inputs}
        result={{ ...fundedResult, depletionAge: 82 }}
        displayMode="nominal"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Explain why your pension is expected to run out around age 82 needs attention",
    });
    const tooltipId = trigger.getAttribute("aria-describedby");

    expect(tooltipId).toBeTruthy();
    expect(document.getElementById(tooltipId!)).toHaveAttribute("role", "tooltip");
    expect(screen.getByText("Why am I seeing this?")).toBeInTheDocument();
    expect(
      screen.getByText(/expected to be exhausted around age 82/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/would need another source of income to continue meeting your planned spending/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Things you could review")).toBeInTheDocument();
    expect(screen.getByText("Your planned retirement income")).toBeInTheDocument();
    expect(screen.getByText("When you retire")).toBeInTheDocument();
    expect(screen.getByText("How much tax-free cash you take")).toBeInTheDocument();
    expect(screen.getByText("How you take money from your pension")).toBeInTheDocument();
  });

  it("explains an income shortfall warning without implying the pension has depleted", () => {
    render(
      <DrawdownInsights
        inputs={inputs}
        result={{ ...fundedResult, firstNetIncomeShortfallAge: 78 }}
        displayMode="nominal"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Explain why your planned income may no longer be fully achievable from age 78 needs attention",
    });

    expect(trigger).toHaveAttribute("aria-describedby");
    expect(
      screen.getByText(/may not be able to provide the level of income you've chosen from age 78/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/different from your pension running out completely/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  });
});
