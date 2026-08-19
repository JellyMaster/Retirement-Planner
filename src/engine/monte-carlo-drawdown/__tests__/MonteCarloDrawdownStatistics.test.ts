import { describe, expect, it } from "vitest";

import { calculateMonteCarloDrawdownStatistics } from "../MonteCarloDrawdownStatistics";
import type { MonteCarloDrawdownPath } from "../MonteCarloDrawdownTypes";

const paths: MonteCarloDrawdownPath[] = [
  {
    finalBalance: 0,
    depletionAge: 66,
    firstIncomeShortfallAge: 66,
    totalIncomeShortfall: 10_000,
    balancesByAge: [50_000, 0, 0, 0],
  },
  {
    finalBalance: 25_000,
    depletionAge: null,
    firstIncomeShortfallAge: null,
    totalIncomeShortfall: 0,
    balancesByAge: [70_000, 45_000, 30_000, 25_000],
  },
  {
    finalBalance: 75_000,
    depletionAge: null,
    firstIncomeShortfallAge: null,
    totalIncomeShortfall: 0,
    balancesByAge: [90_000, 80_000, 77_000, 75_000],
  },
];

describe("calculateMonteCarloDrawdownStatistics", () => {
  it("calculates survival, shortfall and age-based statistics", () => {
    const result = calculateMonteCarloDrawdownStatistics({
      paths,
      seed: 1,
      annualVolatility: 0.12,
      minimumAnnualReturn: -0.75,
      maximumAnnualReturn: 1,
      retirementAge: 65,
      endAge: 68,
    });

    expect(result.survivalProbability).toBeCloseTo(2 / 3);
    expect(result.incomeReliabilityProbability).toBeCloseTo(2 / 3);
    expect(result.probabilityOfAnyIncomeShortfall).toBeCloseTo(1 / 3);
    expect(result.medianDepletionAge).toBe(66);
    expect(result.ageStatistics).toHaveLength(4);
    expect(result.ageStatistics.map((year) => year.age)).toEqual([65, 66, 67, 68]);
    expect(result.ageStatistics[0].survivalProbability).toBe(1);
    expect(result.ageStatistics[1].survivalProbability).toBeCloseTo(2 / 3);
    expect(result.finalBalance.p10).toBeLessThanOrEqual(result.finalBalance.p50);
    expect(result.finalBalance.p50).toBeLessThanOrEqual(result.finalBalance.p90);
  });

  it("reports null median depletion age when no path depletes", () => {
    const result = calculateMonteCarloDrawdownStatistics({
      paths: paths.slice(1),
      seed: 1,
      annualVolatility: 0,
      minimumAnnualReturn: -0.75,
      maximumAnnualReturn: 1,
      retirementAge: 65,
      endAge: 68,
    });

    expect(result.medianDepletionAge).toBeNull();
    expect(result.survivalProbability).toBe(1);
  });
});
