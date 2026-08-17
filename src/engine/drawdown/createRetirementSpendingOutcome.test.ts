import { describe, expect, it } from "vitest";

import { createDefaultScenarioDrawdownPreferences } from "../../domain/scenarios";
import { createRetirementSpendingOutcome } from "./createRetirementSpendingOutcome";
import type { DrawdownInputs } from "./models/DrawdownInputs";

const inputs: DrawdownInputs = {
  startingBalance: 600_000,
  retirementAge: 60,
  endAge: 95,
  withdrawalStrategy: "target-income",
  withdrawalRate: 0.04,
  desiredAnnualIncome: 30_000,
  incomeTargetMode: "net",
  annualStatePension: 12_000,
  statePensionAge: 67,
  annualReturn: 0.05,
  annualFee: 0.005,
  inflationRate: 0.025,
  taxFreeCash: 0,
};

const defaults = createDefaultScenarioDrawdownPreferences(30_000);

describe("createRetirementSpendingOutcome", () => {
  it("uses the selected reserve goal when solving sustainable net spending", () => {
    const preserve = createRetirementSpendingOutcome(inputs, {
      ...defaults,
      endingBalanceMode: "preserve",
      endingBalancePercentage: 1,
    });
    const spend = createRetirementSpendingOutcome(inputs, {
      ...defaults,
      endingBalanceMode: "spend-to-zero",
      endingBalancePercentage: 0,
    });

    expect(preserve.targetEndingBalance).toBe(600_000);
    expect(spend.targetEndingBalance).toBe(0);
    expect(spend.sustainableNetSpending).toBeGreaterThan(
      preserve.sustainableNetSpending,
    );
  });

  it("reports headroom and a living-standard level", () => {
    const outcome = createRetirementSpendingOutcome(inputs, {
      ...defaults,
      endingBalanceMode: "percentage",
      endingBalancePercentage: 0.5,
      retirementLivingStandardsHousehold: "one-person",
      retirementLivingStandardsRegion: "uk",
    });

    expect(outcome.sustainableNetSpending).toBeGreaterThan(0);
    expect(outcome.annualHeadroom).toBe(
      outcome.sustainableNetSpending - outcome.targetNetSpending,
    );
    expect([null, "minimum", "moderate", "comfortable"]).toContain(
      outcome.livingStandard,
    );
  });
});
