import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

const inputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 68,
  endAge: 70,
  withdrawalStrategy: "percentage",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "gross",
  annualStatePension: 12_000,
  statePensionAge: 68,
  annualReturn: 0,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("DrawdownEngine percentage withdrawals", () => {
  it("withdraws the selected percentage of each opening pension balance", () => {
    const result = new DrawdownEngine().calculate(inputs);

    expect(result.withdrawalStrategy).toBe("percentage");
    expect(result.years[0].pensionWithdrawal).toBe(20_000);
    expect(result.years[0].grossIncome).toBe(32_000);
    expect(result.years[1].openingBalance).toBe(480_000);
    expect(result.years[1].pensionWithdrawal).toBe(19_200);
  });

  it("does not report a target-income shortfall because income is intentionally variable", () => {
    const result = new DrawdownEngine().calculate(inputs);

    expect(result.totalIncomeShortfall).toBe(0);
    expect(result.totalNetIncomeShortfall).toBe(0);
    expect(result.firstShortfallAge).toBeNull();
    expect(result.firstNetIncomeShortfallAge).toBeNull();
  });
});
