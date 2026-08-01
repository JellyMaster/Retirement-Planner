import { PensionInputsValidator } from "../validators/PensionInputsValidator";
import { convertAnnualFeeToMonthlyRate } from "../utils/convertAnnualFeeToMonthlyRate";
import { convertAnnualRateToMonthlyRate } from "../utils/convertAnnualRateToMonthlyRate";
import { calculatePercentiles, percentile } from "./MonteCarloStatistics";
import type {
  MonteCarloConfig,
  MonteCarloResult,
  MonteCarloSimulationPath,
  MonteCarloYearPercentiles,
} from "./MonteCarloTypes";
import { NormalDistribution } from "./NormalDistribution";
import { SeededRandom } from "./SeededRandom";

const DEFAULT_SIMULATIONS = 5_000;
const DEFAULT_SEED = 12_345;
const DEFAULT_VOLATILITY = 0.12;
const DEFAULT_MINIMUM_RETURN = -0.95;
const DEFAULT_MAXIMUM_RETURN = 1;

export class MonteCarloEngine {
  public static calculate(config: MonteCarloConfig): MonteCarloResult {
    this.validateConfig(config);

    const simulations = config.simulations ?? DEFAULT_SIMULATIONS;
    const seed = config.seed ?? DEFAULT_SEED;
    const annualVolatility = config.annualVolatility ?? DEFAULT_VOLATILITY;
    const minimumAnnualReturn =
      config.minimumAnnualReturn ?? DEFAULT_MINIMUM_RETURN;
    const maximumAnnualReturn =
      config.maximumAnnualReturn ?? DEFAULT_MAXIMUM_RETURN;

    const random = new SeededRandom(seed);
    const distribution = new NormalDistribution(random);
    const paths: MonteCarloSimulationPath[] = [];

    for (let index = 0; index < simulations; index += 1) {
      paths.push(
        this.simulatePath(
          config.pensionInputs,
          distribution,
          annualVolatility,
          minimumAnnualReturn,
          maximumAnnualReturn
        )
      );
    }

    const finalNominalBalances = paths.map(
      (path) => path.finalNominalBalance
    );
    const finalRealBalances = paths.map((path) => path.finalRealBalance);
    const annualisedReturns = paths.map(
      (path) => path.annualisedSampledReturn
    );

    const result: MonteCarloResult = {
      simulations,
      seed,
      annualVolatility,
      targetRealBalance: config.targetRealBalance,
      finalNominalBalance: calculatePercentiles(finalNominalBalances),
      finalRealBalance: calculatePercentiles(finalRealBalances),
      medianAnnualisedSampledReturn: percentile(annualisedReturns, 0.5),
      worstFinalRealBalance: Math.min(...finalRealBalances),
      bestFinalRealBalance: Math.max(...finalRealBalances),
      yearlyPercentiles: this.calculateYearlyPercentiles(
        paths,
        config.pensionInputs.currentAge
      ),
    };

    if (config.targetRealBalance !== undefined) {
      const successfulPaths = finalRealBalances.filter(
        (balance) => balance >= config.targetRealBalance!
      ).length;
      result.successProbability = successfulPaths / simulations;
    }

    return result;
  }

  private static simulatePath(
    inputs: MonteCarloConfig["pensionInputs"],
    distribution: NormalDistribution,
    annualVolatility: number,
    minimumAnnualReturn: number,
    maximumAnnualReturn: number
  ): MonteCarloSimulationPath {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;

    if (yearsToRetirement === 0) {
      return {
        finalNominalBalance: inputs.currentPot,
        finalRealBalance: inputs.currentPot,
        annualisedSampledReturn: 0,
        yearlyNominalBalances: [],
        yearlyRealBalances: [],
      };
    }

    const monthlyFeeRate = convertAnnualFeeToMonthlyRate(inputs.annualFee);
    const monthlyInflationRate = convertAnnualRateToMonthlyRate(inputs.inflation);
    const yearlyNominalBalances: number[] = [];
    const yearlyRealBalances: number[] = [];
    const sampledAnnualReturns: number[] = [];
    let currentBalance = inputs.currentPot;
    let inflationFactor = 1;

    for (let yearIndex = 0; yearIndex < yearsToRetirement; yearIndex += 1) {
      const sampledReturn = Math.min(
        maximumAnnualReturn,
        Math.max(
          minimumAnnualReturn,
          distribution.sample(inputs.annualReturn, annualVolatility)
        )
      );
      sampledAnnualReturns.push(sampledReturn);
      const monthlyReturn = convertAnnualRateToMonthlyRate(sampledReturn);
      const contributionIncreaseFactor = Math.pow(
        1 + inputs.annualContributionIncrease,
        yearIndex
      );

      for (let month = 0; month < 12; month += 1) {
        const age = inputs.currentAge + yearIndex + month / 12;
        const regularContribution =
          (inputs.monthlyEmployeeContribution +
            inputs.monthlyEmployerContribution) *
          contributionIncreaseFactor;
        const extraContribution =
          inputs.extraContributionAge !== undefined &&
          inputs.extraMonthlyContribution !== undefined &&
          age >= inputs.extraContributionAge
            ? inputs.extraMonthlyContribution
            : 0;

        currentBalance += regularContribution + extraContribution;
        currentBalance += currentBalance * monthlyReturn;
        currentBalance -= currentBalance * monthlyFeeRate;
        inflationFactor *= 1 + monthlyInflationRate;
      }

      yearlyNominalBalances.push(currentBalance);
      yearlyRealBalances.push(currentBalance / inflationFactor);
    }

    const compoundedReturn = sampledAnnualReturns.reduce(
      (factor, annualReturn) => factor * (1 + annualReturn),
      1
    );

    return {
      finalNominalBalance: currentBalance,
      finalRealBalance: currentBalance / inflationFactor,
      annualisedSampledReturn:
        Math.pow(compoundedReturn, 1 / yearsToRetirement) - 1,
      yearlyNominalBalances,
      yearlyRealBalances,
    };
  }

  private static calculateYearlyPercentiles(
    paths: readonly MonteCarloSimulationPath[],
    currentAge: number
  ): MonteCarloYearPercentiles[] {
    const yearCount = paths[0]?.yearlyNominalBalances.length ?? 0;
    const yearlyPercentiles: MonteCarloYearPercentiles[] = [];

    for (let yearIndex = 0; yearIndex < yearCount; yearIndex += 1) {
      yearlyPercentiles.push({
        yearIndex,
        age: currentAge + yearIndex + 1,
        nominal: calculatePercentiles(
          paths.map((path) => path.yearlyNominalBalances[yearIndex])
        ),
        real: calculatePercentiles(
          paths.map((path) => path.yearlyRealBalances[yearIndex])
        ),
      });
    }

    return yearlyPercentiles;
  }

  private static validateConfig(config: MonteCarloConfig): void {
    PensionInputsValidator.validate(config.pensionInputs);

    const simulations = config.simulations ?? DEFAULT_SIMULATIONS;
    if (!Number.isInteger(simulations) || simulations < 1 || simulations > 100_000) {
      throw new RangeError(
        "Simulation count must be an integer between 1 and 100,000."
      );
    }

    const volatility = config.annualVolatility ?? DEFAULT_VOLATILITY;
    if (!Number.isFinite(volatility) || volatility < 0 || volatility > 1) {
      throw new RangeError("Annual volatility must be between 0% and 100%.");
    }

    if (
      config.targetRealBalance !== undefined &&
      (!Number.isFinite(config.targetRealBalance) || config.targetRealBalance < 0)
    ) {
      throw new RangeError("Target real balance must be a non-negative number.");
    }

    const minimumReturn = config.minimumAnnualReturn ?? DEFAULT_MINIMUM_RETURN;
    const maximumReturn = config.maximumAnnualReturn ?? DEFAULT_MAXIMUM_RETURN;

    if (!Number.isFinite(minimumReturn) || minimumReturn <= -1) {
      throw new RangeError("Minimum annual return must be greater than -100%.");
    }

    if (!Number.isFinite(maximumReturn) || maximumReturn < minimumReturn) {
      throw new RangeError(
        "Maximum annual return must be finite and at least the minimum return."
      );
    }
  }
}
