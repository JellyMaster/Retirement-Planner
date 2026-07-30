import { describe, expect, it } from "vitest";
import { UkIncomeTaxEngine } from "../UkIncomeTaxEngine";
import { UK_INCOME_TAX_2026_27 } from "../config/ukIncomeTaxYears";
import type { UkIncomeTaxInputs } from "../models/UkIncomeTaxModels";

const engine = new UkIncomeTaxEngine();

function createInputs(
  overrides: Partial<UkIncomeTaxInputs> = {},
): UkIncomeTaxInputs {
  return {
    pensionWithdrawal: 0,
    taxFreePensionWithdrawal: 0,
    statePensionIncome: 0,
    otherTaxableIncome: 0,
    taxYear: UK_INCOME_TAX_2026_27,
    ...overrides,
  };
}

describe("UkIncomeTaxEngine", () => {
  it("returns zero tax when all income is within the Personal Allowance", () => {
    const result = engine.calculate(
      createInputs({ statePensionIncome: 12_000 }),
    );

    expect(result.personalAllowance).toBe(12_570);
    expect(result.taxableIncome).toBe(0);
    expect(result.incomeTax).toBe(0);
    expect(result.netIncome).toBe(12_000);
  });

  it("taxes pension income above the Personal Allowance at the basic rate", () => {
    const result = engine.calculate(
      createInputs({ pensionWithdrawal: 30_000 }),
    );

    expect(result.taxableIncome).toBe(17_430);
    expect(result.bands[0]).toMatchObject({
      name: "basic",
      taxableAmount: 17_430,
      tax: 3_486,
    });
    expect(result.incomeTax).toBe(3_486);
    expect(result.netIncome).toBe(26_514);
  });

  it("treats State Pension as taxable income", () => {
    const result = engine.calculate(
      createInputs({
        pensionWithdrawal: 18_000,
        statePensionIncome: 12_000,
      }),
    );

    expect(result.adjustedNetIncome).toBe(30_000);
    expect(result.incomeTax).toBe(3_486);
  });

  it("excludes tax-free pension income from taxable income", () => {
    const result = engine.calculate(
      createInputs({
        pensionWithdrawal: 30_000,
        taxFreePensionWithdrawal: 7_500,
      }),
    );

    expect(result.grossIncome).toBe(30_000);
    expect(result.taxFreePensionIncome).toBe(7_500);
    expect(result.taxablePensionIncome).toBe(22_500);
    expect(result.taxableIncome).toBe(9_930);
    expect(result.incomeTax).toBe(1_986);
    expect(result.netIncome).toBe(28_014);
  });

  it("uses the higher rate above the £50,270 gross threshold", () => {
    const result = engine.calculate(
      createInputs({ pensionWithdrawal: 60_000 }),
    );

    expect(result.bands[0].taxableAmount).toBe(37_700);
    expect(result.bands[1].taxableAmount).toBe(9_730);
    expect(result.incomeTax).toBe(11_432);
    expect(result.marginalTaxRate).toBe(0.4);
  });

  it("tapers the Personal Allowance by £1 for every £2 above £100,000", () => {
    const result = engine.calculate(
      createInputs({ pensionWithdrawal: 110_000 }),
    );

    expect(result.personalAllowance).toBe(7_570);
    expect(result.taxableIncome).toBe(102_430);
  });

  it("removes the Personal Allowance completely at £125,140", () => {
    const result = engine.calculate(
      createInputs({ pensionWithdrawal: 125_140 }),
    );

    expect(result.personalAllowance).toBe(0);
    expect(result.taxableIncome).toBe(125_140);
    expect(result.incomeTax).toBe(42_516);
  });

  it("uses the additional rate above £125,140", () => {
    const result = engine.calculate(
      createInputs({ pensionWithdrawal: 130_000 }),
    );

    expect(result.bands[2].taxableAmount).toBe(4_860);
    expect(result.bands[2].tax).toBe(2_187);
    expect(result.incomeTax).toBe(44_703);
    expect(result.marginalTaxRate).toBe(0.45);
  });

  it("combines pension, State Pension and other taxable income", () => {
    const result = engine.calculate(
      createInputs({
        pensionWithdrawal: 20_000,
        taxFreePensionWithdrawal: 5_000,
        statePensionIncome: 12_000,
        otherTaxableIncome: 3_000,
      }),
    );

    expect(result.grossIncome).toBe(35_000);
    expect(result.adjustedNetIncome).toBe(30_000);
    expect(result.incomeTax).toBe(3_486);
    expect(result.netIncome).toBe(31_514);
  });

  it("rejects tax-free pension income above the pension withdrawal", () => {
    expect(() =>
      engine.calculate(
        createInputs({
          pensionWithdrawal: 5_000,
          taxFreePensionWithdrawal: 6_000,
        }),
      ),
    ).toThrow(/cannot exceed the pension withdrawal/i);
  });

  it("rejects negative and non-finite income values", () => {
    expect(() =>
      engine.calculate(createInputs({ pensionWithdrawal: -1 })),
    ).toThrow(/must be zero or more/i);

    expect(() =>
      engine.calculate(createInputs({ otherTaxableIncome: Number.NaN })),
    ).toThrow(/must be zero or more/i);
  });
});
