import { RetirementComparisonEngine } from "../../engine/services/RetirementComparisonEngine";
import {
  hasPensionInputErrors,
  validatePensionInputs,
} from "../../validation/validatePensionInputs";
import type { Scenario } from "./Scenario";

export interface ScenarioChartPoint {
  age: number;
  nominal: number;
  real: number;
}

export interface ScenarioChartSeries {
  scenarioId: string;
  name: string;
  isActive: boolean;
  points: ScenarioChartPoint[];
}

export function createScenarioChartSeries(
  scenarios: Scenario[],
  activeScenarioId: string,
): ScenarioChartSeries[] {
  return scenarios.flatMap((scenario) => {
    const errors = validatePensionInputs(scenario.inputs);
    if (hasPensionInputErrors(errors)) return [];

    const projection = RetirementComparisonEngine.calculate(
      scenario.inputs,
    ).projection;

    return [
      {
        scenarioId: scenario.id,
        name: scenario.name,
        isActive: scenario.id === activeScenarioId,
        points: projection.years.map((year) => ({
          age: year.age,
          nominal: year.closingBalance.nominal,
          real: year.closingBalance.real,
        })),
      },
    ];
  });
}
