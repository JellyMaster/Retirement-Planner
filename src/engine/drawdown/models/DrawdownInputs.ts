export type IncomeTargetMode = "gross" | "net";
export type WithdrawalStrategy = "target-income" | "percentage";

export interface DrawdownInputs {
  startingBalance: number;
  retirementAge: number;
  endAge: number;
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalRate: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  annualStatePension: number;
  statePensionAge: number;
  annualReturn: number;
  annualFee: number;
  inflationRate: number;
  taxFreeCash: number;
}
