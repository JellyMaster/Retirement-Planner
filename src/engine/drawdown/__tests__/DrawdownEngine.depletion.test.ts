import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

const inputs: DrawdownInputs = {
  startingBalance: 50_000,
  retirementAge: 65,
  endAge: 70,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 20_000,
  incomeTargetMode: "gross",
  annualStatePension: 0,
  statePensionAge: 67,
  annualReturn: 0,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("DrawdownEngine depletion and shortfall", () => {
  it("limits the final withdrawal to the remaining pension balance", () => {
    const result = new DrawdownEngine().calculate(inputs);

    expect(result.years[2]).toMatchObject({
      age: 67,
      openingBalance: 10_000,
      requiredPensionWithdrawal: 20_000,
      pensionWithdrawal: 10_000,
      incomeShortfall: 10_000,
      closingBalance: 0,
      isDepleted: true,
    });
  });

  it("never permits opening or closing balances below zero", () => {
    const result = new DrawdownEngine().calculate(inputs);

    for (const year of result.years) {
      expect(year.openingBalance).toBeGreaterThanOrEqual(0);
      expect(year.closingBalance).toBeGreaterThanOrEqual(0);
      expect(year.pensionWithdrawal).toBeLessThanOrEqual(year.openingBalance);
    }
  });

  it("reports the first depletion and shortfall age", () => {
    const result = new DrawdownEngine().calculate(inputs);

    expect(result.depletionAge).toBe(67);
    expect(result.firstShortfallAge).toBe(67);
  });

  it("continues reporting shortfalls after the pot has depleted through the planning age", () => {
    const result = new DrawdownEngine().calculate(inputs);

    expect(result.years.slice(3).map((year) => year.incomeShortfall)).toEqual([
      20_000,
      20_000,
      20_000,
    ]);
    expect(result.totalIncomeShortfall).toBe(70_000);
  });

  it("allows State Pension to reduce shortfall after depletion", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      startingBalance: 10_000,
      annualStatePension: 12_000,
      statePensionAge: 67,
    });

    expect(result.years[0]).toMatchObject({
      age: 65,
      pensionWithdrawal: 10_000,
      incomeShortfall: 10_000,
    });
    expect(result.years[1]).toMatchObject({
      age: 66,
      pensionWithdrawal: 0,
      incomeShortfall: 20_000,
    });
    expect(result.years[2]).toMatchObject({
      age: 67,
      statePensionIncome: 12_000,
      pensionWithdrawal: 0,
      incomeShortfall: 8_000,
    });
  });

  it("does not report depletion when no withdrawal is required", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      startingBalance: 0,
      desiredAnnualIncome: 12_000,
      annualStatePension: 12_000,
      statePensionAge: 65,
    });

    expect(result.depletionAge).toBeNull();
    expect(result.firstShortfallAge).toBeNull();
    expect(result.years.every((year) => !year.isDepleted)).toBe(true);
  });

  it("reports no depletion when growth and State Pension preserve the pot", () => {
    const result = new DrawdownEngine().calculate({
      ...inputs,
      startingBalance: 500_000,
      annualStatePension: 12_000,
      statePensionAge: 65,
      annualReturn: 0.05,
    });

    expect(result.depletionAge).toBeNull();
    expect(result.firstShortfallAge).toBeNull();
    expect(result.finalBalance).toBeGreaterThan(500_000);
  });
});
