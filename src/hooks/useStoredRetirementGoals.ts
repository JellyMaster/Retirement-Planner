import { useCallback, useEffect, useState } from "react";

import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import type { RetirementGoals } from "../engine/models/RetirementGoals";
import {
  loadStoredRetirementGoals,
  RETIREMENT_GOALS_STORAGE_KEY,
  RETIREMENT_GOALS_UPDATED_EVENT,
  saveRetirementGoals,
} from "../state/retirementGoalsStorage";

function loadGoals(): RetirementGoals {
  return loadStoredRetirementGoals(defaultRetirementGoals);
}

export function useStoredRetirementGoals(): [
  RetirementGoals,
  (goals: RetirementGoals) => void,
] {
  const [goals, setGoalsState] = useState<RetirementGoals>(loadGoals);

  const setGoals = useCallback((nextGoals: RetirementGoals) => {
    const saved = { ...nextGoals };
    setGoalsState(saved);
    saveRetirementGoals(saved);
  }, []);

  useEffect(() => {
    function handleGoalsUpdate(event: Event) {
      const customEvent = event as CustomEvent<RetirementGoals>;
      setGoalsState({ ...customEvent.detail });
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === RETIREMENT_GOALS_STORAGE_KEY) {
        setGoalsState(loadGoals());
      }
    }

    window.addEventListener(RETIREMENT_GOALS_UPDATED_EVENT, handleGoalsUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        RETIREMENT_GOALS_UPDATED_EVENT,
        handleGoalsUpdate,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return [goals, setGoals];
}
