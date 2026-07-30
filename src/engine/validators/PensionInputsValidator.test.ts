import { describe, expect, it } from "vitest";

import { createPensionInputs } from "../test-data/createPensionInputs";
import { PensionInputsValidator } from "./PensionInputsValidator";

describe("PensionInputsValidator", () => {
  it("accepts valid pension inputs", () => {
    const inputs = createPensionInputs();

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).not.toThrow();
  });

  it("rejects retirement age below current age", () => {
    const inputs = createPensionInputs({
      currentAge: 50,
      retirementAge: 49
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(
       "Retirement age cannot be below current age."
    );
  });

 

  it("rejects a negative pension balance", () => {
    const inputs = createPensionInputs({
      currentPot: -1,
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(
      "Current pot cannot be negative."
    );
  });

  it("rejects negative contributions", () => {
    const inputs = createPensionInputs({
      monthlyEmployeeContribution: -100,
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(
      "Monthly employee contribution cannot be negative."
    );
  });

  it("rejects annual returns of negative one or below", () => {
    const inputs = createPensionInputs({
      annualReturn: -1,
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(
      "Annual return must be greater than -100%."
    );
  });

  it("rejects non-finite values", () => {
    const inputs = createPensionInputs({
      currentPot: Number.NaN,
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(TypeError);
  });

  it("rejects an extra contribution age below current age", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      extraContributionAge: 46,
      extraMonthlyContribution: 500,
    });

    expect(() =>
      PensionInputsValidator.validate(inputs)
    ).toThrow(
      "Extra contribution age cannot be below current age."
    );
  });

  it("allows extra contribution settings when already at retirement age", () => {
  const inputs = createPensionInputs({
    currentAge: 67,
    retirementAge: 67,
    extraContributionAge: 67,
    extraMonthlyContribution: 500,
  });

  expect(() =>
    PensionInputsValidator.validate(inputs)
  ).not.toThrow();
});
});