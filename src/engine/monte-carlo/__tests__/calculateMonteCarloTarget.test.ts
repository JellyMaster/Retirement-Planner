import { describe, expect, it } from "vitest";

import type { RetirementGoals } from "../../models/RetirementGoals";
import { calculateMonteCarloTarget } from "../calculateMonteCarloTarget";

const goals: RetirementGoals = {
  desiredAnnualIncome: 40_000,
  includeStatePension: true,
  statePensionAnnualAmount: 12_000,
  statePensionAge: 68,
  emergencyReserve: 20_000,
};

describe("calculateMonteCarloTarget", () => {
  it("derives the real balance target from private income and reserve", () => {
    expect(calculateMonteCarloTarget(goals)).toEqual({
      targetRealBalance: 720_000,
      requiredPrivateAnnualIncome: 28_000,
      includedStatePensionIncome: 12_000,
      emergencyReserve: 20_000,
    });
  });

  it("does not require a negative private income target", () => {
    expect(
      calculateMonteCarloTarget({
        ...goals,
        desiredAnnualIncome: 10_000,
      }).targetRealBalance,
    ).toBe(20_000);
  });

  it("ignores State Pension when it is disabled", () => {
    expect(
      calculateMonteCarloTarget({
        ...goals,
        includeStatePension: false,
      }).targetRealBalance,
    ).toBe(1_020_000);
  });
});
