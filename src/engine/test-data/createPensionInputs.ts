import { type PensionInputs } from "../models/PensionInputs";

export function createPensionInputs(
  overrides: Partial<PensionInputs> = {}
): PensionInputs {
  return {
    currentAge: 25,
    retirementAge: 68,

    currentPot: 100000,

    monthlyEmployeeContribution: 0,
    monthlyEmployerContribution: 0,

    annualContributionIncrease: 0,

    annualReturn: 0.27,
    annualFee: 0,
    inflation: 0,

    extraContributionAge: undefined,
    extraMonthlyContribution: undefined,

    ...overrides,
  };
}