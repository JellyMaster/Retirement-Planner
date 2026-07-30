import { describe, expect, it } from "vitest";

import { MonthlyProjectionContextFactory } from "../factories/MonthlyProjectionContextFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";
import { convertAnnualRateToMonthlyRate } from "../utils/convertAnnualRateToMonthlyRate";
import { MonthlyInvestmentGrowthStep } from "./MonthlyInvestmentGrowthStep";

describe("MonthlyInvestmentGrowthStep", () => {
  it("calculates monthly investment growth", () => {
    const inputs = createPensionInputs({
      annualReturn: 0.06,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    new MonthlyInvestmentGrowthStep()
      .execute(context);

    const expectedGrowth =
      100000 *
      convertAnnualRateToMonthlyRate(0.06);

    expect(context.investmentGrowth)
      .toBeCloseTo(expectedGrowth, 10);
  });

  it("supports negative investment growth", () => {
    const inputs = createPensionInputs({
      annualReturn: -0.12,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    new MonthlyInvestmentGrowthStep()
      .execute(context);

    expect(context.investmentGrowth)
      .toBeLessThan(0);
  });
});