import { MoneyValueFactory } from "./MoneyValueFactory";
import { type MoneyValue } from "../models/MoneyValue";
import { type ProjectionResult } from "../models/ProjectionResult";
import { type ProjectionYear } from "../models/ProjectionYear";

export class ProjectionResultFactory {
  public static create(
    years: ProjectionYear[]
  ): ProjectionResult {
    if (years.length === 0) {
      return {
        years: [],
        finalBalance: MoneyValueFactory.empty(),
        totalContributions: MoneyValueFactory.empty(),
        totalInvestmentGrowth: MoneyValueFactory.empty(),
        totalFees: MoneyValueFactory.empty(),
      };
    }

    const finalYear = years[years.length - 1];

    return {
      years,

      finalBalance: {
        ...finalYear.closingBalance,
      },

      totalContributions: this.sumMoneyValues(
        years.map((year) => year.contributions)
      ),

      totalInvestmentGrowth: this.sumMoneyValues(
        years.map((year) => year.investmentGrowth)
      ),

      totalFees: this.sumMoneyValues(
        years.map((year) => year.fees)
      ),
    };
  }

  private static sumMoneyValues(
    values: MoneyValue[]
  ): MoneyValue {
    return values.reduce(
      (total, value) => ({
        nominal: total.nominal + value.nominal,
        real: total.real + value.real,
      }),
      MoneyValueFactory.empty()
    );
  }
}