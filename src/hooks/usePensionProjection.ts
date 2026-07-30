import { useMemo } from "react";

import { ProjectionResultFactory } from "../engine/factories/ProjectionResultFactory";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { RetirementProjectionEngine } from "../engine/services/RetirementProjectionEngine";

import {
  hasPensionInputErrors,
  validatePensionInputs,
} from "../validation/validatePensionInputs";

export function usePensionProjection(
  inputs: PensionInputs
) {
  const errors = useMemo(
    () => validatePensionInputs(inputs),
    [inputs]
  );

  const hasErrors = useMemo(
    () => hasPensionInputErrors(errors),
    [errors]
  );

  const projection = useMemo(() => {
    if (hasErrors) {
      return ProjectionResultFactory.create([]);
    }

    return RetirementProjectionEngine.calculate(
      inputs
    );
  }, [inputs, hasErrors]);

  return {
    errors,
    hasErrors,
    projection,
  };
}