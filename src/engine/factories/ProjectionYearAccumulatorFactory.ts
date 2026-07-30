import { type PensionInputs } from "../models/PensionInputs";
import { type  ProjectionYearAccumulator } from "../models/ProjectionYearAccumulator";

export class ProjectionYearAccumulatorFactory {
  public static create(
    inputs: PensionInputs,
    monthIndex: number,
    openingBalance: number,
    openingInflationFactor: number
  ): ProjectionYearAccumulator {
    return {
      inputs,

      yearIndex: Math.floor(monthIndex / 12),

      age:
        inputs.currentAge +
        Math.floor(monthIndex / 12),

      openingBalance,
      closingBalance: openingBalance,

      openingInflationFactor,
      closingInflationFactor:
        openingInflationFactor,

      contributionsNominal: 0,
      contributionsReal: 0,

      investmentGrowthNominal: 0,
      investmentGrowthReal: 0,

      feesNominal: 0,
      feesReal: 0,
    };
  }
}