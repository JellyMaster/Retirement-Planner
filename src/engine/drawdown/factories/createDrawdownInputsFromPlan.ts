import type { RetirementGoals } from "../../models/RetirementGoals";
import type { PensionInputs } from "../../models/PensionInputs";
import type { ProjectionResult } from "../../models/ProjectionResult";
import type { DrawdownInputs } from "../models/DrawdownInputs";
import { createDefaultDrawdownInputs } from "./createDefaultDrawdownInputs";

export interface CreateDrawdownInputsFromPlanOptions {
  pensionInputs: PensionInputs;
  projection: ProjectionResult;
  retirementGoals: RetirementGoals;
}

export function createDrawdownInputsFromPlan({
  pensionInputs,
  projection,
  retirementGoals,
}: CreateDrawdownInputsFromPlanOptions): DrawdownInputs {
  const defaults = createDefaultDrawdownInputs();

  return {
    ...defaults,
    startingBalance: Math.max(0, projection.finalBalance.real),
    retirementAge: pensionInputs.retirementAge,
    desiredAnnualIncome: retirementGoals.desiredAnnualIncome,
    annualStatePension: retirementGoals.includeStatePension
      ? retirementGoals.statePensionAnnualAmount
      : 0,
    statePensionAge: retirementGoals.statePensionAge,
    annualReturn: pensionInputs.annualReturn,
    annualFee: pensionInputs.annualFee,
    inflationRate: pensionInputs.inflation,
  };
}
