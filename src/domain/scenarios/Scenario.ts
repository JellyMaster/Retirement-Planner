import type { PensionInputs } from "../../engine/models/PensionInputs";

export type ScenarioId = string;

export interface Scenario {
  id: ScenarioId;
  name: string;
  description?: string;
  colour: string;
  isBaseline: boolean;
  createdAt: string;
  updatedAt: string;
  inputs: PensionInputs;
}

export interface ScenarioState {
  activeScenarioId: ScenarioId;
  scenarios: Scenario[];
}

export interface ScenarioDependencies {
  createId: () => ScenarioId;
  now: () => string;
}

export const DEFAULT_SCENARIO_COLOUR = "accent";

export function createBaselineScenario(
  inputs: PensionInputs,
  dependencies: ScenarioDependencies,
): Scenario {
  const timestamp = dependencies.now();

  return {
    id: dependencies.createId(),
    name: "Baseline Plan",
    colour: DEFAULT_SCENARIO_COLOUR,
    isBaseline: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    inputs: { ...inputs },
  };
}

export function duplicateScenario(
  source: Scenario,
  name: string,
  dependencies: ScenarioDependencies,
): Scenario {
  const timestamp = dependencies.now();

  return {
    ...source,
    id: dependencies.createId(),
    name,
    isBaseline: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    inputs: { ...source.inputs },
  };
}
