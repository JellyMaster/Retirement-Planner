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
  it("changes the desired income when each saved phase begins", () => {
    const result = new DrawdownEngine().calculate({
      ...baseInputs,
      spendingPhases: [
        { startAge: 65, annualIncome: 40_000, label: "Active years" },
        { startAge: 75, annualIncome: 34_000, label: "Slower years" },
        { startAge: 85, annualIncome: 28_000, label: "Later life" },
      ],
    });

    expect(result.years.find((year) => year.age === 65)?.desiredIncome).toBe(40_000);
    expect(result.years.find((year) => year.age === 74)?.desiredIncome).toBe(40_000);
    expect(result.years.find((year) => year.age === 75)?.desiredIncome).toBe(34_000);
    expect(result.years.find((year) => year.age === 84)?.desiredIncome).toBe(34_000);
    expect(result.years.find((year) => year.age === 85)?.desiredIncome).toBe(28_000);
  });

  it("continues to use the flat target when no phases are saved", () => {
    const result = new DrawdownEngine().calculate(baseInputs);

    expect(result.years.every((year) => year.desiredIncome === 40_000)).toBe(true);
  });
});
