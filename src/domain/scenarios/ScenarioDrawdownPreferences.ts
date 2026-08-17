import type {
  DrawdownSpendingPhase,
  IncomeTargetMode,
  WithdrawalStrategy,
} from "../../engine/drawdown/models/DrawdownInputs";
import type {
  RetirementLivingStandardHousehold,
  RetirementLivingStandardRegion,
} from "../../engine/drawdown/retirementLivingStandards";

export interface ScenarioDrawdownPreferences {
  planningAge: number;
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalRate: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  spendingPhases?: DrawdownSpendingPhase[];
  taxFreeCash: number;
  retirementLivingStandardsHousehold?: RetirementLivingStandardHousehold;
  retirementLivingStandardsRegion?: RetirementLivingStandardRegion;
  includeStatePension?: boolean;
  statePensionAnnualAmount?: number;
  statePensionAge?: number;
}

export function createDefaultScenarioDrawdownPreferences(
  desiredAnnualIncome = 30_000,
): ScenarioDrawdownPreferences {
  return {
    planningAge: 95,
    withdrawalStrategy: "target-income",
    withdrawalRate: 0.04,
    desiredAnnualIncome,
    incomeTargetMode: "net",
    taxFreeCash: 0,
    retirementLivingStandardsHousehold: "one-person",
    retirementLivingStandardsRegion: "uk",
  };
}
