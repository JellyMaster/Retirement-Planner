import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ExperimentId } from "./ExperimentLauncher";

interface SavedExperimentMatchOptions {
  experiment: ExperimentId;
  scenario: WhatIfScenario;
  inputs: PensionInputs;
  drawdown: ScenarioDrawdownPreferences;
  stateIncluded: boolean;
  stateAmount: number;
  stateAge: number;
}

export function isSavedExperimentMatch({
  experiment,
  scenario,
  inputs,
  drawdown,
  stateIncluded,
  stateAmount,
  stateAge,
}: SavedExperimentMatchOptions): boolean {
  switch (experiment) {
    case "retirement-age":
      return scenario.inputs.retirementAge === inputs.retirementAge;
    case "contributions":
      return (
        sameNumber(
          scenario.inputs.monthlyEmployeeContribution,
          inputs.monthlyEmployeeContribution,
        ) &&
        sameNumber(
          scenario.inputs.monthlyEmployerContribution,
          inputs.monthlyEmployerContribution,
        )
      );
    case "extra-saving":
      return (
        sameNumber(
          scenario.inputs.extraMonthlyContribution ?? 0,
          inputs.extraMonthlyContribution ?? 0,
        ) &&
        effectiveExtraContributionAge(scenario.inputs) === effectiveExtraContributionAge(inputs)
      );
    case "spending":
      return sameNumber(
        scenario.drawdown.desiredAnnualIncome,
        drawdown.desiredAnnualIncome,
      );
    case "fees":
      return sameNumber(scenario.inputs.annualFee, inputs.annualFee);
    case "returns":
      return sameNumber(scenario.inputs.annualReturn, inputs.annualReturn);
    case "inflation":
      return sameNumber(scenario.inputs.inflation, inputs.inflation);
    case "state-pension":
      return (
        scenario.drawdown.includeStatePension === stateIncluded &&
        sameOptionalNumber(
          scenario.drawdown.statePensionAnnualAmount,
          stateAmount,
        ) &&
        scenario.drawdown.statePensionAge === stateAge
      );
    case "market-downturn":
      return (
        sameNumber(
          scenario.inputs.marketDownturnPercentage ?? 0,
          inputs.marketDownturnPercentage ?? 0,
        ) &&
        scenario.inputs.marketDownturnAge === inputs.marketDownturnAge
      );
  }
}

function effectiveExtraContributionAge(inputs: PensionInputs): number | undefined {
  return (inputs.extraMonthlyContribution ?? 0) > 0 ? inputs.extraContributionAge : undefined;
}

function sameNumber(left: number, right: number): boolean {
  return Math.abs(left - right) < 1e-9;
}

function sameOptionalNumber(
  left: number | undefined,
  right: number | undefined,
): boolean {
  if (left === undefined || right === undefined) return left === right;
  return sameNumber(left, right);
}
