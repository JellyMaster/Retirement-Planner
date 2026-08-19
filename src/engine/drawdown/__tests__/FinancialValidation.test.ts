import { describe, expect, it } from "vitest";

import { getDisplayYears } from "../../../utils/drawdownDisplayValues";
import { MonteCarloDrawdownEngine } from "../../monte-carlo-drawdown/MonteCarloDrawdownEngine";
import { DrawdownEngine } from "../DrawdownEngine";
import type { DrawdownInputs } from "../models/DrawdownInputs";

function createInputs(overrides: Partial<DrawdownInputs> = {}): DrawdownInputs {
  return {
    startingBalance: 500_000,
    retirementAge: 65,
    endAge: 65,
    withdrawalStrategy: "target-income",
    withdrawalRate: 0.04,
    desiredAnnualIncome: 0,
    incomeTargetMode: "gross",
    annualStatePension: 0,
    statePensionAge: 67,
    annualReturn: 0,
    annualFee: 0,
    inflationRate: 0,
    taxFreeCash: 0,
    ...overrides,
  };
}

describe("Drawdown financial validation", () => {
  it("withdraws exactly 4% of a £1m opening pot for a percentage strategy", () => {
    const result = new DrawdownEngine().calculate(
      createInputs({
        startingBalance: 1_000_000,
        withdrawalStrategy: "percentage",
        withdrawalRate: 0.04,
      }),
    );

    expect(result.years).toHaveLength(1);
    expect(result.years[0].pensionWithdrawal).toBe(40_000);
    expect(result.years[0].closingBalance).toBe(960_000);
  });

  it("deducts a 25% tax-free cash amount before drawdown begins", () => {
    const startingBalance = 962_911;
    const taxFreeCash = startingBalance * 0.25;

    const result = new DrawdownEngine().calculate(
      createInputs({
        startingBalance,
        taxFreeCash,
      }),
    );

    expect(result.taxFreeCashTaken).toBe(240_727.75);
    expect(result.balanceAfterTaxFreeCash).toBe(722_183.25);
    expect(result.years[0].openingBalance).toBe(722_183.25);
  });

  it("keeps real opening value constant when nominal return equals inflation and there are no withdrawals", () => {
    const inflationRate = 0.025;
    const result = new DrawdownEngine().calculate(
      createInputs({
        startingBalance: 100_000,
        retirementAge: 65,
        endAge: 67,
        annualReturn: inflationRate,
        inflationRate,
      }),
    );

    expect(result.years.map((year) => year.closingBalance)).toEqual([
      102_500,
      105_062.5,
      107_689.06,
    ]);

    const todayMoney = getDisplayYears(result.years, inflationRate, "today");
    todayMoney.forEach((year) => {
      expect(year.openingBalance).toBeCloseTo(100_000, 1);
      expect(year.closingBalance).toBeCloseTo(102_500, 1);
    });
  });

  it("reduces private-pension drawdown when State Pension begins", () => {
    const result = new DrawdownEngine().calculate(
      createInputs({
        retirementAge: 68,
        endAge: 69,
        desiredAnnualIncome: 30_000,
        annualStatePension: 12_000,
        statePensionAge: 69,
      }),
    );

    expect(result.years[0]).toMatchObject({
      age: 68,
      statePensionIncome: 0,
      pensionWithdrawal: 30_000,
      grossIncome: 30_000,
    });
    expect(result.years[1]).toMatchObject({
      age: 69,
      statePensionIncome: 12_000,
      pensionWithdrawal: 18_000,
      grossIncome: 30_000,
    });
  });

  it("applies the 2026/27 personal allowance and basic rate to taxable pension income", () => {
    const result = new DrawdownEngine().calculate(
      createInputs({
        desiredAnnualIncome: 20_000,
      }),
    );

    expect(result.years[0]).toMatchObject({
      grossIncome: 20_000,
      personalAllowance: 12_570,
      taxableIncome: 7_430,
      incomeTax: 1_486,
      netIncome: 18_514,
    });
  });

  it("inflates a net spending target nominally while preserving today's purchasing power", () => {
    const inflationRate = 0.025;
    const result = new DrawdownEngine().calculate(
      createInputs({
        startingBalance: 1_000_000,
        retirementAge: 68,
        endAge: 71,
        desiredAnnualIncome: 45_400,
        incomeTargetMode: "net",
        annualStatePension: 11_500,
        statePensionAge: 68,
        inflationRate,
      }),
    );

    const futureMoney = getDisplayYears(result.years, inflationRate, "nominal");
    const todayMoney = getDisplayYears(result.years, inflationRate, "today");

    expect(futureMoney[0].netIncome).toBeCloseTo(45_400, 2);
    expect(futureMoney[1].netIncome).toBeCloseTo(46_535, 2);
    expect(futureMoney[2].netIncome).toBeCloseTo(47_698.38, 2);
    expect(futureMoney[3].netIncome).toBeCloseTo(48_890.83, 2);

    todayMoney.forEach((year) => {
      expect(year.netIncome).toBeCloseTo(45_400, 1);
    });
  });

  it("models the planning age as a genuine final retirement year", () => {
    const result = new DrawdownEngine().calculate(
      createInputs({
        retirementAge: 68,
        endAge: 70,
      }),
    );

    expect(result.years.map((year) => year.age)).toEqual([68, 69, 70]);
    expect(result.years.map((year) => year.year)).toEqual([1, 2, 3]);
  });

  it("matches deterministic drawdown when Monte Carlo volatility is zero", () => {
    const inputs = createInputs({
      startingBalance: 500_000,
      retirementAge: 65,
      endAge: 75,
      desiredAnnualIncome: 30_000,
      incomeTargetMode: "net",
      annualStatePension: 12_000,
      statePensionAge: 67,
      annualReturn: 0.05,
      annualFee: 0.005,
      inflationRate: 0.025,
    });

    const deterministic = new DrawdownEngine().calculate(inputs);
    const stochastic = new MonteCarloDrawdownEngine().calculate({
      drawdownInputs: inputs,
      simulations: 20,
      seed: 1,
      annualVolatility: 0,
    });

    expect(stochastic.finalBalance.p10).toBe(deterministic.finalBalance);
    expect(stochastic.finalBalance.p50).toBe(deterministic.finalBalance);
    expect(stochastic.finalBalance.p90).toBe(deterministic.finalBalance);
    expect(stochastic.medianDepletionAge).toBe(deterministic.depletionAge);
  });
});
