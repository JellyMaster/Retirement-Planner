import { describe, expect, it } from "vitest";

import { MonthlyProjectionContextFactory } from "../factories/MonthlyProjectionContextFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";
import { convertAnnualFeeToMonthlyRate } from "../utils/convertAnnualFeeToMonthlyRate";
import { MonthlyFeeStep } from "./MonthlyFeeStep";

describe("MonthlyFeeStep", () => {
  it("calculates the monthly fee", () => {
    const inputs = createPensionInputs({
      annualFee: 0.006,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    new MonthlyFeeStep().execute(context);

    const monthlyFeeRate =
      convertAnnualFeeToMonthlyRate(
        inputs.annualFee
      );

    const expectedFee =
      context.openingBalance *
      monthlyFeeRate;

    expect(context.fees)
      .toBeCloseTo(expectedFee, 10);
  });

  it("calculates no fee when the annual fee is zero", () => {
    const inputs = createPensionInputs({
      annualFee: 0,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    new MonthlyFeeStep().execute(context);

    expect(context.fees).toBe(0);
  });
});