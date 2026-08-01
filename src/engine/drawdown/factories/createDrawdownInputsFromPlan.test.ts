import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../../../config/defaultRetirementGoals";
import type { ProjectionResult } from "../../models/ProjectionResult";
import { createDrawdownInputsFromPlan } from "./createDrawdownInputsFromPlan";

const zeroMoney = { nominal: 0, real: 0 };

function createProjection(realBalance = 720_000): ProjectionResult {
  return {
    years: [],
    finalBalance: {
      nominal: 1_050_000,
      real: realBalance,
    },
    totalContributions: zeroMoney,
    totalInvestmentGrowth: zeroMoney,
    totalFees: zeroMoney,
  };
}

describe("createDrawdownInputsFromPlan", () => {
  it("uses the active plan projection and saved retirement goals", () => {
    const pensionInputs = {
      ...createDefaultPensionInputs(),
      retirementAge: 65,
      annualReturn: 0.055,
      annualFee: 0.004,
      inflation: 0.021,
    };
    const retirementGoals = {
      ...defaultRetirementGoals,
      desiredAnnualIncome: 42_000,
      statePensionAnnualAmount: 13_200,
      statePensionAge: 68,
    };

    const inputs = createDrawdownInputsFromPlan({
      pensionInputs,
      projection: createProjection(),
      retirementGoals,
    });

    expect(inputs).toEqual(
      expect.objectContaining({
        startingBalance: 720_000,
        retirementAge: 65,
        desiredAnnualIncome: 42_000,
        annualStatePension: 13_200,
        statePensionAge: 68,
        annualReturn: 0.055,
        annualFee: 0.004,
        inflationRate: 0.021,
      }),
    );
  });

  it("excludes State Pension when it is disabled in saved goals", () => {
    const inputs = createDrawdownInputsFromPlan({
      pensionInputs: createDefaultPensionInputs(),
      projection: createProjection(),
      retirementGoals: {
        ...defaultRetirementGoals,
        includeStatePension: false,
      },
    });

    expect(inputs.annualStatePension).toBe(0);
  });

  it("does not allow a negative projected balance", () => {
    const inputs = createDrawdownInputsFromPlan({
      pensionInputs: createDefaultPensionInputs(),
      projection: createProjection(-1),
      retirementGoals: defaultRetirementGoals,
    });

    expect(inputs.startingBalance).toBe(0);
  });
});
