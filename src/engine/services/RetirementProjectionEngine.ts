import { MoneyValueFactory } from "../factories/MoneyValueFactory";
import { MonthlyProjectionContextFactory } from "../factories/MonthlyProjectionContextFactory";
import { ProjectionResultFactory } from "../factories/ProjectionResultFactory";
import { ProjectionYearAccumulatorFactory } from "../factories/ProjectionYearAccumulatorFactory";

import type { PensionInputs } from "../models/PensionInputs";
import type { ProjectionResult } from "../models/ProjectionResult";
import type { ProjectionYear } from "../models/ProjectionYear";

import { MonthlyClosingBalanceStep } from "../steps/MonthlyClosingBalanceStep";
import { MonthlyContributionStep } from "../steps/MonthlyContributionStep";
import { MonthlyFeeStep } from "../steps/MonthlyFeeStep";
import { MonthlyInvestmentGrowthStep } from "../steps/MonthlyInvestmentGrowthStep";
import type { MonthlyProjectionStep } from "../steps/MonthlyProjectionStep";

import { createProjectionYearFromAccumulator } from "../utils/createProjectionYearFromAccumulator";
import { PensionInputsValidator } from "../validators/PensionInputsValidator";

export class RetirementProjectionEngine {
  private static readonly steps: MonthlyProjectionStep[] = [
    new MonthlyContributionStep(),
    new MonthlyInvestmentGrowthStep(),
    new MonthlyFeeStep(),
    new MonthlyClosingBalanceStep(),
  ];

  public static calculate(
    inputs: PensionInputs
  ): ProjectionResult {
    PensionInputsValidator.validate(inputs);

    const totalMonths =
      (inputs.retirementAge - inputs.currentAge) * 12;

    if (totalMonths === 0) {
      return {
        years: [],

        finalBalance: {
          nominal: inputs.currentPot,
          real: inputs.currentPot,
        },

        totalContributions: MoneyValueFactory.empty(),
        totalInvestmentGrowth: MoneyValueFactory.empty(),
        totalFees: MoneyValueFactory.empty(),
      };
    }

    const years: ProjectionYear[] = [];

    let currentBalance = inputs.currentPot;

    for (
      let yearStartMonth = 0;
      yearStartMonth < totalMonths;
      yearStartMonth += 12
    ) {
      const openingInflationFactor = Math.pow(
        1 + inputs.inflation,
        yearStartMonth / 12
      );

      const accumulator =
        ProjectionYearAccumulatorFactory.create(
          inputs,
          yearStartMonth,
          currentBalance,
          openingInflationFactor
        );

      for (
        let monthOffset = 0;
        monthOffset < 12;
        monthOffset += 1
      ) {
        const monthIndex =
          yearStartMonth + monthOffset;

        const context =
          MonthlyProjectionContextFactory.create(
            inputs,
            monthIndex,
            currentBalance
          );

        for (const step of this.steps) {
          step.execute(context);
        }

        accumulator.contributionsNominal +=
          context.totalContribution;

        accumulator.contributionsReal +=
          context.totalContribution /
          context.inflationFactor;

        accumulator.investmentGrowthNominal +=
          context.investmentGrowth;

        accumulator.investmentGrowthReal +=
          context.investmentGrowth /
          context.inflationFactor;

        accumulator.feesNominal +=
          context.fees;

        accumulator.feesReal +=
          context.fees /
          context.inflationFactor;

        currentBalance = context.closingBalance;

        accumulator.closingBalance =
          context.closingBalance;

        accumulator.closingInflationFactor =
          context.inflationFactor;
      }

      years.push(
        createProjectionYearFromAccumulator(
          accumulator
        )
      );
    }

    return ProjectionResultFactory.create(years);
  }
}