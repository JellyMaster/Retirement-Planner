import { type MonthlyProjectionContext } from "../models/MonthlyProjectionContext";
import { convertAnnualRateToMonthlyRate } from "../utils/convertAnnualRateToMonthlyRate";
import { type MonthlyProjectionStep } from "./MonthlyProjectionStep";

export class MonthlyInvestmentGrowthStep
  implements MonthlyProjectionStep
{
  public execute(
    context: MonthlyProjectionContext
  ): void {
    const monthlyReturn =
      convertAnnualRateToMonthlyRate(
        context.inputs.annualReturn
      );

    context.investmentGrowth =
      context.openingBalance * monthlyReturn;
  }
}