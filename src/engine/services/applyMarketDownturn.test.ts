import { describe, expect, it } from "vitest";

import { ProjectionResultFactory } from "../factories/ProjectionResultFactory";
import type { PensionInputs } from "../models/PensionInputs";
import { applyMarketDownturn } from "./applyMarketDownturn";

const inputs: PensionInputs = {
  currentAge: 47,
  retirementAge: 50,
  currentPot: 100_000,
  monthlyEmployeeContribution: 0,
  monthlyEmployerContribution: 0,
  annualContributionIncrease: 0,
  annualReturn: 0.05,
  annualFee: 0,
  inflation: 0,
};

const projection = ProjectionResultFactory.create([
  createYear(48, 100_000, 105_000),
  createYear(49, 105_000, 110_250),
  createYear(50, 110_250, 115_762.5),
]);

describe("applyMarketDownturn", () => {
  it("returns the original projection when no downturn is configured", () => {
    expect(applyMarketDownturn(projection, inputs)).toBe(projection);
  });

  it("applies a one-off fall and carries the lost capital to retirement", () => {
    const stressed = applyMarketDownturn(projection, {
      ...inputs,
      marketDownturnAge: 49,
      marketDownturnPercentage: 0.2,
    });

    expect(stressed.years[0].closingBalance.real).toBe(105_000);
    expect(stressed.years[1].closingBalance.real).toBeCloseTo(88_200);
    expect(stressed.finalBalance.real).toBeLessThan(projection.finalBalance.real);
    expect(stressed.finalBalance.real).toBeCloseTo(92_610);
  });
});

function createYear(age: number, opening: number, closing: number) {
  return {
    yearIndex: age - 47,
    age,
    openingBalance: { nominal: opening, real: opening },
    contributions: { nominal: 0, real: 0 },
    investmentGrowth: {
      nominal: closing - opening,
      real: closing - opening,
    },
    fees: { nominal: 0, real: 0 },
    closingBalance: { nominal: closing, real: closing },
  };
}
