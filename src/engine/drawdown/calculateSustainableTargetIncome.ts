import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownEndingBalanceGoal } from "./models/DrawdownEndingBalanceGoal";
import { getEndingBalanceTarget } from "./models/DrawdownEndingBalanceGoal";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const DEFAULT_TOLERANCE = 1;
const MAX_SEARCH_INCOME = 100_000_000;
const MAX_ITERATIONS = 80;

export interface SustainableTargetIncomeOptions {
  tolerance?: number;
  endingBalanceGoal?: DrawdownEndingBalanceGoal;
}

/**
 * Finds the highest annual target-income baseline that can be delivered through
 * the selected planning age without a drawdown shortfall while satisfying the
 * optional ending-balance objective.
 *
 * When retirement spending phases are present, their relative relationship to
 * the baseline target is preserved while the calculator searches for the
 * sustainable level.
 */
export function calculateSustainableTargetIncome(
  inputs: DrawdownInputs,
  options: SustainableTargetIncomeOptions = {},
): number {
  if (inputs.withdrawalStrategy !== "target-income") {
    throw new Error(
      "Sustainable target income can only be calculated for the target-income withdrawal strategy.",
    );
  }

  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  if (!Number.isFinite(tolerance) || tolerance <= 0) {
    throw new Error("Sustainable income tolerance must be greater than zero.");
  }

  const engine = new DrawdownEngine();
  const retirementYears = inputs.endAge - inputs.retirementAge;
  const startingBalanceAfterCash = Math.max(
    0,
    inputs.startingBalance - inputs.taxFreeCash,
  );
  const minimumEndingBalance = options.endingBalanceGoal
    ? getEndingBalanceTarget(
        startingBalanceAfterCash,
        inputs.inflationRate,
        retirementYears,
        options.endingBalanceGoal,
      )
    : 0;

  const isSustainable = (annualIncome: number): boolean => {
    const result = engine.calculate(applyIncomeBaseline(inputs, annualIncome));
    return (
      result.depletionAge === null &&
      result.firstShortfallAge === null &&
      result.firstNetIncomeShortfallAge === null &&
      result.finalBalance >= minimumEndingBalance
    );
  };

  let low = 0;
  let high = Math.max(inputs.desiredAnnualIncome, 1);

  if (!isSustainable(0)) {
    return 0;
  }

  while (high < MAX_SEARCH_INCOME && isSustainable(high)) {
    low = high;
    high = Math.min(high * 2, MAX_SEARCH_INCOME);
  }

  if (high === MAX_SEARCH_INCOME && isSustainable(high)) {
    return MAX_SEARCH_INCOME;
  }

  for (
    let iteration = 0;
    iteration < MAX_ITERATIONS && high - low > tolerance;
    iteration += 1
  ) {
    const midpoint = (low + high) / 2;
    if (isSustainable(midpoint)) low = midpoint;
    else high = midpoint;
  }

  let candidate = Math.min(MAX_SEARCH_INCOME, Math.ceil(low));

  if (!isSustainable(candidate)) {
    candidate -= 1;
  }

  while (candidate < MAX_SEARCH_INCOME && isSustainable(candidate + 1)) {
    candidate += 1;
  }

  return Math.max(0, candidate);
}

function applyIncomeBaseline(
  inputs: DrawdownInputs,
  annualIncome: number,
): DrawdownInputs {
  const baseline = inputs.desiredAnnualIncome;
  const spendingPhases = inputs.spendingPhases?.map((phase, index) => ({
    ...phase,
    annualIncome:
      baseline > 0
        ? phase.annualIncome * (annualIncome / baseline)
        : index === 0
          ? annualIncome
          : phase.annualIncome,
  }));

  return {
    ...inputs,
    desiredAnnualIncome: annualIncome,
    ...(spendingPhases ? { spendingPhases } : {}),
  };
}
