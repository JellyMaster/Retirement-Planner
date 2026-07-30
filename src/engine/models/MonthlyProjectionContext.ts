import { type  PensionInputs } from "./PensionInputs";

export interface MonthlyProjectionContext {
  inputs: PensionInputs;

  /**
   * Zero-based month number from the projection start.
   */
  monthIndex: number;

  /**
   * Whole age during this projection month.
   */
  age: number;

  openingBalance: number;

  employeeContribution: number;

  employerContribution: number;

  totalContribution: number;

  investmentGrowth: number;

  fees: number;

  closingBalance: number;

  /**
   * Cumulative inflation factor at the end of this month.
   */
  inflationFactor: number;
}