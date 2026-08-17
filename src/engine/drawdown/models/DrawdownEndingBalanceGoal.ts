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

/**
 * Returns the nominal balance that should remain at the planning age.
 *
 * Ending-balance goals are deliberately anchored to the amount actually
 * available for drawdown at retirement (after any tax-free cash), rather than
 * inflation-growing that reserve through retirement. This makes the choices
 * intuitive on the balance chart:
 * - preserve = finish with the retirement drawdown pot
 * - percentage = finish with that percentage of the retirement drawdown pot
 * - spend-to-zero = finish with no pension pot remaining
 *
 * inflationRate and retirementYears remain in the signature for compatibility
 * with existing callers; the reserve target itself is not inflation-adjusted.
 */
export function getEndingBalanceTarget(
  startingBalanceAfterCash: number,
  _inflationRate: number,
  _retirementYears: number,
  goal: DrawdownEndingBalanceGoal,
): number {
  const percentage =
    goal.mode === "preserve"
      ? 1
      : goal.mode === "spend-to-zero"
        ? 0
        : Math.min(1, Math.max(0, goal.percentage));

  return Math.max(0, startingBalanceAfterCash * percentage);
}
