import type { DrawdownInputs } from "./models/DrawdownInputs";
import type { DrawdownResult } from "./models/DrawdownResult";
import type { DrawdownYear } from "./models/DrawdownYear";
import { validateDrawdownInputs } from "./validators/DrawdownInputsValidator";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sum(
  years: DrawdownYear[],
  selector: (year: DrawdownYear) => number,
): number {
  return roundMoney(
    years.reduce((total, year) => total + selector(year), 0),
  );
}

export class DrawdownEngine {
  calculate(inputs: DrawdownInputs): DrawdownResult {
    const validation = validateDrawdownInputs(inputs);

    if (!validation.isValid) {
      const details = Object.entries(validation.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");

      throw new Error(`Invalid drawdown inputs. ${details}`);
    }

    const taxFreeCashTaken = roundMoney(inputs.taxFreeCash);
    const balanceAfterTaxFreeCash = roundMoney(
      inputs.startingBalance - taxFreeCashTaken,
    );

    const years: DrawdownYear[] = [];
    let openingBalance = balanceAfterTaxFreeCash;

    for (
      let age = inputs.retirementAge, year = 1;
      age < inputs.endAge;
      age += 1, year += 1
    ) {
      const inflationMultiplier = (1 + inputs.inflationRate) ** (year - 1);
      // Treat the user's desired annual income as the maximum nominal income
      // target for each projection year. As State Pension rises with inflation,
      // the amount required from the private pension should fall accordingly.
      const desiredIncome = roundMoney(inputs.desiredAnnualIncome);

      const statePensionIncome =
        age >= inputs.statePensionAge
          ? roundMoney(inputs.annualStatePension * inflationMultiplier)
          : 0;

      const requiredPensionWithdrawal = roundMoney(
        Math.max(0, desiredIncome - statePensionIncome),
      );

      const pensionWithdrawal = roundMoney(
        Math.min(openingBalance, requiredPensionWithdrawal),
      );

      const incomeShortfall = roundMoney(
        Math.max(
          0,
          desiredIncome - statePensionIncome - pensionWithdrawal,
        ),
      );

      const balanceAfterWithdrawal = roundMoney(
        Math.max(0, openingBalance - pensionWithdrawal),
      );

      const investmentGrowth = roundMoney(
        balanceAfterWithdrawal * inputs.annualReturn,
      );

      const balanceBeforeFees = roundMoney(
        Math.max(0, balanceAfterWithdrawal + investmentGrowth),
      );

      const fees = roundMoney(balanceBeforeFees * inputs.annualFee);
      const closingBalance = roundMoney(
        Math.max(0, balanceBeforeFees - fees),
      );

      years.push({
        year,
        age,
        openingBalance,
        desiredIncome,
        statePensionIncome,
        requiredPensionWithdrawal,
        pensionWithdrawal,
        incomeShortfall,
        investmentGrowth,
        fees,
        closingBalance,
        isDepleted:
          closingBalance === 0 && requiredPensionWithdrawal > 0,
      });

      openingBalance = closingBalance;
    }

    const depletionYear = years.find((year) => year.isDepleted);
    const firstShortfallYear = years.find(
      (year) => year.incomeShortfall > 0,
    );

    return {
      startingBalance: roundMoney(inputs.startingBalance),
      taxFreeCashTaken,
      balanceAfterTaxFreeCash,
      years,
      finalBalance:
        years.at(-1)?.closingBalance ?? balanceAfterTaxFreeCash,
      depletionAge: depletionYear?.age ?? null,
      firstShortfallAge: firstShortfallYear?.age ?? null,
      totalDesiredIncome: sum(years, (year) => year.desiredIncome),
      totalStatePensionIncome: sum(
        years,
        (year) => year.statePensionIncome,
      ),
      totalPensionWithdrawals: sum(
        years,
        (year) => year.pensionWithdrawal,
      ),
      totalIncomeShortfall: sum(
        years,
        (year) => year.incomeShortfall,
      ),
      totalInvestmentGrowth: sum(
        years,
        (year) => year.investmentGrowth,
      ),
      totalFees: sum(years, (year) => year.fees),
    };
  }
}
