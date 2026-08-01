import { describe, expect, it } from "vitest";
import { createPensionInputs } from "../../test-data/createPensionInputs";
import { RetirementProjectionEngine } from "../../services/RetirementProjectionEngine";
import { MonteCarloEngine } from "../MonteCarloEngine";

describe("MonteCarloEngine", () => {
  it("is deterministic for the same seed", () => {
    const config = {
      pensionInputs: createPensionInputs({ retirementAge: 35 }),
      simulations: 250,
      seed: 12345,
      annualVolatility: 0.12,
      targetRealBalance: 250_000,
    };

    expect(MonteCarloEngine.calculate(config)).toEqual(
      MonteCarloEngine.calculate(config)
    );
  });

  it("matches the deterministic projection when volatility is zero", () => {
    const pensionInputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 52,
      currentPot: 100_000,
      monthlyEmployeeContribution: 500,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0.03,
      annualReturn: 0.05,
      annualFee: 0.005,
      inflation: 0.02,
    });

    const deterministic = RetirementProjectionEngine.calculate(pensionInputs);
    const monteCarlo = MonteCarloEngine.calculate({
      pensionInputs,
      simulations: 20,
      annualVolatility: 0,
      seed: 1,
    });

    expect(monteCarlo.finalNominalBalance.p50).toBeCloseTo(
      deterministic.finalBalance.nominal,
      8
    );
    expect(monteCarlo.finalRealBalance.p50).toBeCloseTo(
      deterministic.finalBalance.real,
      8
    );
  });

  it("calculates success probability against a real-balance target", () => {
    const result = MonteCarloEngine.calculate({
      pensionInputs: createPensionInputs({
        currentAge: 47,
        retirementAge: 57,
        currentPot: 100_000,
        monthlyEmployeeContribution: 500,
      }),
      simulations: 500,
      seed: 42,
      annualVolatility: 0.12,
      targetRealBalance: 200_000,
    });

    expect(result.successProbability).toBeGreaterThanOrEqual(0);
    expect(result.successProbability).toBeLessThanOrEqual(1);
    expect(result.finalRealBalance.p10).toBeLessThanOrEqual(
      result.finalRealBalance.p50
    );
    expect(result.finalRealBalance.p50).toBeLessThanOrEqual(
      result.finalRealBalance.p90
    );
    expect(result.yearlyPercentiles).toHaveLength(10);
  });

  it("returns the current pot for an immediate retirement", () => {
    const result = MonteCarloEngine.calculate({
      pensionInputs: createPensionInputs({
        currentAge: 68,
        retirementAge: 68,
        currentPot: 250_000,
      }),
      simulations: 10,
      seed: 5,
      targetRealBalance: 200_000,
    });

    expect(result.finalRealBalance).toEqual({
      p10: 250_000,
      p25: 250_000,
      p50: 250_000,
      p75: 250_000,
      p90: 250_000,
    });
    expect(result.successProbability).toBe(1);
    expect(result.yearlyPercentiles).toEqual([]);
  });
});
