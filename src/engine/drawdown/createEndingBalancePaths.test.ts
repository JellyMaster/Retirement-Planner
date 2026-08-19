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

const realisticInputs: DrawdownInputs = {
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
};

describe("createEndingBalancePaths", () => {
  it("creates distinct incomes and retirement-pot anchored ending balances", () => {
    const paths = createEndingBalancePaths(baseInputs, 0.5);

    expect(paths.preserve.income).toBe(0);
    expect(paths.reserve.income).toBe(9_615);
    expect(paths.spend.income).toBe(19_230);

    expect(paths.preserve.targetEndingBalance).toBe(500_000);
    expect(paths.reserve.targetEndingBalance).toBe(250_000);
    expect(paths.spend.targetEndingBalance).toBe(0);

    expect(paths.preserve.result.finalBalance).toBeCloseTo(500_000, 0);
    expect(
      Math.abs(
        paths.reserve.result.finalBalance - paths.reserve.targetEndingBalance,
      ),
    ).toBeLessThanOrEqual(25);
    expect(
      Math.abs(
        paths.spend.result.finalBalance - paths.spend.targetEndingBalance,
      ),
    ).toBeLessThanOrEqual(25);
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
    const paths = createEndingBalancePaths(realisticInputs, 0.5);

    expect(paths.preserve.income).toBeLessThan(paths.reserve.income);
    expect(paths.reserve.income).toBeLessThan(paths.spend.income);

    expect(paths.preserve.result.finalBalance).toBeGreaterThanOrEqual(600_000);
    expect(paths.reserve.result.finalBalance).toBeGreaterThanOrEqual(300_000);
    expect(paths.spend.result.finalBalance).toBeGreaterThanOrEqual(0);

    expect(paths.preserve.result.finalBalance).toBeLessThan(650_000);
    expect(paths.reserve.result.finalBalance).toBeLessThan(350_000);
    expect(paths.spend.result.finalBalance).toBeLessThan(50_000);

    expect(paths.spend.income).toBeLessThan(200_000);
    expect(paths.spend.result.depletionAge).toBeNull();
    expect(paths.spend.result.totalNetIncomeShortfall).toBeLessThanOrEqual(1);
  });

  it("changes the middle path when the reserve percentage changes", () => {
    const twentyFive = createEndingBalancePaths(realisticInputs, 0.25);
    const fifty = createEndingBalancePaths(realisticInputs, 0.5);

    expect(twentyFive.reserve.targetEndingBalance).toBe(150_000);
    expect(fifty.reserve.targetEndingBalance).toBe(300_000);
    expect(twentyFive.reserve.income).toBeGreaterThan(fifty.reserve.income);
    expect(twentyFive.reserve.result.finalBalance).toBeLessThan(
      fifty.reserve.result.finalBalance,
    );
  });

  it("reports average, highest and lowest private-pension withdrawals", () => {
    const path = createEndingBalancePaths(realisticInputs, 0.5).reserve;
    const withdrawals = path.result.years.map((year) => year.pensionWithdrawal);
    const expectedAverage =
      withdrawals.reduce((sum, amount) => sum + amount, 0) / withdrawals.length;
    const expectedHighest = Math.max(...withdrawals);
    const expectedLowest = Math.min(...withdrawals);

    expect(path.withdrawals.averageAnnualWithdrawal).toBeCloseTo(expectedAverage, 6);
    expect(path.withdrawals.highestWithdrawal.amount).toBe(expectedHighest);
    expect(path.withdrawals.lowestWithdrawal.amount).toBe(expectedLowest);
    expect(path.withdrawals.highestWithdrawal.age).toBeGreaterThanOrEqual(
      realisticInputs.retirementAge,
    );
    expect(path.withdrawals.lowestWithdrawal.age).toBeLessThanOrEqual(
      realisticInputs.endAge,
    );
  });

  it("does not let saved retirement chapters cap the ending-balance comparison", () => {
    const withChapters: DrawdownInputs = {
      ...realisticInputs,
      spendingPhases: [
        { startAge: 60, annualIncome: 30_000, label: "Active" },
        { startAge: 75, annualIncome: 90_000, label: "Later" },
      ],
    };

    const paths = createEndingBalancePaths(withChapters, 0.25);

    expect(paths.preserve.income).toBeLessThan(paths.reserve.income);
    expect(paths.reserve.income).toBeLessThan(paths.spend.income);
    expect(paths.reserve.result.finalBalance).toBeGreaterThanOrEqual(150_000);
    expect(paths.reserve.result.finalBalance).toBeLessThan(200_000);
    expect(paths.spend.result.depletionAge).toBeNull();
  });
});
