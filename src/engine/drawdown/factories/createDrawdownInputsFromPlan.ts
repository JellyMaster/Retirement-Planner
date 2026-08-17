import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import type { RetirementGoals } from "../../models/RetirementGoals";
import type { PensionInputs } from "../../models/PensionInputs";
import type { ProjectionResult } from "../../models/ProjectionResult";
import type { DrawdownInputs } from "../models/DrawdownInputs";
import { createDefaultDrawdownInputs } from "./createDefaultDrawdownInputs";

const STANDARD_LUMP_SUM_ALLOWANCE = 268_275;
const TAX_FREE_CASH_RATE = 0.25;

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
  const startingBalance = Math.max(0, projection.finalBalance.real);
  const spendingPhases = drawdown?.spendingPhases
    ?.filter((phase) => phase.startAge >= pensionInputs.retirementAge)
    .sort((left, right) => left.startAge - right.startAge);
  const maximumTaxFreeCash = Math.floor(
    Math.min(startingBalance * TAX_FREE_CASH_RATE, STANDARD_LUMP_SUM_ALLOWANCE),
  );
  const usesMaximumTaxFreeCash =
    drawdown?.taxFreeCashMode === "maximum" ||
    (drawdown?.taxFreeCashMode === undefined && (drawdown?.taxFreeCash ?? 0) === 0);
  const taxFreeCash = usesMaximumTaxFreeCash
    ? maximumTaxFreeCash
    : (drawdown?.taxFreeCash ?? defaults.taxFreeCash);

  return {
    ...defaults,
    startingBalance,
    retirementAge: pensionInputs.retirementAge,
    endAge: drawdown?.planningAge ?? defaults.endAge,
    withdrawalStrategy:
      drawdown?.withdrawalStrategy ?? defaults.withdrawalStrategy,
    withdrawalRate: drawdown?.withdrawalRate ?? defaults.withdrawalRate,
    desiredAnnualIncome:
      drawdown?.desiredAnnualIncome ?? retirementGoals.desiredAnnualIncome,
    incomeTargetMode: drawdown?.incomeTargetMode ?? defaults.incomeTargetMode,
    ...(spendingPhases?.length ? { spendingPhases } : {}),
    taxFreeCash,
    annualStatePension: retirementGoals.includeStatePension
      ? retirementGoals.statePensionAnnualAmount
      : 0,
    statePensionAge: retirementGoals.statePensionAge,
    annualReturn: pensionInputs.annualReturn,
    annualFee: pensionInputs.annualFee,
    inflationRate: pensionInputs.inflation,
  };
}
