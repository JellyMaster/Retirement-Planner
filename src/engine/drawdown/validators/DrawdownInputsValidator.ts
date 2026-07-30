import type { DrawdownInputs } from "../models/DrawdownInputs";

export type DrawdownInputErrors = Partial<
  Record<keyof DrawdownInputs, string>
>;

export interface DrawdownValidationResult {
  isValid: boolean;
  errors: DrawdownInputErrors;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateDrawdownInputs(
  inputs: DrawdownInputs,
): DrawdownValidationResult {
  const errors: DrawdownInputErrors = {};

  if (!isFiniteNumber(inputs.startingBalance) || inputs.startingBalance < 0) {
    errors.startingBalance = "Starting balance must be zero or more.";
  }

  if (
    !Number.isInteger(inputs.retirementAge) ||
    inputs.retirementAge < 18 ||
    inputs.retirementAge > 100
  ) {
    errors.retirementAge =
      "Retirement age must be a whole number between 18 and 100.";
  }

  if (
    !Number.isInteger(inputs.endAge) ||
    inputs.endAge < 19 ||
    inputs.endAge > 120
  ) {
    errors.endAge = "End age must be a whole number between 19 and 120.";
  } else if (
    Number.isInteger(inputs.retirementAge) &&
    inputs.endAge <= inputs.retirementAge
  ) {
    errors.endAge = "End age must be later than retirement age.";
  }

  if (
    !isFiniteNumber(inputs.desiredAnnualIncome) ||
    inputs.desiredAnnualIncome < 0
  ) {
    errors.desiredAnnualIncome =
      "Desired annual income must be zero or more.";
  }

  if (
    !isFiniteNumber(inputs.annualStatePension) ||
    inputs.annualStatePension < 0
  ) {
    errors.annualStatePension =
      "State Pension income must be zero or more.";
  }

  if (
    !Number.isInteger(inputs.statePensionAge) ||
    inputs.statePensionAge < 18 ||
    inputs.statePensionAge > 120
  ) {
    errors.statePensionAge =
      "State Pension age must be a whole number between 18 and 120.";
  }

  if (
    !isFiniteNumber(inputs.annualReturn) ||
    inputs.annualReturn <= -1 ||
    inputs.annualReturn > 1
  ) {
    errors.annualReturn =
      "Annual return must be greater than -100% and no more than 100%.";
  }

  if (
    !isFiniteNumber(inputs.annualFee) ||
    inputs.annualFee < 0 ||
    inputs.annualFee > 0.1
  ) {
    errors.annualFee = "Annual fee must be between 0% and 10%.";
  }

  if (
    !isFiniteNumber(inputs.inflationRate) ||
    inputs.inflationRate <= -1 ||
    inputs.inflationRate > 1
  ) {
    errors.inflationRate =
      "Inflation must be greater than -100% and no more than 100%.";
  }

  if (!isFiniteNumber(inputs.taxFreeCash) || inputs.taxFreeCash < 0) {
    errors.taxFreeCash = "Tax-free cash must be zero or more.";
  } else if (
    isFiniteNumber(inputs.startingBalance) &&
    inputs.taxFreeCash > inputs.startingBalance
  ) {
    errors.taxFreeCash =
      "Tax-free cash cannot exceed the starting balance.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
