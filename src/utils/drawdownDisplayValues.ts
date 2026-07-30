import type { DrawdownResult } from "../engine/drawdown/models/DrawdownResult";
import type { DrawdownYear } from "../engine/drawdown/models/DrawdownYear";

export type MoneyDisplayMode = "nominal" | "today";

export function getInflationDiscountFactor(
  yearIndex: number,
  inflationRate: number,
): number {
  if (yearIndex <= 0 || inflationRate === 0) {
    return 1;
  }

  return Math.pow(1 + inflationRate, yearIndex);
}

export function toDisplayValue(
  value: number,
  yearIndex: number,
  inflationRate: number,
  displayMode: MoneyDisplayMode,
): number {
  if (displayMode === "nominal") {
    return value;
  }

  return value / getInflationDiscountFactor(yearIndex, inflationRate);
}

export function convertDrawdownYearForDisplay(
  year: DrawdownYear,
  yearIndex: number,
  inflationRate: number,
  displayMode: MoneyDisplayMode,
): DrawdownYear {
  if (displayMode === "nominal") {
    return year;
  }

  const convert = (value: number) =>
    toDisplayValue(value, yearIndex, inflationRate, displayMode);

  return {
    ...year,
    openingBalance: convert(year.openingBalance),
    desiredIncome: convert(year.desiredIncome),
    statePensionIncome: convert(year.statePensionIncome),
    pensionWithdrawal: convert(year.pensionWithdrawal),
    grossIncome: convert(year.grossIncome),
    personalAllowance: convert(year.personalAllowance),
    taxableIncome: convert(year.taxableIncome),
    incomeTax: convert(year.incomeTax),
    netIncome: convert(year.netIncome),
    netIncomeShortfall: convert(year.netIncomeShortfall),
    investmentGrowth: convert(year.investmentGrowth),
    fees: convert(year.fees),
    incomeShortfall: convert(year.incomeShortfall),
    closingBalance: convert(year.closingBalance),
  };
}

export function getDisplayYears(
  years: DrawdownYear[],
  inflationRate: number,
  displayMode: MoneyDisplayMode,
): DrawdownYear[] {
  return years.map((year, index) =>
    convertDrawdownYearForDisplay(year, index, inflationRate, displayMode),
  );
}

export function getDisplaySummary(
  result: DrawdownResult,
  inflationRate: number,
  displayMode: MoneyDisplayMode,
) {
  if (displayMode === "nominal") {
    return {
      finalBalance: result.finalBalance,
      totalGrossIncome: result.totalGrossIncome,
      totalIncomeTax: result.totalIncomeTax,
      totalNetIncome: result.totalNetIncome,
      totalPensionWithdrawals: result.totalPensionWithdrawals,
      totalStatePensionIncome: result.totalStatePensionIncome,
      totalInvestmentGrowth: result.totalInvestmentGrowth,
      totalFees: result.totalFees,
      totalIncomeShortfall: result.totalIncomeShortfall,
      totalNetIncomeShortfall: result.totalNetIncomeShortfall,
      taxFreeCashTaken: result.taxFreeCashTaken,
    };
  }

  const years = getDisplayYears(result.years, inflationRate, displayMode);
  const sum = (selector: (year: DrawdownYear) => number) =>
    years.reduce((total, year) => total + selector(year), 0);

  return {
    finalBalance: years.at(-1)?.closingBalance ?? result.finalBalance,
    totalGrossIncome: sum((year) => year.grossIncome),
    totalIncomeTax: sum((year) => year.incomeTax),
    totalNetIncome: sum((year) => year.netIncome),
    totalPensionWithdrawals: sum((year) => year.pensionWithdrawal),
    totalStatePensionIncome: sum((year) => year.statePensionIncome),
    totalInvestmentGrowth: sum((year) => year.investmentGrowth),
    totalFees: sum((year) => year.fees),
    totalIncomeShortfall: sum((year) => year.incomeShortfall),
    totalNetIncomeShortfall: sum((year) => year.netIncomeShortfall),
    taxFreeCashTaken: result.taxFreeCashTaken,
  };
}
