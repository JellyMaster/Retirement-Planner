import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { createDefaultScenarioDrawdownPreferences } from "../../domain/scenarios";
import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import { isSavedExperimentMatch } from "./isSavedExperimentMatch";

function createScenario(): WhatIfScenario {
  const inputs = {
    ...createDefaultPensionInputs(),
    currentAge: 47,
    retirementAge: 65,
    monthlyEmployeeContribution: 800,
    monthlyEmployerContribution: 200,
    extraMonthlyContribution: 500,
    extraContributionAge: 56,
    annualFee: 0.0078,
    annualReturn: 0.08,
    inflation: 0.025,
    marketDownturnPercentage: 0.2,
    marketDownturnAge: 55,
  };
  const drawdown = {
    ...createDefaultScenarioDrawdownPreferences(),
    desiredAnnualIncome: 45_000,
    includeStatePension: true,
    statePensionAnnualAmount: 11_500,
    statePensionAge: 67,
  };

  return {
    id: "saved",
    name: "Saved experiment",
    baseScenarioId: "baseline",
    experimentType: "retirement-age",
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
    inputs,
    drawdown,
  };
}

describe("isSavedExperimentMatch", () => {
  it("matches only the fields owned by the selected experiment", () => {
    const scenario = createScenario();
    const inputs = { ...scenario.inputs, currentPot: scenario.inputs.currentPot + 10_000 };

    expect(
      isSavedExperimentMatch({
        experiment: "retirement-age",
        scenario,
        inputs,
        drawdown: scenario.drawdown,
        stateIncluded: true,
        stateAmount: 11_500,
        stateAge: 67,
      }),
    ).toBe(true);
  });

  it("detects a different value in the active experiment", () => {
    const scenario = createScenario();

    expect(
      isSavedExperimentMatch({
        experiment: "retirement-age",
        scenario,
        inputs: { ...scenario.inputs, retirementAge: 63 },
        drawdown: scenario.drawdown,
        stateIncluded: true,
        stateAmount: 11_500,
        stateAge: 67,
      }),
    ).toBe(false);
  });

  it("keeps regular contributions independent from scheduled extra saving", () => {
    const scenario = { ...createScenario(), experimentType: "contributions" as const };

    expect(
      isSavedExperimentMatch({
        experiment: "contributions",
        scenario,
        inputs: { ...scenario.inputs, extraContributionAge: 57, extraMonthlyContribution: 750 },
        drawdown: scenario.drawdown,
        stateIncluded: true,
        stateAmount: 11_500,
        stateAge: 67,
      }),
    ).toBe(true);

    expect(
      isSavedExperimentMatch({
        experiment: "contributions",
        scenario,
        inputs: { ...scenario.inputs, monthlyEmployeeContribution: 900 },
        drawdown: scenario.drawdown,
        stateIncluded: true,
        stateAmount: 11_500,
        stateAge: 67,
      }),
    ).toBe(false);
  });

  it("matches scheduled extra saving amount and start age separately", () => {
    const scenario = { ...createScenario(), experimentType: "extra-saving" as const };
    const common = {
      experiment: "extra-saving" as const,
      scenario,
      drawdown: scenario.drawdown,
      stateIncluded: true,
      stateAmount: 11_500,
      stateAge: 67,
    };

    expect(isSavedExperimentMatch({ ...common, inputs: { ...scenario.inputs } })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, inputs: { ...scenario.inputs, extraContributionAge: 57 } })).toBe(false);
    expect(isSavedExperimentMatch({ ...common, inputs: { ...scenario.inputs, extraMonthlyContribution: 750 } })).toBe(false);
  });

  it("ignores the extra-saving age when no extra payment is included", () => {
    const scenario = {
      ...createScenario(),
      experimentType: "extra-saving" as const,
      inputs: { ...createScenario().inputs, extraMonthlyContribution: 0, extraContributionAge: 56 },
    };

    expect(
      isSavedExperimentMatch({
        experiment: "extra-saving",
        scenario,
        inputs: { ...scenario.inputs, extraContributionAge: 60 },
        drawdown: scenario.drawdown,
        stateIncluded: true,
        stateAmount: 11_500,
        stateAge: 67,
      }),
    ).toBe(true);
  });

  it("matches spending, assumptions, State Pension and downturn values", () => {
    const scenario = createScenario();
    const common = {
      scenario,
      inputs: scenario.inputs,
      drawdown: scenario.drawdown,
      stateIncluded: true,
      stateAmount: 11_500,
      stateAge: 67,
    };

    expect(isSavedExperimentMatch({ ...common, experiment: "spending" })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, experiment: "fees" })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, experiment: "returns" })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, experiment: "inflation" })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, experiment: "state-pension" })).toBe(true);
    expect(isSavedExperimentMatch({ ...common, experiment: "market-downturn" })).toBe(true);
  });
});
