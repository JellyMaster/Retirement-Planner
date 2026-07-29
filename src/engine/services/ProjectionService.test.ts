
import { describe, expect, it } from "vitest";
import { ProjectionService } from "./ProjectionService";
import { type PensionInputs } from "../models/PensionInputs";

describe("ProjectionService", () => {
  it("should return one projection year per year until retirement", () => {
    const inputs: PensionInputs = {
      currentAge: 47,
      retirementAge: 67,

      currentPot: 194420.91,

      monthlyEmployeeContribution: 1125.70,
      monthlyEmployerContribution: 261.79,

      annualContributionIncrease: 0.03,

      extraContributionAge: 53,
      extraMonthlyContribution: 650,

      annualReturn: 0.0645,

      annualFee: 0.0005,

      inflation: 0.025,
    };

    const result = ProjectionService.calculate(inputs);

    expect(result.length).toBe(21);
  });
});