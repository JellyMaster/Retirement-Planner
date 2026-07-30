import { useCallback, useMemo, useState } from "react";

import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDefaultDrawdownInputs } from "../engine/drawdown/factories/createDefaultDrawdownInputs";
import type { DrawdownInputs } from "../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../engine/drawdown/models/DrawdownResult";
import {
  validateDrawdownInputs,
  type DrawdownValidationResult,
} from "../engine/drawdown/validators/DrawdownInputsValidator";

export interface UseDrawdownProjectionResult {
  inputs: DrawdownInputs;
  validation: DrawdownValidationResult;
  result: DrawdownResult | null;
  updateInput: <K extends keyof DrawdownInputs>(
    field: K,
    value: DrawdownInputs[K],
  ) => void;
  setInputs: (inputs: DrawdownInputs) => void;
  resetInputs: () => void;
}

const drawdownEngine = new DrawdownEngine();

export function useDrawdownProjection(): UseDrawdownProjectionResult {
  const [inputs, setInputsState] = useState<DrawdownInputs>(
    createDefaultDrawdownInputs,
  );

  const validation = useMemo(
    () => validateDrawdownInputs(inputs),
    [inputs],
  );

  const result = useMemo<DrawdownResult | null>(() => {
    if (!validation.isValid) {
      return null;
    }

    return drawdownEngine.calculate(inputs);
  }, [inputs, validation.isValid]);

  const updateInput = useCallback(
    <K extends keyof DrawdownInputs>(
      field: K,
      value: DrawdownInputs[K],
    ) => {
      setInputsState((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const setInputs = useCallback((nextInputs: DrawdownInputs) => {
    setInputsState(nextInputs);
  }, []);

  const resetInputs = useCallback(() => {
    setInputsState(createDefaultDrawdownInputs());
  }, []);

  return {
    inputs,
    validation,
    result,
    updateInput,
    setInputs,
    resetInputs,
  };
}
