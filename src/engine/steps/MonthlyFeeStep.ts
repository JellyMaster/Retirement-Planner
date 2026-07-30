import { type MonthlyProjectionContext } from "../models/MonthlyProjectionContext";
import { convertAnnualFeeToMonthlyRate } from "../utils/convertAnnualFeeToMonthlyRate";
import { type MonthlyProjectionStep } from "./MonthlyProjectionStep";

export class MonthlyFeeStep
  implements MonthlyProjectionStep
{
  public execute(
    context: MonthlyProjectionContext
  ): void {
    const monthlyFeeRate =
      convertAnnualFeeToMonthlyRate(
        context.inputs.annualFee
      );

    context.fees =
      context.openingBalance *
      monthlyFeeRate;
  }
}