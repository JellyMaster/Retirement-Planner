import type {
  UkIncomeTaxInputs,
  UkIncomeTaxYearConfig,
} from "../models/UkIncomeTaxModels";

export type UkIncomeTaxInputErrors = Partial<
  Record<keyof UkIncomeTaxInputs | "taxYearConfig", string>
>;

export interface UkIncomeTaxValidationResult {
  isValid: boolean;
  errors: UkIncomeTaxInputErrors;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isValidTaxYear(config: UkIncomeTaxYearConfig): boolean {
  return (
    typeof config?.id === "string" &&
    config.id.length > 0 &&
    typeof config?.label === "string" &&
    config.label.length > 0 &&
    isNonNegativeFiniteNumber(config.personalAllowance) &&
    isNonNegativeFiniteNumber(config.personalAllowanceTaperThreshold) &&
    isRate(config.personalAllowanceTaperRate) &&
    isNonNegativeFiniteNumber(config.basicRateBand) &&
    isNonNegativeFiniteNumber(config.additionalRateThreshold) &&
    config.additionalRateThreshold >= config.basicRateBand &&
    isRate(config.basicRate) &&
    isRate(config.higherRate) &&
    isRate(config.additionalRate) &&
    config.basicRate <= config.higherRate &&
    config.higherRate <= config.additionalRate &&
    config.jurisdiction === "england-wales-northern-ireland"
  );
}

export function validateUkIncomeTaxInputs(
  inputs: UkIncomeTaxInputs,
): UkIncomeTaxValidationResult {
  const errors: UkIncomeTaxInputErrors = {};

  if (!isNonNegativeFiniteNumber(inputs.pensionWithdrawal)) {
    errors.pensionWithdrawal = "Pension withdrawal must be zero or more.";
  }

  if (!isNonNegativeFiniteNumber(inputs.taxFreePensionWithdrawal)) {
    errors.taxFreePensionWithdrawal =
      "Tax-free pension withdrawal must be zero or more.";
  } else if (
    isNonNegativeFiniteNumber(inputs.pensionWithdrawal) &&
    inputs.taxFreePensionWithdrawal > inputs.pensionWithdrawal
  ) {
    errors.taxFreePensionWithdrawal =
      "Tax-free pension withdrawal cannot exceed the pension withdrawal.";
  }

  if (!isNonNegativeFiniteNumber(inputs.statePensionIncome)) {
    errors.statePensionIncome = "State Pension income must be zero or more.";
  }

  if (!isNonNegativeFiniteNumber(inputs.otherTaxableIncome)) {
    errors.otherTaxableIncome = "Other taxable income must be zero or more.";
  }

  if (!isValidTaxYear(inputs.taxYear)) {
    errors.taxYearConfig = "The tax-year configuration is invalid.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
