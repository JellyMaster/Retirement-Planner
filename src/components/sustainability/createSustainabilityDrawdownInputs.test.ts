import { describe, expect, it } from "vitest";

import { createTestPensionInputs, createTestProjection, createTestRetirementGoals } from "../../test/retirementTestFixtures";
import { createSustainabilityDrawdownInputs } from "./createSustainabilityDrawdownInputs";

describe("createSustainabilityDrawdownInputs", () => {
  it("creates a today's-money drawdown plan from the accumulation result", () => {
    const inputs = createTestPensionInputs();
    const projection = createTestProjection();
    const goals = createTestRetirementGoals();

    const result = createSustainabilityDrawdownInputs(inputs, projection, goals, {
      endAge: 97,
    });

    expect(result.startingBalance).toBe(projection.finalBalance.real);
    expect(result.retirementAge).toBe(inputs.retirementAge);
    expect(result.endAge).toBe(97);
    expect(result.desiredAnnualIncome).toBe(goals.desiredAnnualIncome);
    expect(result.incomeTargetMode).toBe("gross");
    expect(result.inflationRate).toBe(0);
    expect(result.annualStatePension).toBe(goals.statePensionAnnualAmount);
  });

  it("removes State Pension when it is excluded from the goals", () => {
    const inputs = createTestPensionInputs();
    const projection = createTestProjection();
    const goals = { ...createTestRetirementGoals(), includeStatePension: false };

    const result = createSustainabilityDrawdownInputs(inputs, projection, goals);

    expect(result.annualStatePension).toBe(0);
  });
});
