import { describe, expect, it } from "vitest";
import { calculateInvestmentGrowth } from "./calculateInvestmentGrowth";

describe("calculateInvestmentGrowth", () => {
  it("calculates 5% growth", () => {
    expect(
      calculateInvestmentGrowth(100000, 0.05)
    ).toBe(5000);
  });

  it("returns zero for zero balance", () => {
    expect(
      calculateInvestmentGrowth(0, 0.05)
    ).toBe(0);
  });
});