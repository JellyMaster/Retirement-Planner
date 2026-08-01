import { createContext, useContext } from "react";

import type {
  Scenario,
  ScenarioId,
  ScenarioState,
} from "../../domain/scenarios";

export interface ScenarioContextValue extends ScenarioState {
  activeScenario: Scenario;
  createScenario: (name: string, sourceId?: ScenarioId) => Scenario;
  duplicateScenario: (id: ScenarioId) => Scenario;
  renameScenario: (id: ScenarioId, name: string) => Scenario;
  setActiveScenario: (id: ScenarioId) => void;
  deleteScenario: (id: ScenarioId) => void;
}

export const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function useScenarios(): ScenarioContextValue {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenarios must be used inside ScenarioProvider.");
  }
  return context;
}
