import type { IncomeTargetMode } from "./DrawdownInputs";
import type { DrawdownYear } from "./DrawdownYear";

export interface DrawdownResult {
  startingBalance: number;
  incomeTargetMode: IncomeTargetMode;
  taxFreeCashTaken: number;
  balanceAfterTaxFreeCash: number;
  years: DrawdownYear[];
  finalBalance: number;
  depletionAge: number | null;
  firstShortfallAge: number | null;
  firstNetIncomeShortfallAge: number | null;
  totalDesiredIncome: number;
  totalStatePensionIncome: number;
  totalPensionWithdrawals: number;
  totalGrossIncome: number;
  totalIncomeTax: number;
  totalNetIncome: number;
  totalNetIncomeShortfall: number;
  averageEffectiveTaxRate: number;
  totalIncomeShortfall: number;
  totalInvestmentGrowth: number;
  totalFees: number;
}
