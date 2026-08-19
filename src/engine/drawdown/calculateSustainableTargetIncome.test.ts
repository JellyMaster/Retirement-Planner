import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "./DrawdownEngine";
import { calculateSustainableTargetIncome } from "./calculateSustainableTargetIncome";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const baseInputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 65,
  endAge: 90,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "gross",
  annualStatePension: 0,
  statePensionAge: 67,
  annualReturn: 0,
  annualFee: 0,
  inflationRate: 0,
  taxFreeCash: 0,
};

describe("calculateSustainableTargetIncome", () => {
  it("finds the highest flat target that reaches the planning age without a shortfall", () => {
    const sustainableIncome = calculateSustainableTargetIncome(baseInputs);
    expect(sustainableIncome).toBe(19_230);

    const sustainableResult = new DrawdownEngine().calculate({
      ...baseInputs,
      desiredAnnualIncome: sustainableIncome,
    });
    const unsustainableResult = new DrawdownEngine().calculate({
      ...baseInputs,
      desiredAnnualIncome: sustainableIncome + 1,
    });

    expect(sustainableResult.depletionAge).toBeNull();
    expect(sustainableResult.firstShortfallAge).toBeNull();
    expect(unsustainableResult.firstShortfallAge).not.toBeNull();
  });

  it("can preserve the full retirement pot", () => {
    expect(
      calculateSustainableTargetIncome(baseInputs, {
        endingBalanceGoal: { mode: "preserve", percentage: 1 },
      }),
    ).toBe(0);
  });

  it("can retain a percentage of the retirement pot", () => {
    expect(
      calculateSustainableTargetIncome(baseInputs, {
        endingBalanceGoal: { mode: "percentage", percentage: 0.5 },
      }),
    ).toBe(9_615);
  });

  it("can deliberately spend the retirement pot down to zero at the planning age", () => {
    expect(
      calculateSustainableTargetIncome(baseInputs, {
        endingBalanceGoal: { mode: "spend-to-zero", percentage: 0 },
      }),
    ).toBe(19_230);
  });

  it("includes State Pension when finding the sustainable gross target", () => {
    expect(
      calculateSustainableTargetIncome({
        ...baseInputs,
        annualStatePension: 10_000,
        statePensionAge: 65,
      }),
    ).toBe(29_230);
  });

  it("preserves the relative shape of retirement spending phases", () => {
    expect(
      calculateSustainableTargetIncome({
        ...baseInputs,
        startingBalance: 420_000,
        spendingPhases: [
          { startAge: 65, annualIncome: 30_000, label: "Active years" },
          { startAge: 75, annualIncome: 24_000, label: "Slower years" },
          { startAge: 85, annualIncome: 18_000, label: "Later life" },
        ],
      }),
    ).toBe(19_444);
  });

  it("supports net income targets", () => {
    const sustainableIncome = calculateSustainableTargetIncome({
      ...baseInputs,
      startingBalance: 250_000,
      incomeTargetMode: "net",
      desiredAnnualIncome: 10_000,
    });

    expect(sustainableIncome).toBeGreaterThan(0);
  });

  it("rejects percentage withdrawal plans", () => {
    expect(() =>
      calculateSustainableTargetIncome({
        ...baseInputs,
        withdrawalStrategy: "percentage",
      }),
    ).toThrow(/target-income withdrawal strategy/i);
  });

  it("rejects an invalid search tolerance", () => {
    expect(() =>
      calculateSustainableTargetIncome(baseInputs, { tolerance: 0 }),
    ).toThrow(/tolerance must be greater than zero/i);
  });
});
