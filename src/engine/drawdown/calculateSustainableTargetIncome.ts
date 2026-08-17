import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const DEFAULT_TOLERANCE = 1;
const MAX_SEARCH_INCOME = 100_000_000;
const MAX_ITERATIONS = 80;

export interface SustainableTargetIncomeOptions {
  tolerance?: number;
}

/**
 * Finds the highest annual target-income baseline that can be delivered through
 * the selected planning age without a drawdown shortfall.
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

  const isSustainable = (annualIncome: number): boolean => {
    const result = engine.calculate(applyIncomeBaseline(inputs, annualIncome));
    return (
      result.depletionAge === null &&
      result.firstShortfallAge === null &&
      result.firstNetIncomeShortfallAge === null
    );
  };

  let low = 0;
  let high = Math.max(inputs.desiredAnnualIncome, 1);

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

  // The binary search works with fractional pounds, but the public result is a
  // whole-pound benchmark. Verify the neighbouring integers so an exact
  // sustainable boundary is not lost by flooring a lower fractional bound.
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
