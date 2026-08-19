import type {
  DrawdownSpendingPhase,
  IncomeTargetMode,
  WithdrawalStrategy,
} from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownEndingBalanceMode } from "../../engine/drawdown/models/DrawdownEndingBalanceGoal";
import type {
  RetirementLivingStandardHousehold,
  RetirementLivingStandardLevel,
  RetirementLivingStandardRegion,
} from "../../engine/drawdown/retirementLivingStandards";

export type TaxFreeCashMode = "maximum" | "custom";
export type RetirementIncomeGoalSource = "custom" | "living-standard";

export interface ScenarioDrawdownPreferences {
  planningAge: number;
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalRate: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  retirementIncomeGoalSource?: RetirementIncomeGoalSource;
  customDesiredAnnualIncome?: number;
  retirementLivingStandardsLevel?: RetirementLivingStandardLevel;
  spendingPhases?: DrawdownSpendingPhase[];
  taxFreeCash: number;
  taxFreeCashMode?: TaxFreeCashMode;
  endingBalanceMode?: DrawdownEndingBalanceMode;
  endingBalancePercentage?: number;
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
    retirementIncomeGoalSource: "custom",
    customDesiredAnnualIncome: desiredAnnualIncome,
    taxFreeCash: 0,
    taxFreeCashMode: "maximum",
    endingBalanceMode: "preserve",
    endingBalancePercentage: 1,
    retirementLivingStandardsHousehold: "one-person",
    retirementLivingStandardsRegion: "uk",
  };
}
