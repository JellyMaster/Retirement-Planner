import { createContext, useContext } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type {
  Scenario,
  ScenarioDrawdownPreferences,
  ScenarioId,
  ScenarioState,
} from "../../domain/scenarios";

export interface ScenarioContextValue extends ScenarioState {
  activeScenario: Scenario;
  createScenario: (name: string, sourceId?: ScenarioId) => Scenario;
  duplicateScenario: (id: ScenarioId) => Scenario;
  renameScenario: (id: ScenarioId, name: string) => Scenario;
  updateScenarioInputs: (id: ScenarioId, inputs: PensionInputs) => Scenario;
  updateScenarioPlan: (
    id: ScenarioId,
    inputs: PensionInputs,
    drawdown: ScenarioDrawdownPreferences,
  ) => Scenario;
  setActiveScenario: (id: ScenarioId) => void;
  deleteScenario: (id: ScenarioId) => void;
}

export const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function useOptionalScenarios(): ScenarioContextValue | null {
  return useContext(ScenarioContext);
}

export function useScenarios(): ScenarioContextValue {
  const context = useOptionalScenarios();
  if (!context) {
    throw new Error("useScenarios must be used inside ScenarioProvider.");
  }
  return context;
}
