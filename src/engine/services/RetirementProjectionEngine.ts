import { type PensionInputs } from "../models/PensionInputs";
import { type ProjectionYear } from "../models/ProjectionYear";
import { calculateAnnualContribution } from "../utils/calculateAnnualContribution";
import { calculateInvestmentGrowth } from "../utils/calculateInvestmentGrowth";
import { calculateAnnualFees } from "../utils/calculateAnnualFees";

export class RetirementProjectionEngine {
  static calculate(inputs: PensionInputs): ProjectionYear[] {
    const projection: ProjectionYear[] = [];

    let currentBalance = inputs.currentPot;

    for (
      let age = inputs.currentAge;
      age <= inputs.retirementAge;
      age++
    ) {
      const contributions = calculateAnnualContribution(
        inputs.monthlyEmployeeContribution,
        inputs.monthlyEmployerContribution
      );

      const investmentGrowth = calculateInvestmentGrowth(
        currentBalance,
        inputs.annualReturn
      );

      const fees = calculateAnnualFees(
        currentBalance,
        inputs.annualFee
      );

      const closingBalance =
        currentBalance +
        investmentGrowth +
        contributions -
        fees;

      projection.push({
        age,
        openingBalance: currentBalance,
        contributions,
        investmentGrowth,
        fees,
        closingBalance,
      });

      currentBalance = closingBalance;
    }

    return projection;
  }
}