import { describe, expect, it } from "vitest";

import { RetirementProjectionEngine } from "./RetirementProjectionEngine";
import { createPensionInputs } from "../test-data/createPensionInputs";

describe("RetirementProjectionEngine", () => {
  it("returns the current pot when already at retirement age", () => {
    const inputs = createPensionInputs({
      currentAge: 67,
      retirementAge: 67,
      currentPot: 200_000,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    expect(result.years).toEqual([]);

    expect(result.finalBalance).toEqual({
      nominal: 200_000,
      real: 200_000,
    });

    expect(result.totalContributions).toEqual({
      nominal: 0,
      real: 0,
    });

    expect(result.totalInvestmentGrowth).toEqual({
      nominal: 0,
      real: 0,
    });

    expect(result.totalFees).toEqual({
      nominal: 0,
      real: 0,
    });
  });

  it("projects twelve months with contributions only", () => {
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

    expect(result.totalContributions.nominal)
      .toBe(9_000);

    expect(result.totalInvestmentGrowth.nominal)
      .toBe(0);

    expect(result.totalFees.nominal)
      .toBe(0);

    expect(result.finalBalance.nominal)
      .toBe(109_000);
  });

  it("applies one effective year of investment growth", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 48,

      currentPot: 100_000,

      monthlyEmployeeContribution: 0,
      monthlyEmployerContribution: 0,

      annualReturn: 0.05,
      annualFee: 0,
      inflation: 0,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    expect(result.finalBalance.nominal)
      .toBeCloseTo(105_000, 8);

    expect(result.totalInvestmentGrowth.nominal)
      .toBeCloseTo(5_000, 8);
  });

  it("applies one effective year of fees", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 48,

      currentPot: 100_000,

      monthlyEmployeeContribution: 0,
      monthlyEmployerContribution: 0,

      annualReturn: 0,
      annualFee: 0.01,
      inflation: 0,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    expect(result.finalBalance.nominal)
      .toBeCloseTo(99_000, 8);

    expect(result.totalFees.nominal)
      .toBeCloseTo(1_000, 8);
  });

  it("calculates the real closing balance using end-of-year inflation", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 48,

      currentPot: 100_000,

      monthlyEmployeeContribution: 0,
      monthlyEmployerContribution: 0,

      annualReturn: 0,
      annualFee: 0,
      inflation: 0.02,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    expect(result.finalBalance.nominal)
      .toBe(100_000);

    expect(result.finalBalance.real)
      .toBeCloseTo(
        100_000 / 1.02,
        8
      );
  });

  it("reconciles every yearly closing balance", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 52,

      currentPot: 100_000,

      monthlyEmployeeContribution: 500,
      monthlyEmployerContribution: 250,

      annualReturn: 0.05,
      annualFee: 0.01,
      inflation: 0.02,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    for (const year of result.years) {
      const expectedClosingBalance =
        year.openingBalance.nominal +
        year.contributions.nominal +
        year.investmentGrowth.nominal -
        year.fees.nominal;

      expect(year.closingBalance.nominal)
        .toBeCloseTo(
          expectedClosingBalance,
          8
        );
    }
  });

  it("uses the final year's closing balance as the final result", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      retirementAge: 50,
    });

    const result =
      RetirementProjectionEngine.calculate(inputs);

    const finalYear =
      result.years[result.years.length - 1];

    expect(result.finalBalance)
      .toEqual(finalYear.closingBalance);
  });
});