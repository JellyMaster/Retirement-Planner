import { calculateIncomeForEndingBalance } from "./calculateIncomeForEndingBalance";
import type { DrawdownInputs } from "./models/DrawdownInputs";
import type { DrawdownResult } from "./models/DrawdownResult";

export interface EndingBalanceWithdrawalPoint {
  age: number;
  amount: number;
}

export interface EndingBalanceWithdrawalSummary {
  averageAnnualWithdrawal: number;
  highestWithdrawal: EndingBalanceWithdrawalPoint;
  lowestWithdrawal: EndingBalanceWithdrawalPoint;
}

export interface EndingBalancePath {
  income: number;
  targetEndingBalance: number;
  result: DrawdownResult;
  withdrawals: EndingBalanceWithdrawalSummary;
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
    withdrawals: summariseWithdrawals(solved.result),
  };
}

function summariseWithdrawals(
  result: DrawdownResult,
): EndingBalanceWithdrawalSummary {
  if (result.years.length === 0) {
    const empty = { age: 0, amount: 0 };
    return {
      averageAnnualWithdrawal: 0,
      highestWithdrawal: empty,
      lowestWithdrawal: empty,
    };
  }

  const total = result.years.reduce(
    (sum, year) => sum + year.pensionWithdrawal,
    0,
  );
  const averageAnnualWithdrawal = total / result.years.length;

  let highest = result.years[0];
  let lowest = result.years[0];

  for (const year of result.years.slice(1)) {
    if (year.pensionWithdrawal > highest.pensionWithdrawal) highest = year;
    if (year.pensionWithdrawal < lowest.pensionWithdrawal) lowest = year;
  }

  return {
    averageAnnualWithdrawal,
    highestWithdrawal: {
      age: highest.age,
      amount: highest.pensionWithdrawal,
    },
    lowestWithdrawal: {
      age: lowest.age,
      amount: lowest.pensionWithdrawal,
    },
  };
}
