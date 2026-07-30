import { describe, expect, it } from "vitest";

import { MonthlyProjectionContextFactory } from "../factories/MonthlyProjectionContextFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";
import { MonthlyContributionStep } from "./MonthlyContributionStep";

describe("MonthlyContributionStep", () => {
  it("calculates the initial monthly contribution", () => {
    const inputs = createPensionInputs({
      monthlyEmployeeContribution: 1000,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0.03,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    new MonthlyContributionStep().execute(context);

    expect(context.employeeContribution)
      .toBe(1000);

    expect(context.employerContribution)
      .toBe(250);

    expect(context.totalContribution)
      .toBe(1250);
  });

  it("increases the employee contribution after twelve months", () => {
    const inputs = createPensionInputs({
      monthlyEmployeeContribution: 1000,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0.03,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        12,
        100000
      );

    new MonthlyContributionStep().execute(context);

    expect(context.employeeContribution)
      .toBeCloseTo(1030, 2);

    expect(context.totalContribution)
      .toBeCloseTo(1280, 2);
  });

  it("adds the extra contribution from its configured age", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      monthlyEmployeeContribution: 1000,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0,
      extraContributionAge: 53,
      extraMonthlyContribution: 650,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        72,
        100000
      );

    new MonthlyContributionStep().execute(context);

    expect(context.employeeContribution)
      .toBe(1650);

    expect(context.totalContribution)
      .toBe(1900);
  });
});