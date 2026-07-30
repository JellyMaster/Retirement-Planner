import type { IncomeTargetMode } from "./DrawdownInputs";

export interface DrawdownYear {
  year: number;
  age: number;
  openingBalance: number;
  desiredIncome: number;
  incomeTargetMode: IncomeTargetMode;
  statePensionIncome: number;
  requiredPensionWithdrawal: number;
  pensionWithdrawal: number;
  grossIncome: number;
  taxableIncome: number;
  personalAllowance: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  netIncomeShortfall: number;
  incomeShortfall: number;
  investmentGrowth: number;
  fees: number;
  closingBalance: number;
  isDepleted: boolean;
}
