import { type PensionInputs } from "../models/PensionInputs";

export function createPensionInputs(
  overrides: Partial<PensionInputs> = {}
): PensionInputs {
  return {
    currentAge: 47,
    retirementAge: 67,

    currentPot: 100000,

    monthlyEmployeeContribution: 500,
    monthlyEmployerContribution: 250,

    annualContributionIncrease: 0,

    annualReturn: 0.05,
    annualFee: 0,
    inflation: 0,

    extraContributionAge: undefined,
    extraMonthlyContribution: undefined,

    ...overrides,
  };
}