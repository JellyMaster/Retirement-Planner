import { UkIncomeTaxEngine } from "../tax/UkIncomeTaxEngine";
import { UK_INCOME_TAX_2026_27 } from "../tax/config/ukIncomeTaxYears";
import type { UkIncomeTaxResult } from "../tax/models/UkIncomeTaxModels";
import type { DrawdownInputs } from "./models/DrawdownInputs";
import type { DrawdownResult } from "./models/DrawdownResult";
import type { DrawdownYear } from "./models/DrawdownYear";
import { validateDrawdownInputs } from "./validators/DrawdownInputsValidator";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

function sum(years: DrawdownYear[], selector: (year: DrawdownYear) => number): number {
  return roundMoney(years.reduce((total, year) => total + selector(year), 0));
}

function getActivePhase(inputs: DrawdownInputs, age: number) {
  return inputs.spendingPhases
    ?.filter((candidate) => candidate.startAge <= age)
    .at(-1);
}

function getIncomeTarget(inputs: DrawdownInputs, age: number): number {
  const phase = getActivePhase(inputs, age);
  return roundMoney(phase?.annualIncome ?? inputs.desiredAnnualIncome);
}

function getWithdrawalRate(inputs: DrawdownInputs, age: number): number {
  const phase = getActivePhase(inputs, age);
  return roundRate(phase?.withdrawalRate ?? inputs.withdrawalRate);
}

export class DrawdownEngine {
  private readonly incomeTaxEngine = new UkIncomeTaxEngine();

  private calculateTax(pensionWithdrawal: number, statePensionIncome: number): UkIncomeTaxResult {
    return this.incomeTaxEngine.calculate({
      pensionWithdrawal,
      taxFreePensionWithdrawal: 0,
      statePensionIncome,
      otherTaxableIncome: 0,
      taxYear: UK_INCOME_TAX_2026_27,
    });
  }

  private solveWithdrawalForNetIncome(targetNetIncome: number, statePensionIncome: number): number {
    const statePensionOnly = this.calculateTax(0, statePensionIncome);
    if (statePensionOnly.netIncome >= targetNetIncome) return 0;

    let low = 0;
    let high = Math.max(targetNetIncome, 1);
    while (this.calculateTax(high, statePensionIncome).netIncome < targetNetIncome && high < 100_000_000) {
      high *= 2;
    }

    for (let iteration = 0; iteration < 80; iteration += 1) {
      const midpoint = (low + high) / 2;
      const netIncome = this.calculateTax(midpoint, statePensionIncome).netIncome;
      if (netIncome < targetNetIncome) low = midpoint;
      else high = midpoint;
    }

    return roundMoney(high);
  }

  calculate(inputs: DrawdownInputs): DrawdownResult {
    const validation = validateDrawdownInputs(inputs);
    if (!validation.isValid) {
      const details = Object.entries(validation.errors).map(([field, message]) => `${field}: ${message}`).join(" ");
      throw new Error(`Invalid drawdown inputs. ${details}`);
    }

    const taxFreeCashTaken = roundMoney(inputs.taxFreeCash);
    const balanceAfterTaxFreeCash = roundMoney(inputs.startingBalance - taxFreeCashTaken);
    const years: DrawdownYear[] = [];
    let openingBalance = balanceAfterTaxFreeCash;

    // Planning age is inclusive: a plan to age 95 includes a genuine age-95
    // retirement year with income, withdrawals, investment growth and fees.
    for (let age = inputs.retirementAge, year = 1; age <= inputs.endAge; age += 1, year += 1) {
      const inflationMultiplier = (1 + inputs.inflationRate) ** (year - 1);
      const statePensionIncome = age >= inputs.statePensionAge
        ? roundMoney(inputs.annualStatePension * inflationMultiplier)
        : 0;

      const withdrawalRate = getWithdrawalRate(inputs, age);
      const percentageWithdrawal = roundMoney(openingBalance * withdrawalRate);

      // Target-income amounts are entered in today's money. Inflate the selected
      // target into the nominal amount required in each retirement year so that
      // displaying the result in today's money preserves the user's spending goal.
      const fixedIncomeTarget = roundMoney(
        getIncomeTarget(inputs, age) * inflationMultiplier,
      );

      const requiredPensionWithdrawal = inputs.withdrawalStrategy === "percentage"
        ? percentageWithdrawal
        : inputs.incomeTargetMode === "net"
          ? this.solveWithdrawalForNetIncome(fixedIncomeTarget, statePensionIncome)
          : roundMoney(Math.max(0, fixedIncomeTarget - statePensionIncome));

      const pensionWithdrawal = roundMoney(Math.min(openingBalance, requiredPensionWithdrawal));
      const tax = this.calculateTax(pensionWithdrawal, statePensionIncome);
      const desiredIncome = inputs.withdrawalStrategy === "percentage"
        ? (inputs.incomeTargetMode === "net" ? tax.netIncome : tax.grossIncome)
        : fixedIncomeTarget;

      const incomeShortfall = inputs.withdrawalStrategy === "target-income" && inputs.incomeTargetMode === "gross"
        ? roundMoney(Math.max(0, desiredIncome - tax.grossIncome))
        : 0;
      const netIncomeShortfall = inputs.withdrawalStrategy === "target-income" && inputs.incomeTargetMode === "net"
        ? roundMoney(Math.max(0, desiredIncome - tax.netIncome))
        : 0;

      const balanceAfterWithdrawal = roundMoney(Math.max(0, openingBalance - pensionWithdrawal));
      const investmentGrowth = roundMoney(balanceAfterWithdrawal * inputs.annualReturn);
      const balanceBeforeFees = roundMoney(Math.max(0, balanceAfterWithdrawal + investmentGrowth));
      const fees = roundMoney(balanceBeforeFees * inputs.annualFee);
      const closingBalance = roundMoney(Math.max(0, balanceBeforeFees - fees));

      years.push({
        year,
        age,
        openingBalance,
        desiredIncome,
        incomeTargetMode: inputs.incomeTargetMode,
        statePensionIncome,
        requiredPensionWithdrawal,
        pensionWithdrawal,
        grossIncome: tax.grossIncome,
        taxableIncome: tax.taxableIncome,
        personalAllowance: tax.personalAllowance,
        incomeTax: tax.incomeTax,
        netIncome: tax.netIncome,
        effectiveTaxRate: tax.effectiveTaxRate,
        netIncomeShortfall,
        incomeShortfall,
        investmentGrowth,
        fees,
        closingBalance,
        isDepleted:
          closingBalance === 0 &&
          requiredPensionWithdrawal > pensionWithdrawal,
      });
      openingBalance = closingBalance;
    }

    const depletionYear = years.find((year) => year.isDepleted);
    const firstShortfallYear = years.find((year) => year.incomeShortfall > 0);
    const firstNetIncomeShortfallYear = years.find((year) => year.netIncomeShortfall > 0);
    const totalGrossIncome = sum(years, (year) => year.grossIncome);
    const totalIncomeTax = sum(years, (year) => year.incomeTax);

    return {
      startingBalance: roundMoney(inputs.startingBalance),
      withdrawalStrategy: inputs.withdrawalStrategy,
      withdrawalRate: roundRate(inputs.withdrawalRate),
      incomeTargetMode: inputs.incomeTargetMode,
      taxFreeCashTaken,
      balanceAfterTaxFreeCash,
      years,
      finalBalance: years.at(-1)?.closingBalance ?? balanceAfterTaxFreeCash,
      depletionAge: depletionYear?.age ?? null,
      firstShortfallAge: firstShortfallYear?.age ?? null,
      firstNetIncomeShortfallAge: firstNetIncomeShortfallYear?.age ?? null,
      totalDesiredIncome: sum(years, (year) => year.desiredIncome),
      totalStatePensionIncome: sum(years, (year) => year.statePensionIncome),
      totalPensionWithdrawals: sum(years, (year) => year.pensionWithdrawal),
      totalGrossIncome,
      totalIncomeTax,
      totalNetIncome: sum(years, (year) => year.netIncome),
      totalNetIncomeShortfall: sum(years, (year) => year.netIncomeShortfall),
      averageEffectiveTaxRate: totalGrossIncome === 0 ? 0 : roundRate(totalIncomeTax / totalGrossIncome),
      totalIncomeShortfall: sum(years, (year) => year.incomeShortfall),
      totalInvestmentGrowth: sum(years, (year) => year.investmentGrowth),
      totalFees: sum(years, (year) => year.fees),
    };
  }
}
