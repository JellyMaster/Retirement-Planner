import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";

export interface SustainabilityDrawdownOptions {
  endAge?: number;
  taxFreeCash?: number;
}

/**
 * Builds a drawdown plan in today's-money terms from the accumulation plan.
 * Using a real expected return and zero drawdown inflation keeps the projected
 * balance, income goal and State Pension on one consistent basis.
 */
export function createSustainabilityDrawdownInputs(
  inputs: PensionInputs,
  projection: ProjectionResult,
  goals: RetirementGoals,
  options: SustainabilityDrawdownOptions = {},
): DrawdownInputs {
  const realAnnualReturn =
    (1 + inputs.annualReturn) / (1 + inputs.inflation) - 1;

  return {
    startingBalance: projection.finalBalance.real,
    retirementAge: inputs.retirementAge,
    endAge: Math.max(inputs.retirementAge + 1, options.endAge ?? 95),
    withdrawalStrategy: "target-income",
    withdrawalRate: 0.04,
    desiredAnnualIncome: goals.desiredAnnualIncome,
    incomeTargetMode: "gross",
    annualStatePension: goals.includeStatePension
      ? goals.statePensionAnnualAmount
      : 0,
    statePensionAge: goals.statePensionAge,
    annualReturn: Math.max(-0.99, realAnnualReturn),
    annualFee: inputs.annualFee,
    inflationRate: 0,
    taxFreeCash: Math.max(0, options.taxFreeCash ?? 0),
  };
}
