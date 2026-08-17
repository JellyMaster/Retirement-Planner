import { describe, expect, it } from "vitest";

import { getEndingBalanceTarget } from "./DrawdownEndingBalanceGoal";

describe("getEndingBalanceTarget", () => {
  it("preserves the full starting pot in today's-money terms", () => {
    expect(
      getEndingBalanceTarget(500_000, 0, 25, {
        mode: "preserve",
        percentage: 1,
      }),
    ).toBe(500_000);
  });

  it("retains a chosen percentage of the starting pot", () => {
    expect(
      getEndingBalanceTarget(500_000, 0, 25, {
        mode: "percentage",
        percentage: 0.5,
      }),
    ).toBe(250_000);
  });

  it("allows the pot to reach zero at the planning age", () => {
    expect(
      getEndingBalanceTarget(500_000, 0.025, 25, {
        mode: "spend-to-zero",
        percentage: 0,
      }),
    ).toBe(0);
  });

  it("inflation-adjusts a retained balance so purchasing power is preserved", () => {
    const target = getEndingBalanceTarget(500_000, 0.025, 25, {
      mode: "percentage",
      percentage: 0.5,
    });

    expect(target).toBeCloseTo(250_000 * 1.025 ** 24, 6);
  });
});
