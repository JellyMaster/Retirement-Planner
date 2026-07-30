import { type MonthlyProjectionContext } from "../models/MonthlyProjectionContext";
import { type MonthlyProjectionStep } from "./MonthlyProjectionStep";

export class MonthlyClosingBalanceStep
  implements MonthlyProjectionStep
{
  public execute(
    context: MonthlyProjectionContext
  ): void {
    context.closingBalance =
      context.openingBalance +
      context.investmentGrowth -
      context.fees +
      context.totalContribution;
  }
}