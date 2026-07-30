import type { PensionInputs } from "../engine/models/PensionInputs";

export interface PensionInputErrors {
  currentAge?: string;
  retirementAge?: string;
  currentPot?: string;
  monthlyEmployeeContribution?: string;
  monthlyEmployerContribution?: string;
  annualContributionIncrease?: string;
  annualReturn?: string;
  annualFee?: string;
  inflation?: string;
  extraContributionAge?: string;
  extraMonthlyContribution?: string;
}

export function validatePensionInputs(
  inputs: PensionInputs
): PensionInputErrors {
  const errors: PensionInputErrors = {};

 if (!Number.isFinite(inputs.currentAge)) {
  errors.currentAge = "Enter your current age.";
} else if (!Number.isInteger(inputs.currentAge)) {
  errors.currentAge =
    "Current age must be a whole number.";
} else if (
  inputs.currentAge < 18 ||
  inputs.currentAge > 100
) {
  errors.currentAge =
    "Current age must be between 18 and 100.";
}

 if (!Number.isFinite(inputs.retirementAge)) {
  errors.retirementAge =
    "Enter your retirement age.";
} else if (
  !Number.isInteger(inputs.retirementAge)
) {
  errors.retirementAge =
    "Retirement age must be a whole number.";
} else if (
  inputs.retirementAge < inputs.currentAge
) {
  errors.retirementAge =
    "Retirement age cannot be lower than current age.";
} else if (inputs.retirementAge > 100) {
  errors.retirementAge =
    "Retirement age cannot be greater than 100.";
}

  if (
    !Number.isFinite(inputs.currentPot) ||
    inputs.currentPot < 0
  ) {
    errors.currentPot =
      "Current pension pot cannot be negative.";
  }

  if (
    !Number.isFinite(
      inputs.monthlyEmployeeContribution
    ) ||
    inputs.monthlyEmployeeContribution < 0
  ) {
    errors.monthlyEmployeeContribution =
      "Your monthly contribution cannot be negative.";
  }

  if (
    !Number.isFinite(
      inputs.monthlyEmployerContribution
    ) ||
    inputs.monthlyEmployerContribution < 0
  ) {
    errors.monthlyEmployerContribution =
      "Employer contribution cannot be negative.";
  }

  if (
    !Number.isFinite(
      inputs.annualContributionIncrease
    ) ||
    inputs.annualContributionIncrease < 0 ||
    inputs.annualContributionIncrease > 0.2
  ) {
    errors.annualContributionIncrease =
      "Contribution increase must be between 0% and 20%.";
  }

  if (
    !Number.isFinite(inputs.annualReturn) ||
    inputs.annualReturn < 0 ||
    inputs.annualReturn > 0.2
  ) {
    errors.annualReturn =
      "Annual return must be between 0% and 20%.";
  }

  if (
    !Number.isFinite(inputs.annualFee) ||
    inputs.annualFee < 0 ||
    inputs.annualFee > 0.05
  ) {
    errors.annualFee =
      "Annual fee must be between 0% and 5%.";
  }

  if (
    !Number.isFinite(inputs.inflation) ||
    inputs.inflation < 0 ||
    inputs.inflation > 0.15
  ) {
    errors.inflation =
      "Inflation must be between 0% and 15%.";
  }

  const hasExtraContributionAge =
  inputs.extraContributionAge !== undefined;

const hasExtraMonthlyContribution =
  inputs.extraMonthlyContribution !== undefined;

/*
 * The age and amount must either both be supplied
 * or both be absent.
 */
if (
  hasExtraContributionAge &&
  !hasExtraMonthlyContribution
) {
  errors.extraMonthlyContribution =
    "Enter the extra monthly contribution.";
}

if (
  hasExtraMonthlyContribution &&
  !hasExtraContributionAge
) {
  errors.extraContributionAge =
    "Enter the age when extra contributions begin.";
}

if (inputs.extraContributionAge !== undefined) {
  if (!Number.isFinite(inputs.extraContributionAge)) {
    errors.extraContributionAge =
      "Enter a valid starting age.";
  } else if (
    !Number.isInteger(inputs.extraContributionAge)
  ) {
    errors.extraContributionAge =
      "Start age must be a whole number.";
  } else if (
    inputs.extraContributionAge <
    inputs.currentAge
  ) {
    errors.extraContributionAge =
      "Start age cannot be lower than current age.";
  } else if (
    inputs.retirementAge !==
      inputs.currentAge &&
    inputs.extraContributionAge >=
      inputs.retirementAge
  ) {
    errors.extraContributionAge =
      "Start age must be before retirement age.";
  }
}

if (
  inputs.extraMonthlyContribution !== undefined
) {
  if (
    !Number.isFinite(
      inputs.extraMonthlyContribution
    )
  ) {
    errors.extraMonthlyContribution =
      "Enter a valid extra contribution.";
  } else if (
    inputs.extraMonthlyContribution < 0
  ) {
    errors.extraMonthlyContribution =
      "Extra contribution cannot be negative.";
  }
}

  return errors;
}

export function hasPensionInputErrors(
  errors: PensionInputErrors
): boolean {
  return Object.values(errors).some(Boolean);
}