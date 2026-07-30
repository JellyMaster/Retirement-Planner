import { describe, expect, it } from "vitest";

import { convertAnnualFeeToMonthlyRate } from "./convertAnnualFeeToMonthlyRate";

describe("convertAnnualFeeToMonthlyRate", () => {
  it("converts an annual fee into an equivalent monthly deduction rate", () => {
    const monthlyFeeRate =
      convertAnnualFeeToMonthlyRate(0.01);

    const remainingBalanceFactor =
      Math.pow(
        1 - monthlyFeeRate,
        12
      );

    expect(remainingBalanceFactor)
      .toBeCloseTo(0.99, 10);
  });

  it("returns zero for a zero annual fee", () => {
    expect(
      convertAnnualFeeToMonthlyRate(0)
    ).toBe(0);
  });

  it("rejects a negative fee", () => {
    expect(() =>
      convertAnnualFeeToMonthlyRate(-0.01)
    ).toThrow(
      "Annual fee must be at least 0 and below 100%."
    );
  });

  it("rejects a fee of one hundred percent", () => {
    expect(() =>
      convertAnnualFeeToMonthlyRate(1)
    ).toThrow(RangeError);
  });

  it("rejects non-finite values", () => {
    expect(() =>
      convertAnnualFeeToMonthlyRate(
        Number.NaN
      )
    ).toThrow(TypeError);
  });
});