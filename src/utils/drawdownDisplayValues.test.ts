import { describe, expect, it } from "vitest";

import {
  getInflationDiscountFactor,
  toDisplayValue,
} from "./drawdownDisplayValues";

describe("drawdown display values", () => {
  it("leaves nominal values unchanged", () => {
    expect(toDisplayValue(30_000, 10, 0.025, "nominal")).toBe(30_000);
  });

  it("keeps the first retirement year at its starting-money value", () => {
    expect(toDisplayValue(30_000, 0, 0.025, "today")).toBe(30_000);
  });

  it("discounts later values using compound inflation", () => {
    expect(getInflationDiscountFactor(2, 0.025)).toBeCloseTo(1.050625, 6);
    expect(toDisplayValue(31_518.75, 2, 0.025, "today")).toBeCloseTo(30_000, 2);
  });
});
