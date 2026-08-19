import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const engine = new DrawdownEngine();
const MAX_SEARCH_INCOME = 100_000_000;
const MAX_ITERATIONS = 100;
const SEARCH_TOLERANCE = 0.01;
const INCOME_SHORTFALL_TOLERANCE = 1;

export function calculateIncomeForEndingBalance(
  inputs: DrawdownInputs,
  targetEndingBalance: number,
): { annualIncome: number; result: ReturnType<DrawdownEngine["calculate"]> } {
  // The retirement pot entering drawdown is already expressed in today's money.
  // Run this comparison on the same real-money basis so that preserving 100%
  // literally means ending with the same pound value that entered drawdown.
  const realReturn =
    (1 + inputs.annualReturn) / (1 + inputs.inflationRate) - 1;

  const comparisonInputs: DrawdownInputs = {
    ...inputs,
    spendingPhases: undefined,
    withdrawalStrategy: "target-income",
    annualReturn: realReturn,
    inflationRate: 0,
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
    result.totalIncomeShortfall <= INCOME_SHORTFALL_TOLERANCE &&
    result.totalNetIncomeShortfall <= INCOME_SHORTFALL_TOLERANCE &&
    result.finalBalance >= target;

  let low = 0;
  const lowResult = calculate(low);

  if (!meetsGoal(lowResult)) {
    return { annualIncome: 0, result: lowResult };
  }

  let high = Math.max(comparisonInputs.desiredAnnualIncome, 1);
  let highResult = calculate(high);

  while (high < MAX_SEARCH_INCOME && meetsGoal(highResult)) {
    low = high;
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
    } else {
      high = midpoint;
    }
  }

  let annualIncome = Math.max(0, Math.floor(low));
  let result = calculate(annualIncome);

  while (annualIncome < MAX_SEARCH_INCOME) {
    const nextResult = calculate(annualIncome + 1);
    if (!meetsGoal(nextResult)) break;
    annualIncome += 1;
    result = nextResult;
  }

  return { annualIncome, result };
}