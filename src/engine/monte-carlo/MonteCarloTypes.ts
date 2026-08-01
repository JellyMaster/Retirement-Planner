import type { PensionInputs } from "../models/PensionInputs";

export interface MonteCarloConfig {
  pensionInputs: PensionInputs;
  simulations?: number;
  seed?: number;
  annualVolatility?: number;
  targetRealBalance?: number;
  minimumAnnualReturn?: number;
  maximumAnnualReturn?: number;
}

export interface MonteCarloSimulationPath {
  finalNominalBalance: number;
  finalRealBalance: number;
  annualisedSampledReturn: number;
  yearlyNominalBalances: number[];
  yearlyRealBalances: number[];
}

export interface MonteCarloPercentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MonteCarloYearPercentiles {
  age: number;
  yearIndex: number;
  nominal: MonteCarloPercentiles;
  real: MonteCarloPercentiles;
}

export interface MonteCarloResult {
  simulations: number;
  seed: number;
  annualVolatility: number;
  targetRealBalance?: number;
  successProbability?: number;
  finalNominalBalance: MonteCarloPercentiles;
  finalRealBalance: MonteCarloPercentiles;
  medianAnnualisedSampledReturn: number;
  worstFinalRealBalance: number;
  bestFinalRealBalance: number;
  yearlyPercentiles: MonteCarloYearPercentiles[];
}
