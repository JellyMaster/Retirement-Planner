import { DrawdownEngine } from "./DrawdownEngine";
import { calculateSustainableTargetIncome } from "./calculateSustainableTargetIncome";
import type { DrawdownInputs } from "./models/DrawdownInputs";
import type { DrawdownResult } from "./models/DrawdownResult";

export interface EndingBalancePath {
  income: number;
  result: DrawdownResult;
}

export interface EndingBalancePaths {
  preserve: EndingBalancePath;
  reserve: EndingBalancePath;
  spend: EndingBalancePath;
}

const engine = new DrawdownEngine();

export function createEndingBalancePaths(
  inputs: DrawdownInputs,
  reservePercentage: number,
): EndingBalancePaths {
  const comparisonInputs: DrawdownInputs = {
    ...inputs,
    withdrawalStrategy: "target-income",
  };

  return {
    preserve: createPath(comparisonInputs, "preserve", 1),
    reserve: createPath(
      comparisonInputs,
      "percentage",
      Math.min(1, Math.max(0, reservePercentage)),
    ),
    spend: createPath(comparisonInputs, "spend-to-zero", 0),
  };
}

function createPath(
  inputs: DrawdownInputs,
  mode: "preserve" | "percentage" | "spend-to-zero",
  percentage: number,
): EndingBalancePath {
  const income = calculateSustainableTargetIncome(inputs, {
    endingBalanceGoal: { mode, percentage },
  });

  return {
    income,
    result: engine.calculate(applyIncomeBaseline(inputs, income)),
  };
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
