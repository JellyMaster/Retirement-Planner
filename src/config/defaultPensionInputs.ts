import type { PensionInputs } from "../engine/models/PensionInputs";

export const defaultPensionInputs: PensionInputs = {
  currentAge: 47,
  retirementAge: 68,

  currentPot: 200_000,

  monthlyEmployeeContribution: 750,
  monthlyEmployerContribution: 375,

  annualContributionIncrease: 0.03,

  annualReturn: 0.05,
  annualFee: 0.0005,
  inflation: 0.02,

  extraContributionAge: undefined,
  extraMonthlyContribution: undefined,
};