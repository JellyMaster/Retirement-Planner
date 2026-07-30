import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

const netTargetInputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 68,
  endAge: 69,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 68,
  annualReturn: 0,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("DrawdownEngine net-income targeting", () => {
  it("solves for the gross withdrawal required to meet the net target", () => {
    const year = new DrawdownEngine().calculate(netTargetInputs).years[0];

    expect(year.netIncome).toBeCloseTo(30_000, 2);
    expect(year.grossIncome).toBeGreaterThan(30_000);
    expect(year.pensionWithdrawal).toBeGreaterThan(18_000);
    expect(year.incomeTax).toBeGreaterThan(0);
    expect(year.netIncomeShortfall).toBe(0);
  });

  it("does not withdraw private pension when State Pension alone meets the net target", () => {
    const year = new DrawdownEngine().calculate({
      ...netTargetInputs,
      desiredAnnualIncome: 10_000,
    }).years[0];

    expect(year.pensionWithdrawal).toBe(0);
    expect(year.netIncome).toBeGreaterThanOrEqual(10_000);
  });

  it("caps the withdrawal at the available balance and reports the remaining net shortfall", () => {
    const result = new DrawdownEngine().calculate({
      ...netTargetInputs,
      startingBalance: 5_000,
      annualStatePension: 0,
    });
    const year = result.years[0];

    expect(year.pensionWithdrawal).toBe(5_000);
    expect(year.netIncome).toBe(5_000);
    expect(year.netIncomeShortfall).toBe(25_000);
    expect(result.firstNetIncomeShortfallAge).toBe(68);
    expect(result.depletionAge).toBe(68);
  });

  it("preserves the existing gross-target behaviour", () => {
    const year = new DrawdownEngine().calculate({
      ...netTargetInputs,
      incomeTargetMode: "gross",
    }).years[0];

    expect(year.pensionWithdrawal).toBe(18_000);
    expect(year.grossIncome).toBe(30_000);
    expect(year.netIncome).toBeLessThan(30_000);
    expect(year.netIncomeShortfall).toBe(0);
  });
});
