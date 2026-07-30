import { describe, expect, it } from "vitest";

import { convertAnnualRateToMonthlyRate } from "./convertAnnualRateToMonthlyRate";

describe("convertAnnualRateToMonthlyRate", () => {
  it("converts an annual rate to its equivalent monthly rate", () => {
    const monthlyRate =
      convertAnnualRateToMonthlyRate(0.12);

    expect(
      Math.pow(1 + monthlyRate, 12) - 1
    ).toBeCloseTo(0.12, 10);
  });

  it("returns zero for a zero annual rate", () => {
    expect(
      convertAnnualRateToMonthlyRate(0)
    ).toBe(0);
  });

  it("supports negative annual returns", () => {
    const monthlyRate =
      convertAnnualRateToMonthlyRate(-0.12);

    expect(
      Math.pow(1 + monthlyRate, 12) - 1
    ).toBeCloseTo(-0.12, 10);
  });

  it("throws for a rate of negative one", () => {
    expect(() =>
      convertAnnualRateToMonthlyRate(-1)
    ).toThrow(RangeError);
  });
});