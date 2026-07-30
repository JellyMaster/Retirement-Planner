export type IncomeTargetMode = "gross" | "net";

export interface DrawdownInputs {
  startingBalance: number;
  retirementAge: number;
  endAge: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  annualStatePension: number;
  statePensionAge: number;
  annualReturn: number;
  annualFee: number;
  inflationRate: number;
  taxFreeCash: number;
}
