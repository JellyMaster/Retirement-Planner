import type { PensionInputs } from "../engine/models/PensionInputs";
import { loadStoredPensionInputs } from "../state/planStorage";

const baseDefaultPensionInputs: PensionInputs = {
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

export const defaultPensionInputs: PensionInputs =
  loadStoredPensionInputs(baseDefaultPensionInputs);
