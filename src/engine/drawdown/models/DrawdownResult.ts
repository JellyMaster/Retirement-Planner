import type { DrawdownYear } from "./DrawdownYear";

export interface DrawdownResult {
  startingBalance: number;
  taxFreeCashTaken: number;
  balanceAfterTaxFreeCash: number;
  years: DrawdownYear[];
  finalBalance: number;
  depletionAge: number | null;
  firstShortfallAge: number | null;
  totalDesiredIncome: number;
  totalStatePensionIncome: number;
  totalPensionWithdrawals: number;
  totalIncomeShortfall: number;
  totalInvestmentGrowth: number;
  totalFees: number;
}
