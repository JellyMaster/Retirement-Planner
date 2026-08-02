import type {
  DrawdownSpendingPhase,
  IncomeTargetMode,
  WithdrawalStrategy,
} from "../../engine/drawdown/models/DrawdownInputs";

export interface ScenarioDrawdownPreferences {
  planningAge: number;
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalRate: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  spendingPhases?: DrawdownSpendingPhase[];
  taxFreeCash: number;
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
  };
}
