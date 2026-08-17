export type DrawdownEndingBalanceMode =
  | "preserve"
  | "percentage"
  | "spend-to-zero";

export interface DrawdownEndingBalanceGoal {
  mode: DrawdownEndingBalanceMode;
  percentage: number;
}

export const DEFAULT_DRAWDOWN_ENDING_BALANCE_GOAL: DrawdownEndingBalanceGoal = {
  mode: "preserve",
  percentage: 1,
};

export function getEndingBalanceTarget(
  startingBalanceAfterCash: number,
  inflationRate: number,
  retirementYears: number,
  goal: DrawdownEndingBalanceGoal,
): number {
  const percentage =
    goal.mode === "preserve"
      ? 1
      : goal.mode === "spend-to-zero"
        ? 0
        : Math.min(1, Math.max(0, goal.percentage));
  const inflationYears = Math.max(0, retirementYears - 1);
  const futureValueMultiplier = (1 + inflationRate) ** inflationYears;

  return Math.max(
    0,
    startingBalanceAfterCash * percentage * futureValueMultiplier,
  );
}
