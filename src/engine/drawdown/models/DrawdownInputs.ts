export type IncomeTargetMode = "gross" | "net";
export type WithdrawalStrategy = "target-income" | "percentage";

export interface DrawdownSpendingPhase {
  startAge: number;
  annualIncome: number;
  withdrawalRate?: number;
  label: string;
}

export interface DrawdownInputs {
  startingBalance: number;
  retirementAge: number;
  endAge: number;
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalRate: number;
  desiredAnnualIncome: number;
  incomeTargetMode: IncomeTargetMode;
  spendingPhases?: DrawdownSpendingPhase[];
  annualStatePension: number;
  statePensionAge: number;
  annualReturn: number;
  annualFee: number;
  inflationRate: number;
  taxFreeCash: number;
}
