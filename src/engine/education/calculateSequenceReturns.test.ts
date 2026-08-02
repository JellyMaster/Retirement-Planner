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
  it("uses the same return values and averages in all three orders", () => {
    const result = calculateSequenceReturns(baseInput);
    const sortedEarlyReturns = [...result.earlyLoss.returns].sort();

    expect([...result.midLoss.returns].sort()).toEqual(sortedEarlyReturns);
    expect([...result.lateLoss.returns].sort()).toEqual(sortedEarlyReturns);
    expect(result.earlyLoss.arithmeticAverageReturn).toBeCloseTo(
      result.midLoss.arithmeticAverageReturn,
      10,
    );
    expect(result.earlyLoss.arithmeticAverageReturn).toBeCloseTo(
      result.lateLoss.arithmeticAverageReturn,
      10,
    );
    expect(result.earlyLoss.compoundedReturn).toBeCloseTo(
      result.midLoss.compoundedReturn,
      10,
    );
    expect(result.earlyLoss.compoundedReturn).toBeCloseTo(
      result.lateLoss.compoundedReturn,
      10,
    );
  });

  it("places the shared market fall at the start, midpoint and end", () => {
    const result = calculateSequenceReturns(baseInput);
    const midpoint = Math.floor((baseInput.durationYears - 1) / 2);

    expect(result.earlyLoss.returns[0]).toBe(-baseInput.shockPercentage);
    expect(result.midLoss.returns[midpoint]).toBe(-baseInput.shockPercentage);
    expect(result.lateLoss.returns.at(-1)).toBe(-baseInput.shockPercentage);
  });

  it("shows the midpoint outcome between early and late losses when withdrawals continue", () => {
    const result = calculateSequenceReturns(baseInput);

    expect(result.earlyLoss.endingBalance).toBeLessThan(
      result.midLoss.endingBalance,
    );
    expect(result.midLoss.endingBalance).toBeLessThan(
      result.lateLoss.endingBalance,
    );
    expect(result.midEndingBalanceDifference).toBeGreaterThan(0);
    expect(result.endingBalanceDifference).toBeGreaterThan(
      result.midEndingBalanceDifference,
    );
  });

  it("finishes with the same balance in every order when there are no withdrawals", () => {
    const result = calculateSequenceReturns({
      ...baseInput,
      annualWithdrawal: 0,
    });

    expect(result.earlyLoss.endingBalance).toBeCloseTo(
      result.midLoss.endingBalance,
      6,
    );
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
    expect(
      result.earlyLoss.years.find(
        (year) => year.age === result.earlyLoss.depletionAge,
      )?.closingBalance,
    ).toBe(0);
  });
});
