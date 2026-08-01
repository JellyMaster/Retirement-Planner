import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "../../drawdown/DrawdownEngine";
import type { DrawdownInputs } from "../../drawdown/models/DrawdownInputs";
import { MonteCarloDrawdownEngine } from "../MonteCarloDrawdownEngine";

const baseInputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 65,
  endAge: 95,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "gross",
  annualStatePension: 12_000,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0.025,
  taxFreeCash: 0,
};

describe("MonteCarloDrawdownEngine", () => {
  it("produces identical results for the same seed", () => {
    const engine = new MonteCarloDrawdownEngine();
    const config = {
      drawdownInputs: baseInputs,
      simulations: 250,
      seed: 9876,
      annualVolatility: 0.12,
    };

    expect(engine.calculate(config)).toEqual(engine.calculate(config));
  });

  it("matches deterministic drawdown when volatility is zero", () => {
    const deterministic = new DrawdownEngine().calculate(baseInputs);
    const result = new MonteCarloDrawdownEngine().calculate({
      drawdownInputs: baseInputs,
      simulations: 20,
      seed: 1,
      annualVolatility: 0,
    });

    expect(result.finalBalance.p10).toBe(deterministic.finalBalance);
    expect(result.finalBalance.p50).toBe(deterministic.finalBalance);
    expect(result.finalBalance.p90).toBe(deterministic.finalBalance);
    expect(result.medianDepletionAge).toBe(deterministic.depletionAge);
  });

  it("treats a zero starting balance as depleted at retirement when income is required", () => {
    const result = new MonteCarloDrawdownEngine().calculate({
      drawdownInputs: {
        ...baseInputs,
        startingBalance: 0,
        annualStatePension: 0,
      },
      simulations: 25,
      seed: 2,
      annualVolatility: 0.12,
    });

    expect(result.survivalProbability).toBe(0);
    expect(result.incomeReliabilityProbability).toBe(0);
    expect(result.medianDepletionAge).toBe(65);
  });

  it("State Pension improves survival probability", () => {
    const engine = new MonteCarloDrawdownEngine();
    const common = {
      simulations: 1_000,
      seed: 42,
      annualVolatility: 0.14,
    };

    const withoutStatePension = engine.calculate({
      ...common,
      drawdownInputs: { ...baseInputs, annualStatePension: 0 },
    });
    const withStatePension = engine.calculate({
      ...common,
      drawdownInputs: baseInputs,
    });

    expect(withStatePension.survivalProbability).toBeGreaterThanOrEqual(
      withoutStatePension.survivalProbability,
    );
  });

  it("higher spending reduces survival probability", () => {
    const engine = new MonteCarloDrawdownEngine();
    const common = {
      simulations: 1_000,
      seed: 73,
      annualVolatility: 0.14,
    };

    const lowerSpending = engine.calculate({
      ...common,
      drawdownInputs: { ...baseInputs, desiredAnnualIncome: 25_000 },
    });
    const higherSpending = engine.calculate({
      ...common,
      drawdownInputs: { ...baseInputs, desiredAnnualIncome: 45_000 },
    });

    expect(higherSpending.survivalProbability).toBeLessThanOrEqual(
      lowerSpending.survivalProbability,
    );
    expect(higherSpending.probabilityOfAnyIncomeShortfall).toBeGreaterThanOrEqual(
      lowerSpending.probabilityOfAnyIncomeShortfall,
    );
  });

  it("lower expected returns reduce survival probability", () => {
    const engine = new MonteCarloDrawdownEngine();
    const common = {
      simulations: 1_000,
      seed: 91,
      annualVolatility: 0.12,
    };

    const lowerReturns = engine.calculate({
      ...common,
      drawdownInputs: { ...baseInputs, annualReturn: 0.02 },
    });
    const higherReturns = engine.calculate({
      ...common,
      drawdownInputs: { ...baseInputs, annualReturn: 0.06 },
    });

    expect(lowerReturns.survivalProbability).toBeLessThanOrEqual(
      higherReturns.survivalProbability,
    );
  });
});
