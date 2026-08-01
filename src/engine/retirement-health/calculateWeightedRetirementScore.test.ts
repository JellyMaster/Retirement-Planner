import { describe, expect, it } from "vitest";

import type { PensionInputs } from "../models/PensionInputs";
import type { ProjectionResult } from "../models/ProjectionResult";
import type { RetirementGoals } from "../models/RetirementGoals";
import { calculateWeightedRetirementScore } from "./calculateWeightedRetirementScore";

const inputs: PensionInputs = {
  currentAge: 47,
  retirementAge: 68,
  currentPot: 200_000,
  monthlyEmployeeContribution: 800,
  monthlyEmployerContribution: 400,
  annualContributionIncrease: 0.03,
  annualReturn: 0.06,
  annualFee: 0.005,
  inflation: 0.025,
};

const result: ProjectionResult = {
  years: [],
  finalBalance: { nominal: 1_000_000, real: 650_000 },
  totalContributions: { nominal: 350_000, real: 275_000 },
  totalInvestmentGrowth: { nominal: 500_000, real: 325_000 },
  totalFees: { nominal: 50_000, real: 32_000 },
};

const goals: RetirementGoals = {
  desiredAnnualIncome: 35_000,
  includeStatePension: true,
  statePensionAnnualAmount: 12_000,
  statePensionAge: 68,
  emergencyReserve: 20_000,
};

describe("calculateWeightedRetirementScore", () => {
  it("returns the existing income coverage score and a weighted score", () => {
    const breakdown = calculateWeightedRetirementScore({ inputs, result, goals });

    expect(breakdown.incomeCoverageScore).toBe(100);
    expect(breakdown.weightedScore).toBeGreaterThan(0);
    expect(breakdown.weightedScore).toBeLessThanOrEqual(100);
    expect(breakdown.factors).toHaveLength(7);
  });

  it("uses weights that add up to the complete score", () => {
    const breakdown = calculateWeightedRetirementScore({ inputs, result, goals });
    const totalWeight = breakdown.factors.reduce((total, factor) => total + factor.weight, 0);

    expect(totalWeight).toBeCloseTo(1, 10);
    expect(
      Math.round(breakdown.factors.reduce((total, factor) => total + factor.weightedPoints, 0)),
    ).toBe(breakdown.weightedScore);
  });

  it("reduces the weighted score when fees are materially higher", () => {
    const lowFee = calculateWeightedRetirementScore({ inputs, result, goals });
    const highFee = calculateWeightedRetirementScore({
      inputs: { ...inputs, annualFee: 0.02 },
      result,
      goals,
    });

    expect(highFee.weightedScore).toBeLessThan(lowFee.weightedScore);
  });
});
