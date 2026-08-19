import { describe, expect, it } from "vitest";

import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const baseInputs: DrawdownInputs = {
  startingBalance: 750_000,
  retirementAge: 65,
  endAge: 90,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 40_000,
  incomeTargetMode: "gross",
  annualStatePension: 0,
  statePensionAge: 67,
  annualReturn: 0.04,
  annualFee: 0.0025,
  inflationRate: 0.02,
  taxFreeCash: 0,
};

describe("DrawdownEngine spending phases", () => {
  it("changes the real spending target when each saved phase begins", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      spendingPhases: [
        { startAge: 65, annualIncome: 40_000, label: "Active years" },
        { startAge: 75, annualIncome: 34_000, label: "Slower years" },
        { startAge: 85, annualIncome: 28_000, label: "Later life" },
      ],
    });

    const desiredAt = (age: number) =>
      result.years.find((year) => year.age === age)?.desiredIncome;
    const inflationAt = (age: number) => 1.02 ** (age - 65);

    expect(desiredAt(65)).toBeCloseTo(40_000 * inflationAt(65), 2);
    expect(desiredAt(74)).toBeCloseTo(40_000 * inflationAt(74), 2);
    expect(desiredAt(75)).toBeCloseTo(34_000 * inflationAt(75), 2);
    expect(desiredAt(84)).toBeCloseTo(34_000 * inflationAt(84), 2);
    expect(desiredAt(85)).toBeCloseTo(28_000 * inflationAt(85), 2);
  });

  it("uses the withdrawal rate from the active phase for percentage drawdown", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      startingBalance: 100_000,
      retirementAge: 65,
      endAge: 68,
      withdrawalStrategy: "percentage",
      withdrawalRate: 0.04,
      annualReturn: 0,
      annualFee: 0,
      inflationRate: 0,
      spendingPhases: [
        {
          startAge: 65,
          annualIncome: 40_000,
          withdrawalRate: 0.04,
          label: "Active years",
        },
        {
          startAge: 66,
          annualIncome: 40_000,
          withdrawalRate: 0.02,
          label: "Settled years",
        },
      ],
    });

    expect(result.years.find((year) => year.age === 65)?.pensionWithdrawal).toBe(4_000);
    expect(result.years.find((year) => year.age === 66)?.pensionWithdrawal).toBe(1_920);
  });

  it("inflates the flat target when no phases are saved", () => {
    const result = new DrawdownEngine().calculate(baseInputs);

    for (const year of result.years) {
      const inflationMultiplier = 1.02 ** (year.age - baseInputs.retirementAge);
      expect(year.desiredIncome).toBeCloseTo(
        baseInputs.desiredAnnualIncome * inflationMultiplier,
        2,
      );
    }
  });
});
