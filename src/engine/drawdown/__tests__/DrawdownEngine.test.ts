import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

const baseInputs: DrawdownInputs = {
  startingBalance: 100_000,
  retirementAge: 65,
  endAge: 68,
  desiredAnnualIncome: 20_000,
  annualStatePension: 10_000,
  statePensionAge: 66,
  annualReturn: 0.05,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("DrawdownEngine core calculations", () => {
  it("calculates balances year by year", () => {
    const result = new DrawdownEngine().calculate(baseInputs);

    expect(result.years).toHaveLength(3);
    expect(result.years[0]).toMatchObject({
      year: 1,
      age: 65,
      openingBalance: 100_000,
      desiredIncome: 20_000,
      statePensionIncome: 0,
      requiredPensionWithdrawal: 20_000,
      pensionWithdrawal: 20_000,
      investmentGrowth: 4_000,
      fees: 0,
      closingBalance: 84_000,
    });
    expect(result.finalBalance).toBe(71_085);
  });

  it("starts State Pension at the configured age", () => {
    const result = new DrawdownEngine().calculate(baseInputs);

    expect(result.years.map((year) => year.statePensionIncome)).toEqual([
      0,
      10_000,
      10_000,
    ]);
    expect(result.years.map((year) => year.pensionWithdrawal)).toEqual([
      20_000,
      10_000,
      10_000,
    ]);
  });

  it("uses rising State Pension to reduce private withdrawals while respecting the income cap", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      desiredAnnualIncome: 30_000,
      annualStatePension: 12_000,
      statePensionAge: 65,
      inflationRate: 0.025,
      annualReturn: 0,
    });

    expect(result.years).toHaveLength(3);
    expect(result.years.map((year) => year.statePensionIncome)).toEqual([
      12_000,
      12_300,
      12_607.5,
    ]);
    expect(
      result.years.map((year) => year.requiredPensionWithdrawal),
    ).toEqual([18_000, 17_700, 17_392.5]);

    for (const year of result.years) {
      expect(year.statePensionIncome + year.pensionWithdrawal).toBeLessThanOrEqual(
        year.desiredIncome,
      );
      expect(
        year.statePensionIncome +
          year.pensionWithdrawal +
          year.incomeShortfall,
      ).toBe(year.desiredIncome);
    }
  });

  it("deducts tax-free cash before the first drawdown year", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      taxFreeCash: 25_000,
      annualReturn: 0,
    });

    expect(result.taxFreeCashTaken).toBe(25_000);
    expect(result.balanceAfterTaxFreeCash).toBe(75_000);
    expect(result.years[0].openingBalance).toBe(75_000);
  });

  it("applies withdrawals before growth and fees", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      startingBalance: 100_000,
      endAge: 66,
      annualStatePension: 0,
      annualReturn: 0.1,
      annualFee: 0.01,
    });

    const year = result.years[0];

    expect(year.pensionWithdrawal).toBe(20_000);
    expect(year.investmentGrowth).toBe(8_000);
    expect(year.fees).toBe(880);
    expect(year.closingBalance).toBe(87_120);
  });

  it("reports totals that reconcile to the yearly rows", () => {
    const result = new DrawdownEngine().calculate(baseInputs);

    expect(result.totalDesiredIncome).toBe(
      result.years.reduce((sum, year) => sum + year.desiredIncome, 0),
    );
    expect(result.totalStatePensionIncome).toBe(
      result.years.reduce((sum, year) => sum + year.statePensionIncome, 0),
    );
    expect(result.totalPensionWithdrawals).toBe(
      result.years.reduce((sum, year) => sum + year.pensionWithdrawal, 0),
    );
    expect(result.totalInvestmentGrowth).toBe(
      result.years.reduce((sum, year) => sum + year.investmentGrowth, 0),
    );
    expect(result.totalFees).toBe(
      result.years.reduce((sum, year) => sum + year.fees, 0),
    );
  });
});
