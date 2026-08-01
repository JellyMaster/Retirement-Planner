import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import {
  createBrowserScenarioService,
  type Scenario,
  type ScenarioId,
  type ScenarioState,
} from "../../domain/scenarios";

interface ScenarioContextValue extends ScenarioState {
  activeScenario: Scenario;
  createScenario: (name: string, sourceId?: ScenarioId) => Scenario;
  duplicateScenario: (id: ScenarioId) => Scenario;
  renameScenario: (id: ScenarioId, name: string) => Scenario;
  setActiveScenario: (id: ScenarioId) => void;
  deleteScenario: (id: ScenarioId) => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: PropsWithChildren) {
  const serviceRef = useRef<ReturnType<typeof createBrowserScenarioService> | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = createBrowserScenarioService();
  }

  const service = serviceRef.current;
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
    ],
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenarios(): ScenarioContextValue {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenarios must be used inside ScenarioProvider.");
  }
  return context;
}
