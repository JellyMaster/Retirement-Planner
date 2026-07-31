import { useMemo } from "react";

import { ProjectionResultFactory } from "../engine/factories/ProjectionResultFactory";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { RetirementComparisonEngine } from "../engine/services/RetirementComparisonEngine";

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

  const comparisonResult = useMemo(() => {
    if (hasErrors) {
      return null;
    }

    return RetirementComparisonEngine.calculate(inputs);
  }, [inputs, hasErrors]);

  const projection =
    comparisonResult?.projection ??
    ProjectionResultFactory.create([]);

  return {
    errors,
    hasErrors,
    projection,
    comparison: comparisonResult?.comparison ?? null,
  };
}