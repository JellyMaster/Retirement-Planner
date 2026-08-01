import type { DrawdownInputs } from "../drawdown/models/DrawdownInputs";
import type { MonteCarloPercentiles } from "../monte-carlo/MonteCarloTypes";

export interface MonteCarloDrawdownConfig {
  drawdownInputs: DrawdownInputs;
  simulations?: number;
  seed?: number;
  annualVolatility?: number;
  minimumAnnualReturn?: number;
  maximumAnnualReturn?: number;
}

export interface MonteCarloDrawdownPath {
  finalBalance: number;
  depletionAge: number | null;
  firstIncomeShortfallAge: number | null;
  totalIncomeShortfall: number;
  balancesByAge: number[];
}

export interface MonteCarloDrawdownAgeStatistics {
  age: number;
  survivalProbability: number;
  depletionProbability: number;
  incomeReliabilityProbability: number;
  balance: MonteCarloPercentiles;
}

export interface MonteCarloDrawdownResult {
  simulations: number;
  seed: number;
  annualVolatility: number;
  minimumAnnualReturn: number;
  maximumAnnualReturn: number;
  retirementAge: number;
  endAge: number;
  survivalProbability: number;
  incomeReliabilityProbability: number;
  probabilityOfAnyIncomeShortfall: number;
  medianDepletionAge: number | null;
  medianTotalIncomeShortfall: number;
  finalBalance: MonteCarloPercentiles;
  ageStatistics: MonteCarloDrawdownAgeStatistics[];
}
