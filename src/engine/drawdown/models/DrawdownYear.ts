export interface DrawdownYear {
  year: number;
  age: number;
  openingBalance: number;
  desiredIncome: number;
  statePensionIncome: number;
  requiredPensionWithdrawal: number;
  pensionWithdrawal: number;
  incomeShortfall: number;
  investmentGrowth: number;
  fees: number;
  closingBalance: number;
  isDepleted: boolean;
}
