import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

const inputs: DrawdownInputs = {
  startingBalance: 100_000,
  retirementAge: 65,
  endAge: 68,
  desiredAnnualIncome: 20_000,
  incomeTargetMode: "gross",
  annualStatePension: 10_000,
  statePensionAge: 67,
  annualReturn: 0,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("DrawdownEngine edge cases", () => {
  it("returns one row for each age from retirementAge up to but excluding endAge", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      retirementAge: 60,
      endAge: 65,
    });

    expect(result.years.map((year) => year.age)).toEqual([60, 61, 62, 63, 64]);
    expect(result.years.map((year) => year.year)).toEqual([1, 2, 3, 4, 5]);
  });

  it("requires no private withdrawal when State Pension meets the income target", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      retirementAge: 67,
      endAge: 69,
      desiredAnnualIncome: 10_000,
      annualStatePension: 10_000,
      statePensionAge: 67,
    });

    for (const year of result.years) {
      expect(year.requiredPensionWithdrawal).toBe(0);
      expect(year.pensionWithdrawal).toBe(0);
      expect(year.incomeShortfall).toBe(0);
      expect(year.closingBalance).toBe(100_000);
    }
  });

  it("does not treat State Pension above the target as extra planned income", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      retirementAge: 67,
      endAge: 68,
      desiredAnnualIncome: 8_000,
      annualStatePension: 12_000,
      statePensionAge: 67,
    });

    expect(result.years[0]).toMatchObject({
      desiredIncome: 8_000,
      statePensionIncome: 12_000,
      requiredPensionWithdrawal: 0,
      pensionWithdrawal: 0,
      incomeShortfall: 0,
    });
  });

  it("handles zero desired income without withdrawals, depletion, or shortfall", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      desiredAnnualIncome: 0,
      annualReturn: 0.05,
    });

    expect(result.totalPensionWithdrawals).toBe(0);
    expect(result.totalIncomeShortfall).toBe(0);
    expect(result.depletionAge).toBeNull();
    expect(result.firstShortfallAge).toBeNull();
    expect(result.finalBalance).toBeGreaterThan(inputs.startingBalance);
  });

  it("handles a zero starting balance", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      startingBalance: 0,
      annualStatePension: 0,
    });

    expect(result.finalBalance).toBe(0);
    expect(result.totalPensionWithdrawals).toBe(0);
    expect(result.totalIncomeShortfall).toBe(60_000);
    expect(result.depletionAge).toBe(65);
    expect(result.firstShortfallAge).toBe(65);
  });

  it("supports a negative annual return without allowing a negative balance", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      desiredAnnualIncome: 0,
      annualStatePension: 0,
      annualReturn: -0.5,
      endAge: 69,
    });

    expect(result.years.map((year) => year.closingBalance)).toEqual([
      50_000,
      25_000,
      12_500,
      6_250,
    ]);
    expect(result.years.every((year) => year.closingBalance >= 0)).toBe(true);
  });

  it("rounds monetary values to pennies", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      startingBalance: 1_000,
      endAge: 66,
      desiredAnnualIncome: 0,
      annualStatePension: 0,
      annualReturn: 0.033333,
      annualFee: 0.001234,
    });

    expect(result.years[0]).toMatchObject({
      investmentGrowth: 33.33,
      fees: 1.28,
      closingBalance: 1_032.05,
    });
  });

  it("throws a useful error for invalid inputs", () => {
    expect(() =>
      new DrawdownEngine().calculate({
        ...inputs,
        taxFreeCash: 100_001,
      }),
    ).toThrow(/taxFreeCash: Tax-free cash cannot exceed the starting balance/);
  });
});
