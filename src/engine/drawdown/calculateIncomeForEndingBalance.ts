import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const engine = new DrawdownEngine();
const MAX_SEARCH_INCOME = 100_000_000;
const MAX_ITERATIONS = 100;
const SEARCH_TOLERANCE = 0.01;

export function calculateIncomeForEndingBalance(
  inputs: DrawdownInputs,
  targetEndingBalance: number,
): { annualIncome: number; result: ReturnType<DrawdownEngine["calculate"]> } {
  const { spendingPhases: _spendingPhases, ...withoutSpendingPhases } = inputs;
  const comparisonInputs: DrawdownInputs = {
    ...withoutSpendingPhases,
    withdrawalStrategy: "target-income",
  };
  const target = Math.max(0, targetEndingBalance);

  const calculate = (annualIncome: number) =>
    engine.calculate({
      ...comparisonInputs,
      desiredAnnualIncome: annualIncome,
    });

  const meetsGoal = (
    result: ReturnType<DrawdownEngine["calculate"]>,
  ): boolean =>
    result.depletionAge === null &&
    result.firstShortfallAge === null &&
    result.firstNetIncomeShortfallAge === null &&
    result.finalBalance >= target;

  let low = 0;
  let lowResult = calculate(low);

  if (!meetsGoal(lowResult)) {
    return { annualIncome: 0, result: lowResult };
  }

  let high = Math.max(comparisonInputs.desiredAnnualIncome, 1);
  let highResult = calculate(high);

  while (high < MAX_SEARCH_INCOME && meetsGoal(highResult)) {
    low = high;
    lowResult = highResult;
    high = Math.min(high * 2, MAX_SEARCH_INCOME);
    highResult = calculate(high);
  }

  if (high === MAX_SEARCH_INCOME && meetsGoal(highResult)) {
    return { annualIncome: MAX_SEARCH_INCOME, result: highResult };
  }

  for (
    let iteration = 0;
    iteration < MAX_ITERATIONS && high - low > SEARCH_TOLERANCE;
    iteration += 1
  ) {
    const midpoint = (low + high) / 2;
    const midpointResult = calculate(midpoint);

    if (meetsGoal(midpointResult)) {
      low = midpoint;
      lowResult = midpointResult;
    } else {
      high = midpoint;
    }
  }

  let annualIncome = Math.max(0, Math.floor(low));
  let result = calculate(annualIncome);

  while (meetsGoal(calculate(annualIncome + 1))) {
    annualIncome += 1;
    result = calculate(annualIncome);
  }

  return { annualIncome, result };
}
