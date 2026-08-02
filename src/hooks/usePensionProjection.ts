import { useMemo } from "react";

import { ProjectionResultFactory } from "../engine/factories/ProjectionResultFactory";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { ProjectionYear } from "../engine/models/ProjectionYear";
import { RetirementComparisonEngine } from "../engine/services/RetirementComparisonEngine";

import {
  hasPensionInputErrors,
  validatePensionInputs,
} from "../validation/validatePensionInputs";

export function usePensionProjection(inputs: PensionInputs) {
  const errors = useMemo(() => validatePensionInputs(inputs), [inputs]);

  const hasErrors = useMemo(
    () => hasPensionInputErrors(errors),
    [errors],
  );

  const comparisonResult = useMemo(() => {
    if (hasErrors || inputs.retirementAge === inputs.currentAge) {
      return null;
    }

    return RetirementComparisonEngine.calculate(inputs);
  }, [inputs, hasErrors]);

  const projection = useMemo(() => {
    if (hasErrors) {
      return ProjectionResultFactory.create([]);
    }

    if (inputs.retirementAge === inputs.currentAge) {
      return ProjectionResultFactory.create([
        createImmediateRetirementYear(inputs),
      ]);
    }

    return (
      comparisonResult?.projection ?? ProjectionResultFactory.create([])
    );
  }, [comparisonResult?.projection, hasErrors, inputs]);

  return {
    errors,
    hasErrors,
    projection,
    comparison: comparisonResult?.comparison ?? null,
  };
}

function createImmediateRetirementYear(inputs: PensionInputs): ProjectionYear {
  const currentBalance = {
    nominal: inputs.currentPot,
    real: inputs.currentPot,
  };
  const zero = { nominal: 0, real: 0 };

  return {
    yearIndex: 0,
    age: inputs.currentAge,
    openingBalance: currentBalance,
    contributions: zero,
    investmentGrowth: zero,
    fees: zero,
    closingBalance: currentBalance,
  };
}
