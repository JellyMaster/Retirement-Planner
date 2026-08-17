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
  it("creates distinct incomes and retirement-pot anchored ending balances", () => {
    const paths = createEndingBalancePaths(baseInputs, 0.5);

    expect(paths.preserve.income).toBe(0);
    expect(paths.reserve.income).toBe(10_000);
    expect(paths.spend.income).toBe(20_000);

    expect(paths.preserve.targetEndingBalance).toBe(500_000);
    expect(paths.reserve.targetEndingBalance).toBe(250_000);
    expect(paths.spend.targetEndingBalance).toBe(0);

    expect(paths.preserve.result.finalBalance).toBeCloseTo(500_000, 0);
    expect(paths.reserve.result.finalBalance).toBeCloseTo(250_000, 0);
    expect(paths.spend.result.finalBalance).toBeCloseTo(0, 0);
  });

  it("uses the pot after tax-free cash as the reserve anchor", () => {
    const paths = createEndingBalancePaths(
      { ...baseInputs, taxFreeCash: 100_000 },
      0.5,
    );

    expect(paths.preserve.targetEndingBalance).toBe(400_000);
    expect(paths.reserve.targetEndingBalance).toBe(200_000);
    expect(paths.spend.targetEndingBalance).toBe(0);
  });

  it("produces ordered paths with realistic returns, fees, inflation and State Pension", () => {
    const paths = createEndingBalancePaths(
      {
        ...baseInputs,
        startingBalance: 600_000,
        retirementAge: 60,
        endAge: 95,
        withdrawalStrategy: "percentage",
        desiredAnnualIncome: 30_000,
        incomeTargetMode: "net",
        annualStatePension: 12_000,
        statePensionAge: 67,
        annualReturn: 0.05,
        annualFee: 0.005,
        inflationRate: 0.025,
      },
      0.5,
    );

    expect(paths.preserve.income).toBeLessThan(paths.reserve.income);
    expect(paths.reserve.income).toBeLessThan(paths.spend.income);

    expect(paths.preserve.result.finalBalance).toBeGreaterThanOrEqual(600_000);
    expect(paths.reserve.result.finalBalance).toBeGreaterThanOrEqual(300_000);
    expect(paths.spend.result.finalBalance).toBeGreaterThanOrEqual(0);

    expect(paths.preserve.result.finalBalance).toBeLessThan(650_000);
    expect(paths.reserve.result.finalBalance).toBeLessThan(350_000);
    expect(paths.spend.result.finalBalance).toBeLessThan(50_000);
  });
});
