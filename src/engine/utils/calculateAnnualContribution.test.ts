import { describe, expect, it } from "vitest";
import { calculateAnnualContribution } from "./calculateAnnualContribution";

describe("calculateAnnualContribution", () => {
  it("calculates the annual contribution", () => {
    const result = calculateAnnualContribution(
      1125.70,
      261.79
    );

    expect(result).toBeCloseTo(16649.88, 2);
  });

  it("returns zero when no contributions exist", () => {
    expect(calculateAnnualContribution(0, 0)).toBe(0);
  });
});