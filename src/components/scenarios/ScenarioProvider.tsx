import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import {
  createBrowserScenarioService,
  type ScenarioDrawdownPreferences,
  type ScenarioId,
  type ScenarioState,
} from "../../domain/scenarios";
import {
  ScenarioContext,
  type ScenarioContextValue,
} from "./ScenarioContext";

export function ScenarioProvider({ children }: PropsWithChildren) {
  const [service] = useState(createBrowserScenarioService);
  const [state, setState] = useState<ScenarioState>(() => service.getState());

  const refresh = useCallback(() => {
    setState(service.getState());
  }, [service]);

  const createScenario = useCallback(
    (name: string, sourceId?: ScenarioId) => {
      const scenario = service.createScenario(name, sourceId);
      refresh();
      return scenario;
    },
    [refresh, service],
  );

  const duplicateScenario = useCallback(
    (id: ScenarioId) => {
      const scenario = service.duplicateScenario(id);
      refresh();
      return scenario;
    },
    [refresh, service],
  );

  const renameScenario = useCallback(
    (id: ScenarioId, name: string) => {
      const scenario = service.renameScenario(id, name);
      refresh();
      return scenario;
    },
    [refresh, service],
  );

  const updateScenarioInputs = useCallback(
    (id: ScenarioId, inputs: PensionInputs) => {
      const scenario = service.updateScenarioInputs(id, inputs);
      refresh();
      return scenario;
    },
    [refresh, service],
  );

  const updateScenarioPlan = useCallback(
    (
      id: ScenarioId,
      inputs: PensionInputs,
      drawdown: ScenarioDrawdownPreferences,
    ) => {
      const scenario = service.updateScenarioPlan(id, inputs, drawdown);
      refresh();
      return scenario;
    },
    [refresh, service],
  );

  const setActiveScenario = useCallback(
    (id: ScenarioId) => {
      service.setActiveScenario(id);
      refresh();
    },
    [refresh, service],
  );

  const deleteScenario = useCallback(
    (id: ScenarioId) => {
      service.deleteScenario(id);
      refresh();
    },
    [refresh, service],
  );

  const activeScenario = useMemo(() => {
    const scenario = state.scenarios.find(
      (candidate) => candidate.id === state.activeScenarioId,
    );
    if (!scenario) throw new Error("Active scenario could not be found.");
    return scenario;
  }, [state.activeScenarioId, state.scenarios]);

  const value = useMemo<ScenarioContextValue>(
    () => ({
      ...state,
      activeScenario,
      createScenario,
      duplicateScenario,
      renameScenario,
      updateScenarioInputs,
      updateScenarioPlan,
      setActiveScenario,
      deleteScenario,
    }),
    [
      activeScenario,
      createScenario,
      deleteScenario,
      duplicateScenario,
      renameScenario,
      setActiveScenario,
      state,
      updateScenarioInputs,
      updateScenarioPlan,
    ],
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}
