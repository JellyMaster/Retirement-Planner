import { DrawdownEngine } from "./DrawdownEngine";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const engine = new DrawdownEngine();

export function calculateIncomeForEndingBalance(
  inputs: DrawdownInputs,
  targetEndingBalance: number,
): { annualIncome: number; result: ReturnType<DrawdownEngine["calculate"]> } {
  const comparisonInputs: DrawdownInputs = {
    ...inputs,
    withdrawalStrategy: "target-income",
  };

  const calculate = (annualIncome: number) =>
    engine.calculate(applyIncomeBaseline(comparisonInputs, annualIncome));

  let low = 0;
  let high = Math.max(comparisonInputs.desiredAnnualIncome, 1);
  let lowResult = calculate(low);
  let highResult = calculate(high);

  if (lowResult.finalBalance < targetEndingBalance) {
    return { annualIncome: 0, result: lowResult };
  }

  while (high < 100_000_000 && highResult.finalBalance >= targetEndingBalance) {
    low = high;
    lowResult = highResult;
    high *= 2;
    highResult = calculate(high);
  }

  for (let iteration = 0; iteration < 100 && high - low > 0.01; iteration += 1) {
    const midpoint = (low + high) / 2;
    const midpointResult = calculate(midpoint);

    if (
      midpointResult.depletionAge === null &&
      midpointResult.firstShortfallAge === null &&
      midpointResult.firstNetIncomeShortfallAge === null &&
      midpointResult.finalBalance >= targetEndingBalance
    ) {
      low = midpoint;
      lowResult = midpointResult;
    } else {
      high = midpoint;
    }
  }

  const annualIncome = Math.max(0, Math.floor(low));
  return { annualIncome, result: calculate(annualIncome) };
}

function applyIncomeBaseline(inputs: DrawdownInputs, annualIncome: number): DrawdownInputs {
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
