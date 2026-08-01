import { UK_INCOME_TAX_2026_27 } from "../tax/config/ukIncomeTaxYears";
import type { UkIncomeTaxResult } from "../tax/models/UkIncomeTaxModels";
import { UkIncomeTaxEngine } from "../tax/UkIncomeTaxEngine";
import { validateDrawdownInputs } from "../drawdown/validators/DrawdownInputsValidator";
import { NormalDistribution } from "../monte-carlo/NormalDistribution";
import { SeededRandom } from "../monte-carlo/SeededRandom";
import { calculateMonteCarloDrawdownStatistics } from "./MonteCarloDrawdownStatistics";
import type {
  MonteCarloDrawdownConfig,
  MonteCarloDrawdownPath,
  MonteCarloDrawdownResult,
} from "./MonteCarloDrawdownTypes";

const DEFAULT_SIMULATIONS = 2_000;
const DEFAULT_SEED = 12_345;
const DEFAULT_VOLATILITY = 0.12;
const DEFAULT_MINIMUM_RETURN = -0.75;
const DEFAULT_MAXIMUM_RETURN = 1;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validateConfig(config: MonteCarloDrawdownConfig): Required<
  Omit<MonteCarloDrawdownConfig, "drawdownInputs">
> {
  const validation = validateDrawdownInputs(config.drawdownInputs);
  if (!validation.isValid) {
    const details = Object.entries(validation.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(" ");
    throw new Error(`Invalid drawdown inputs. ${details}`);
  }

  const simulations = config.simulations ?? DEFAULT_SIMULATIONS;
  const seed = config.seed ?? DEFAULT_SEED;
  const annualVolatility = config.annualVolatility ?? DEFAULT_VOLATILITY;
  const minimumAnnualReturn =
    config.minimumAnnualReturn ?? DEFAULT_MINIMUM_RETURN;
  const maximumAnnualReturn =
    config.maximumAnnualReturn ?? DEFAULT_MAXIMUM_RETURN;

  if (!Number.isInteger(simulations) || simulations < 1 || simulations > 100_000) {
    throw new RangeError("Simulations must be a whole number between 1 and 100,000.");
  }
  if (!Number.isFinite(seed)) {
    throw new TypeError("Seed must be a finite number.");
  }
  if (!Number.isFinite(annualVolatility) || annualVolatility < 0 || annualVolatility > 1) {
    throw new RangeError("Annual volatility must be between 0% and 100%.");
  }
  if (!Number.isFinite(minimumAnnualReturn) || minimumAnnualReturn <= -1) {
    throw new RangeError("Minimum annual return must be greater than -100%.");
  }
  if (!Number.isFinite(maximumAnnualReturn) || maximumAnnualReturn > 10) {
    throw new RangeError("Maximum annual return must be no more than 1,000%.");
  }
  if (minimumAnnualReturn > maximumAnnualReturn) {
    throw new RangeError("Minimum annual return cannot exceed maximum annual return.");
  }

  return {
    simulations,
    seed: Math.trunc(seed),
    annualVolatility,
    minimumAnnualReturn,
    maximumAnnualReturn,
  };
}

export class MonteCarloDrawdownEngine {
  private readonly incomeTaxEngine = new UkIncomeTaxEngine();

  private calculateTax(
    pensionWithdrawal: number,
    statePensionIncome: number,
  ): UkIncomeTaxResult {
    return this.incomeTaxEngine.calculate({
      pensionWithdrawal,
      taxFreePensionWithdrawal: 0,
      statePensionIncome,
      otherTaxableIncome: 0,
      taxYear: UK_INCOME_TAX_2026_27,
    });
  }

  private solveWithdrawalForNetIncome(
    targetNetIncome: number,
    statePensionIncome: number,
  ): number {
    const statePensionOnly = this.calculateTax(0, statePensionIncome);
    if (statePensionOnly.netIncome >= targetNetIncome) return 0;

    let low = 0;
    let high = Math.max(targetNetIncome, 1);
    while (
      this.calculateTax(high, statePensionIncome).netIncome < targetNetIncome &&
      high < 100_000_000
    ) {
      high *= 2;
    }

    for (let iteration = 0; iteration < 80; iteration += 1) {
      const midpoint = (low + high) / 2;
      if (this.calculateTax(midpoint, statePensionIncome).netIncome < targetNetIncome) {
        low = midpoint;
      } else {
        high = midpoint;
      }
    }

    return roundMoney(high);
  }

  public calculate(config: MonteCarloDrawdownConfig): MonteCarloDrawdownResult {
    const settings = validateConfig(config);
    const random = new SeededRandom(settings.seed);
    const distribution = new NormalDistribution(random);
    const paths: MonteCarloDrawdownPath[] = [];

    for (let simulation = 0; simulation < settings.simulations; simulation += 1) {
      paths.push(
        this.simulatePath(
          config,
          settings.annualVolatility,
          settings.minimumAnnualReturn,
          settings.maximumAnnualReturn,
          distribution,
        ),
      );
    }

    return calculateMonteCarloDrawdownStatistics({
      paths,
      seed: settings.seed,
      annualVolatility: settings.annualVolatility,
      minimumAnnualReturn: settings.minimumAnnualReturn,
      maximumAnnualReturn: settings.maximumAnnualReturn,
      retirementAge: config.drawdownInputs.retirementAge,
      endAge: config.drawdownInputs.endAge,
    });
  }

  private simulatePath(
    config: MonteCarloDrawdownConfig,
    annualVolatility: number,
    minimumAnnualReturn: number,
    maximumAnnualReturn: number,
    distribution: NormalDistribution,
  ): MonteCarloDrawdownPath {
    const inputs = config.drawdownInputs;
    let openingBalance = roundMoney(inputs.startingBalance - inputs.taxFreeCash);
    let depletionAge: number | null = null;
    let firstIncomeShortfallAge: number | null = null;
    let totalIncomeShortfall = 0;
    const balancesByAge: number[] = [];

    for (let age = inputs.retirementAge, year = 1; age < inputs.endAge; age += 1, year += 1) {
      const inflationMultiplier = (1 + inputs.inflationRate) ** (year - 1);
      const statePensionIncome =
        age >= inputs.statePensionAge
          ? roundMoney(inputs.annualStatePension * inflationMultiplier)
          : 0;
      const percentageWithdrawal = roundMoney(openingBalance * inputs.withdrawalRate);
      const fixedIncomeTarget = roundMoney(inputs.desiredAnnualIncome);
      const requiredPensionWithdrawal =
        inputs.withdrawalStrategy === "percentage"
          ? percentageWithdrawal
          : inputs.incomeTargetMode === "net"
            ? this.solveWithdrawalForNetIncome(
                fixedIncomeTarget,
                statePensionIncome,
              )
            : roundMoney(Math.max(0, fixedIncomeTarget - statePensionIncome));
      const pensionWithdrawal = roundMoney(
        Math.min(openingBalance, requiredPensionWithdrawal),
      );
      const tax = this.calculateTax(pensionWithdrawal, statePensionIncome);
      const desiredIncome =
        inputs.withdrawalStrategy === "percentage"
          ? inputs.incomeTargetMode === "net"
            ? tax.netIncome
            : tax.grossIncome
          : fixedIncomeTarget;
      const incomeShortfall =
        inputs.withdrawalStrategy === "target-income"
          ? inputs.incomeTargetMode === "net"
            ? roundMoney(Math.max(0, desiredIncome - tax.netIncome))
            : roundMoney(Math.max(0, desiredIncome - tax.grossIncome))
          : 0;

      if (incomeShortfall > 0 && firstIncomeShortfallAge === null) {
        firstIncomeShortfallAge = age;
      }
      totalIncomeShortfall = roundMoney(totalIncomeShortfall + incomeShortfall);

      const balanceAfterWithdrawal = roundMoney(
        Math.max(0, openingBalance - pensionWithdrawal),
      );
      const sampledReturn = Math.min(
        maximumAnnualReturn,
        Math.max(
          minimumAnnualReturn,
          distribution.sample(inputs.annualReturn, annualVolatility),
        ),
      );
      const investmentGrowth = roundMoney(balanceAfterWithdrawal * sampledReturn);
      const balanceBeforeFees = roundMoney(
        Math.max(0, balanceAfterWithdrawal + investmentGrowth),
      );
      const fees = roundMoney(balanceBeforeFees * inputs.annualFee);
      const closingBalance = roundMoney(Math.max(0, balanceBeforeFees - fees));
      const isDepleted =
        closingBalance === 0 && requiredPensionWithdrawal > pensionWithdrawal;

      if (isDepleted && depletionAge === null) {
        depletionAge = age;
      }

      balancesByAge.push(closingBalance);
      openingBalance = closingBalance;
    }

    return {
      finalBalance: openingBalance,
      depletionAge,
      firstIncomeShortfallAge,
      totalIncomeShortfall,
      balancesByAge,
    };
  }
}
