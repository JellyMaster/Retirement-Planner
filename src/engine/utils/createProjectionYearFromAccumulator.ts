import { MoneyValueFactory } from "../factories/MoneyValueFactory";

import type { ProjectionYear } from "../models/ProjectionYear";
import type { ProjectionYearAccumulator } from "../models/ProjectionYearAccumulator";

export function createProjectionYearFromAccumulator(
  accumulator: ProjectionYearAccumulator
): ProjectionYear {
  return {
    yearIndex: accumulator.yearIndex,
    age: accumulator.age,

    openingBalance: MoneyValueFactory.create(
      accumulator.openingBalance,
      accumulator.openingInflationFactor
    ),

    contributions: {
      nominal: accumulator.contributionsNominal,
      real: accumulator.contributionsReal,
    },

    investmentGrowth: {
      nominal: accumulator.investmentGrowthNominal,
      real: accumulator.investmentGrowthReal,
    },

    fees: {
      nominal: accumulator.feesNominal,
      real: accumulator.feesReal,
    },

    closingBalance: MoneyValueFactory.create(
      accumulator.closingBalance,
      accumulator.closingInflationFactor
    ),
  };
}