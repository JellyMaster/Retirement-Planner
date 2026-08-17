import { describe, expect, it } from "vitest";

import { createEndingBalancePaths } from "./createEndingBalancePaths";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const baseInputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 65,
  endAge: 90,
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

describe("createEndingBalancePaths", () => {
  it("creates distinct sustainable incomes for preserve, reserve and spend-to-zero", () => {
    const paths = createEndingBalancePaths(baseInputs, 0.5);

    expect(paths.preserve.income).toBe(0);
    expect(paths.reserve.income).toBe(10_000);
    expect(paths.spend.income).toBe(20_000);
    expect(paths.preserve.income).toBeLessThan(paths.reserve.income);
    expect(paths.reserve.income).toBeLessThan(paths.spend.income);
  });

  it("uses target-income modelling for comparison even when the saved plan uses percentage drawdown", () => {
    const paths = createEndingBalancePaths(
      { ...baseInputs, withdrawalStrategy: "percentage" },
      0.5,
    );

    expect(paths.preserve.income).toBe(0);
    expect(paths.reserve.income).toBe(10_000);
    expect(paths.spend.income).toBe(20_000);
  });
});
