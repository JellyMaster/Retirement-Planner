import { describe, expect, it } from "vitest";
import {
  calculateMonthlyContribution,
} from "./calculateMonthlyContribution";

describe("calculateMonthlyContribution", () => {
  it("returns the starting contribution", () => {
    const result =
      calculateMonthlyContribution({
        currentAge: 47,
        projectionAge: 47,

        employeeContribution: 1125.70,
        employerContribution: 261.79,

        annualIncrease: 0.03,
      });

    expect(result.employeeContribution)
      .toBeCloseTo(1125.70, 2);
  });

  it("applies annual increases", () => {
    const result =
      calculateMonthlyContribution({
        currentAge: 47,
        projectionAge: 48,

        employeeContribution: 1000,
        employerContribution: 0,

        annualIncrease: 0.03,
      });

    expect(result.employeeContribution)
      .toBeCloseTo(1030, 2);
  });

  it("adds the extra contribution at age 53", () => {
    const result =
      calculateMonthlyContribution({
        currentAge: 47,
        projectionAge: 53,

        employeeContribution: 1000,
        employerContribution: 0,

        annualIncrease: 0,

        extraContributionAge: 53,
        extraMonthlyContribution: 650,
      });

    expect(result.employeeContribution)
      .toBe(1650);
  });
});