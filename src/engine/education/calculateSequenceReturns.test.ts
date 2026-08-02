import { describe, expect, it } from "vitest";

import { calculateSequenceReturns } from "./calculateSequenceReturns";

const baseInput = {
  startingBalance: 600_000,
  annualWithdrawal: 35_000,
  retirementAge: 65,
  durationYears: 30,
  shockPercentage: 0.25,
  normalReturn: 0.05,
};

describe("calculateSequenceReturns", () => {
  it("uses the same return values and average in a different order", () => {
    const result = calculateSequenceReturns(baseInput);

    expect([...result.earlyLoss.returns].sort()).toEqual(
      [...result.lateLoss.returns].sort(),
    );
    expect(result.earlyLoss.arithmeticAverageReturn).toBeCloseTo(
      result.lateLoss.arithmeticAverageReturn,
      10,
    );
    expect(result.earlyLoss.compoundedReturn).toBeCloseTo(
      result.lateLoss.compoundedReturn,
      10,
    );
  });

  it("shows a worse ending balance when the loss happens early and withdrawals continue", () => {
    const result = calculateSequenceReturns(baseInput);

    expect(result.earlyLoss.endingBalance).toBeLessThan(
      result.lateLoss.endingBalance,
    );
    expect(result.endingBalanceDifference).toBeGreaterThan(0);
  });

  it("finishes with the same balance when there are no withdrawals", () => {
    const result = calculateSequenceReturns({
      ...baseInput,
      annualWithdrawal: 0,
    });

    expect(result.earlyLoss.endingBalance).toBeCloseTo(
      result.lateLoss.endingBalance,
      6,
    );
  });

  it("reports the age when the pension first runs out", () => {
    const result = calculateSequenceReturns({
      ...baseInput,
      startingBalance: 100_000,
      annualWithdrawal: 50_000,
      durationYears: 10,
    });

    expect(result.earlyLoss.depletionAge).not.toBeNull();
    expect(result.earlyLoss.years.find((year) => year.age === result.earlyLoss.depletionAge)?.closingBalance).toBe(0);
  });
});
