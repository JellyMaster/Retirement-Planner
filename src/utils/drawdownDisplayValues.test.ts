import { describe, expect, it } from "vitest";

import type { DrawdownYear } from "../engine/drawdown/models/DrawdownYear";
import {
  getDisplayYears,
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

  it("uses the next time point for an end-of-year balance in today's money", () => {
    const years = getDisplayYears(
      [makeYear({ age: 60, openingBalance: 500_000, closingBalance: 512_500 })],
      0.025,
      "today",
    );

    expect(years[0].openingBalance).toBeCloseTo(500_000, 2);
    expect(years[0].closingBalance).toBeCloseTo(500_000, 2);
  });

  it("keeps one year's closing balance equal to the next year's opening balance in today's money", () => {
    const years = getDisplayYears(
      [
        makeYear({ age: 60, year: 2040, openingBalance: 500_000, closingBalance: 512_500 }),
        makeYear({ age: 61, year: 2041, openingBalance: 512_500, closingBalance: 525_312.5 }),
      ],
      0.025,
      "today",
    );

    expect(years[0].closingBalance).toBeCloseTo(years[1].openingBalance, 8);
  });

  it("keeps one year's closing balance equal to the next year's opening balance in future money", () => {
    const years = getDisplayYears(
      [
        makeYear({ age: 60, year: 2040, openingBalance: 500_000, closingBalance: 512_500 }),
        makeYear({ age: 61, year: 2041, openingBalance: 512_500, closingBalance: 525_312.5 }),
      ],
      0.025,
      "nominal",
    );

    expect(years[0].closingBalance).toBe(years[1].openingBalance);
  });
});

function makeYear(overrides: Partial<DrawdownYear>): DrawdownYear {
  return {
    year: 2040,
    age: 60,
    openingBalance: 500_000,
    desiredIncome: 30_000,
    incomeTargetMode: "net",
    statePensionIncome: 0,
    requiredPensionWithdrawal: 30_000,
    pensionWithdrawal: 30_000,
    grossIncome: 30_000,
    taxableIncome: 30_000,
    personalAllowance: 12_570,
    incomeTax: 3_486,
    netIncome: 26_514,
    effectiveTaxRate: 0.1162,
    netIncomeShortfall: 0,
    incomeShortfall: 0,
    investmentGrowth: 40_000,
    fees: 4_000,
    closingBalance: 506_000,
    isDepleted: false,
    ...overrides,
  };
}
