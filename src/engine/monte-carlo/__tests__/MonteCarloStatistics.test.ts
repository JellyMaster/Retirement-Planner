import { describe, expect, it } from "vitest";
import { calculatePercentiles, percentile } from "../MonteCarloStatistics";

describe("MonteCarloStatistics", () => {
  it("interpolates percentiles", () => {
    expect(percentile([0, 10, 20, 30, 40], 0.25)).toBe(10);
    expect(percentile([0, 10, 20, 30], 0.5)).toBe(15);
  });

  it("returns the standard percentile set", () => {
    expect(calculatePercentiles([0, 10, 20, 30, 40])).toEqual({
      p10: 4,
      p25: 10,
      p50: 20,
      p75: 30,
      p90: 36,
    });
  });
});
