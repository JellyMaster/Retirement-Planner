import { describe, expect, it } from "vitest";

import { getEndingBalanceTarget } from "./DrawdownEndingBalanceGoal";

describe("getEndingBalanceTarget", () => {
  it("preserves the full drawdown pot available at retirement", () => {
    expect(
      getEndingBalanceTarget(500_000, 0.025, 25, {
        mode: "preserve",
        percentage: 1,
      }),
    ).toBe(500_000);
  });

  it("retains a chosen percentage of the retirement drawdown pot", () => {
    expect(
      getEndingBalanceTarget(500_000, 0.025, 25, {
        mode: "percentage",
        percentage: 0.5,
      }),
    ).toBe(250_000);
  });

  it("does not inflation-grow the reserve target", () => {
    expect(
      getEndingBalanceTarget(500_000, 0.1, 40, {
        mode: "percentage",
        percentage: 0.8,
      }),
    ).toBe(400_000);
  });

  it("allows the pot to reach zero at the planning age", () => {
    expect(
      getEndingBalanceTarget(500_000, 0.025, 25, {
        mode: "spend-to-zero",
        percentage: 0,
      }),
    ).toBe(0);
  });
});
