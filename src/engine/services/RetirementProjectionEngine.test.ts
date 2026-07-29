import { describe, expect, it } from "vitest";
import { RetirementProjectionEngine } from "./RetirementProjectionEngine";
import { type PensionInputs } from "../models/PensionInputs";

describe("ProjectionService", () => {
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

  it("returns one year for each year until retirement", () => {
    const result = RetirementProjectionEngine.calculate(inputs);

    expect(result.length).toBe(21);
  });

  it("uses the opening balance", () => {
    const result = RetirementProjectionEngine.calculate(inputs);

    expect(result[0].openingBalance).toBe(194420.91);
  });

  it("calculates annual contributions", () => {
    const result = RetirementProjectionEngine.calculate(inputs);

    expect(result[0].contributions).toBeCloseTo(16649.88, 2);
  });

  it("calculates investment growth", () => {
    const testInputs: PensionInputs = {
      ...inputs,
      currentPot: 100000,
      monthlyEmployeeContribution: 0,
      monthlyEmployerContribution: 0,
      annualReturn: 0.05,
      annualFee: 0,
      retirementAge: 47,
    };

    const result = RetirementProjectionEngine.calculate(testInputs);

    expect(result[0].investmentGrowth).toBe(5000);
  });

  it("calculates the closing balance", () => {
    const testInputs: PensionInputs = {
      ...inputs,
      currentPot: 100000,
      monthlyEmployeeContribution: 100,
      monthlyEmployerContribution: 50,
      annualReturn: 0,
      annualFee: 0,
      retirementAge: 47,
    };

    const result = RetirementProjectionEngine.calculate(testInputs);

    expect(result[0].closingBalance).toBe(101800);
  });
});