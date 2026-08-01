import type { PensionInputs } from "../../engine/models/PensionInputs";
import { RetirementComparisonEngine } from "../../engine/services/RetirementComparisonEngine";
import { hasPensionInputErrors, validatePensionInputs } from "../../validation/validatePensionInputs";
import type { Scenario } from "./Scenario";

export interface ScenarioSummary {
  scenario: Scenario;
  monthlyContribution: number;
  projectedPot: number | null;
  totalContributions: number | null;
  investmentGrowth: number | null;
  totalFees: number | null;
  isValid: boolean;
}

function calculateProjection(inputs: PensionInputs) {
  const errors = validatePensionInputs(inputs);
  if (hasPensionInputErrors(errors)) return null;
  return RetirementComparisonEngine.calculate(inputs).projection;
}

export function calculateScenarioSummary(scenario: Scenario): ScenarioSummary {
  const projection = calculateProjection(scenario.inputs);

  return {
    scenario,
    monthlyContribution:
      scenario.inputs.monthlyEmployeeContribution +
      scenario.inputs.monthlyEmployerContribution,
    projectedPot: projection?.finalBalance.real ?? null,
    totalContributions: projection?.totalContributions.real ?? null,
    investmentGrowth: projection?.totalInvestmentGrowth.real ?? null,
    totalFees: projection?.totalFees.real ?? null,
    isValid: projection !== null,
  };
}
