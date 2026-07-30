import { type MonthlyProjectionContext } from "../models/MonthlyProjectionContext";
import { type MonthlyProjectionStep } from "./MonthlyProjectionStep";

export class MonthlyContributionStep
  implements MonthlyProjectionStep
{
  public execute(
    context: MonthlyProjectionContext
  ): void {
    const completedContributionYears =
      Math.floor(context.monthIndex / 12);

    let employeeContribution =
      context.inputs.monthlyEmployeeContribution *
      Math.pow(
        1 +
          context.inputs
            .annualContributionIncrease,
        completedContributionYears
      );

    const extraContributionStartMonth =
      context.inputs.extraContributionAge ===
      undefined
        ? undefined
        : (context.inputs.extraContributionAge -
            context.inputs.currentAge) *
          12;

    const extraContributionApplies =
      extraContributionStartMonth !== undefined &&
      context.inputs.extraMonthlyContribution !==
        undefined &&
      context.monthIndex >=
        extraContributionStartMonth;

    if (extraContributionApplies) {
      employeeContribution +=
        context.inputs.extraMonthlyContribution ?? 0;
    }

    context.employeeContribution =
      employeeContribution;

    context.employerContribution =
      context.inputs.monthlyEmployerContribution;

    context.totalContribution =
      context.employeeContribution +
      context.employerContribution;
  }
}