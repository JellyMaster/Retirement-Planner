import { calculateIncomeForEndingBalance } from "./calculateIncomeForEndingBalance";
import type { DrawdownInputs } from "./models/DrawdownInputs";
import type { DrawdownResult } from "./models/DrawdownResult";

export interface EndingBalancePath {
  income: number;
  targetEndingBalance: number;
  result: DrawdownResult;
}

export interface EndingBalancePaths {
  preserve: EndingBalancePath;
  reserve: EndingBalancePath;
  spend: EndingBalancePath;
}

export function createEndingBalancePaths(
  inputs: DrawdownInputs,
  reservePercentage: number,
): EndingBalancePaths {
  const retirementPot = Math.max(0, inputs.startingBalance - inputs.taxFreeCash);
  const reserve = Math.min(1, Math.max(0, reservePercentage));

  return {
    preserve: createPath(inputs, retirementPot),
    reserve: createPath(inputs, retirementPot * reserve),
    spend: createPath(inputs, 0),
  };
}

function createPath(
  inputs: DrawdownInputs,
  targetEndingBalance: number,
): EndingBalancePath {
  const solved = calculateIncomeForEndingBalance(inputs, targetEndingBalance);

  return {
    income: solved.annualIncome,
    targetEndingBalance,
    result: solved.result,
  };
}
