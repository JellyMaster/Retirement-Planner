
import { describe, expect, it } from "vitest";

import { RetirementProjectionEngine } from "./RetirementProjectionEngine";
import { createPensionInputs } from "../test-data/createPensionInputs";

describe("RetirementProjectionEngine public API", () => {
  it("calculates a projection using only the public engine API", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 48,
      currentPot: 100_000,

      monthlyEmployeeContribution: 500,
      monthlyEmployerContribution: 250,

      annualContributionIncrease: 0,
      annualReturn: 0,
      annualFee: 0,
      inflation: 0,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    expect(result.years).toHaveLength(1);

    expect(result.finalBalance).toEqual({
      nominal: 109_000,
      real: 109_000,
    });

    expect(result.totalContributions).toEqual({
      nominal: 9_000,
      real: 9_000,
    });
  });
});