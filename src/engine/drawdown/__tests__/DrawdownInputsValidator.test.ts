import { describe, expect, it } from "vitest";

import type { DrawdownInputs } from "../models/DrawdownInputs";
import { validateDrawdownInputs } from "../validators/DrawdownInputsValidator";

const validInputs: DrawdownInputs = {
  startingBalance: 500_000,
  retirementAge: 68,
  endAge: 95,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "gross",
  annualStatePension: 12_000,
  statePensionAge: 68,
  annualReturn: 0.05,
  annualFee: 0.0005,
  inflationRate: 0.025,
  taxFreeCash: 0,
};

describe("validateDrawdownInputs", () => {
  it("accepts valid inputs", () => {
    expect(validateDrawdownInputs(validInputs)).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it("rejects tax-free cash above the starting balance", () => {
    const result = validateDrawdownInputs({
      ...validInputs,
      taxFreeCash: 600_000,
    });

    expect(result.errors.taxFreeCash).toBeDefined();
  });

  it("rejects an end age that is not later than retirement age", () => {
    const result = validateDrawdownInputs({
      ...validInputs,
      endAge: 68,
    });

    expect(result.errors.endAge).toBeDefined();
  });
});
