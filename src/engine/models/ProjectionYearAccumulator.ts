import { type PensionInputs } from "./PensionInputs";

export interface ProjectionYearAccumulator {
  inputs: PensionInputs;

  yearIndex: number;
  age: number;

  openingBalance: number;
  closingBalance: number;

  openingInflationFactor: number;
  closingInflationFactor: number;

  contributionsNominal: number;
  contributionsReal: number;

  investmentGrowthNominal: number;
  investmentGrowthReal: number;

  feesNominal: number;
  feesReal: number;
}