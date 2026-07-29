import { describe, expect, it } from "vitest";
import { calculateAnnualFees } from "./calculateAnnualFees";

describe("calculateAnnualFees", () => {
  it("calculates a 0.5% fee", () => {
    expect(
      calculateAnnualFees(100000, 0.005)
    ).toBe(500);
  });

  it("returns zero when there is no fee", () => {
    expect(
      calculateAnnualFees(100000, 0)
    ).toBe(0);
  });
});