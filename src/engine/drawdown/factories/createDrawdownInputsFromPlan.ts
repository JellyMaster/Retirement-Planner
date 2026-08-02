import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import type { RetirementGoals } from "../../models/RetirementGoals";
import type { PensionInputs } from "../../models/PensionInputs";
import type { ProjectionResult } from "../../models/ProjectionResult";
import type { DrawdownInputs } from "../models/DrawdownInputs";
import { createDefaultDrawdownInputs } from "./createDefaultDrawdownInputs";

export interface CreateDrawdownInputsFromPlanOptions {
  pensionInputs: PensionInputs;
  projection: ProjectionResult;
  retirementGoals: RetirementGoals;
  drawdown?: ScenarioDrawdownPreferences;
}

export function createDrawdownInputsFromPlan({
  pensionInputs,
  projection,
  retirementGoals,
  drawdown,
}: CreateDrawdownInputsFromPlanOptions): DrawdownInputs {
  const defaults = createDefaultDrawdownInputs();
  const spendingPhases = drawdown?.spendingPhases
    ?.filter((phase) => phase.startAge >= pensionInputs.retirementAge)
    .sort((left, right) => left.startAge - right.startAge);

  return {
    ...defaults,
    startingBalance: Math.max(0, projection.finalBalance.real),
    retirementAge: pensionInputs.retirementAge,
    endAge: drawdown?.planningAge ?? defaults.endAge,
    withdrawalStrategy:
      drawdown?.withdrawalStrategy ?? defaults.withdrawalStrategy,
    withdrawalRate: drawdown?.withdrawalRate ?? defaults.withdrawalRate,
    desiredAnnualIncome:
      drawdown?.desiredAnnualIncome ?? retirementGoals.desiredAnnualIncome,
    incomeTargetMode: drawdown?.incomeTargetMode ?? defaults.incomeTargetMode,
    ...(spendingPhases?.length ? { spendingPhases } : {}),
    taxFreeCash: drawdown?.taxFreeCash ?? defaults.taxFreeCash,
    annualStatePension: retirementGoals.includeStatePension
      ? retirementGoals.statePensionAnnualAmount
      : 0,
    statePensionAge: retirementGoals.statePensionAge,
    annualReturn: pensionInputs.annualReturn,
    annualFee: pensionInputs.annualFee,
    inflationRate: pensionInputs.inflation,
  };
}
