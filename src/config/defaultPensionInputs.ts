import type { PensionInputs } from "../engine/models/PensionInputs";

export const defaultPensionInputs: PensionInputs = {
  currentAge: 25,
  retirementAge: 68,

  currentPot: 0,

  monthlyEmployeeContribution: 100,
  monthlyEmployerContribution: 25,

  annualContributionIncrease: 0.00,

  annualReturn: 0.05,
  annualFee: 0.0027,
  inflation: 0.02,

  extraContributionAge: undefined,
  extraMonthlyContribution: undefined,
};