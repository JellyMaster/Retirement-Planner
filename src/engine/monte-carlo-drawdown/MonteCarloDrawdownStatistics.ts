import { calculatePercentiles, percentile } from "../monte-carlo/MonteCarloStatistics";
import type {
  MonteCarloDrawdownAgeStatistics,
  MonteCarloDrawdownPath,
  MonteCarloDrawdownResult,
} from "./MonteCarloDrawdownTypes";

export interface MonteCarloDrawdownStatisticsConfig {
  paths: readonly MonteCarloDrawdownPath[];
  seed: number;
  annualVolatility: number;
  minimumAnnualReturn: number;
  maximumAnnualReturn: number;
  retirementAge: number;
  endAge: number;
}

export function calculateMonteCarloDrawdownStatistics({
  paths,
  seed,
  annualVolatility,
  minimumAnnualReturn,
  maximumAnnualReturn,
  retirementAge,
  endAge,
}: MonteCarloDrawdownStatisticsConfig): MonteCarloDrawdownResult {
  if (paths.length === 0) {
    throw new RangeError("At least one drawdown simulation path is required.");
  }

  const depletedPaths = paths.filter((path) => path.depletionAge !== null);
  const shortfallPaths = paths.filter((path) => path.firstIncomeShortfallAge !== null);
  const depletionAges = depletedPaths.map((path) => path.depletionAge as number);
  const ageStatistics: MonteCarloDrawdownAgeStatistics[] = [];

  for (let age = retirementAge; age <= endAge; age += 1) {
    const yearIndex = age - retirementAge;
    const balances = paths.map((path) => path.balancesByAge[yearIndex] ?? 0);
    const depletedByAge = paths.filter(
      (path) => path.depletionAge !== null && path.depletionAge <= age,
    ).length;
    const shortfallByAge = paths.filter(
      (path) =>
        path.firstIncomeShortfallAge !== null &&
        path.firstIncomeShortfallAge <= age,
    ).length;

    ageStatistics.push({
      age,
      survivalProbability: 1 - depletedByAge / paths.length,
      depletionProbability: depletedByAge / paths.length,
      incomeReliabilityProbability: 1 - shortfallByAge / paths.length,
      balance: calculatePercentiles(balances),
    });
  }

  return {
    simulations: paths.length,
    seed,
    annualVolatility,
    minimumAnnualReturn,
    maximumAnnualReturn,
    retirementAge,
    endAge,
    survivalProbability: 1 - depletedPaths.length / paths.length,
    incomeReliabilityProbability: 1 - shortfallPaths.length / paths.length,
    probabilityOfAnyIncomeShortfall: shortfallPaths.length / paths.length,
    medianDepletionAge:
      depletionAges.length === 0 ? null : percentile(depletionAges, 0.5),
    medianTotalIncomeShortfall: percentile(
      paths.map((path) => path.totalIncomeShortfall),
      0.5,
    ),
    finalBalance: calculatePercentiles(paths.map((path) => path.finalBalance)),
    ageStatistics,
  };
}
