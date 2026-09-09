import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type {
  WhatIfExperimentId,
  WhatIfScenario,
  WhatIfScenarioState,
} from "../../domain/what-if/WhatIfScenario";
import type { ScenarioDrawdownPreferences, ScenarioId } from "../../domain/scenarios";
import type { PensionInputs } from "../../engine/models/PensionInputs";

const WHAT_IF_SCENARIO_STORAGE_KEY = "retirement-planner-what-if-scenarios-v1";

interface SaveWhatIfScenarioInput {
  name: string;
  baseScenarioId: ScenarioId;
  experimentType: WhatIfExperimentId;
  inputs: PensionInputs;
  drawdown: ScenarioDrawdownPreferences;
}

interface WhatIfScenarioContextValue extends WhatIfScenarioState {
  saveScenario: (input: SaveWhatIfScenarioInput) => WhatIfScenario;
  deleteScenario: (id: string) => void;
}

const WhatIfScenarioContext = createContext<WhatIfScenarioContextValue | null>(null);

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `what-if-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState(): WhatIfScenarioState {
  if (typeof window === "undefined") return { scenarios: [] };

  try {
    const raw = window.localStorage.getItem(WHAT_IF_SCENARIO_STORAGE_KEY);
    if (!raw) return { scenarios: [] };
    const parsed = JSON.parse(raw) as Partial<WhatIfScenarioState>;
    return {
      scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios : [],
    };
  } catch {
    return { scenarios: [] };
  }
}

export function WhatIfScenarioProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<WhatIfScenarioState>(loadState);

  const persist = useCallback((nextState: WhatIfScenarioState) => {
    setState(nextState);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        WHAT_IF_SCENARIO_STORAGE_KEY,
        JSON.stringify(nextState),
      );
    }
  }, []);

  const saveScenario = useCallback(
    (input: SaveWhatIfScenarioInput) => {
      const timestamp = new Date().toISOString();
      const scenario: WhatIfScenario = {
        id: createId(),
        name: input.name,
        baseScenarioId: input.baseScenarioId,
        experimentType: input.experimentType,
        createdAt: timestamp,
        updatedAt: timestamp,
        inputs: { ...input.inputs },
        drawdown: { ...input.drawdown },
      };

      setState((current) => {
        const nextState = {
          scenarios: [...current.scenarios, scenario],
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            WHAT_IF_SCENARIO_STORAGE_KEY,
            JSON.stringify(nextState),
          );
        }
        return nextState;
      });

      return scenario;
    },
    [],
  );

  const deleteScenario = useCallback(
    (id: string) => {
      persist({
        scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
      });
    },
    [persist, state.scenarios],
  );

  const value = useMemo<WhatIfScenarioContextValue>(
    () => ({ ...state, saveScenario, deleteScenario }),
    [deleteScenario, saveScenario, state],
  );

  return (
    <WhatIfScenarioContext.Provider value={value}>
      {children}
    </WhatIfScenarioContext.Provider>
  );
}

export function useWhatIfScenarios(): WhatIfScenarioContextValue {
  const context = useContext(WhatIfScenarioContext);
  if (!context) {
    throw new Error("useWhatIfScenarios must be used inside WhatIfScenarioProvider.");
  }
  return context;
}
