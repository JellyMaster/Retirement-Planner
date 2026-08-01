import { useEffect, useState } from "react";

import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import {
  loadStoredPensionInputs,
  PLAN_STORAGE_KEY,
  PLAN_UPDATED_EVENT,
} from "../state/planStorage";

function loadPensionInputs(): PensionInputs {
  return loadStoredPensionInputs(createDefaultPensionInputs());
}

export function useStoredPensionInputs(): PensionInputs {
  const [inputs, setInputs] = useState<PensionInputs>(loadPensionInputs);

  useEffect(() => {
    function handlePlanUpdate(event: Event) {
      const customEvent = event as CustomEvent<PensionInputs>;
      setInputs({ ...customEvent.detail });
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === PLAN_STORAGE_KEY) {
        setInputs(loadPensionInputs());
      }
    }

    window.addEventListener(PLAN_UPDATED_EVENT, handlePlanUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(PLAN_UPDATED_EVENT, handlePlanUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return inputs;
}
