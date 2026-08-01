import type { PensionInputs } from "../engine/models/PensionInputs";

export const PLAN_STORAGE_KEY = "retirement-planner:baseline-plan";
export const PLAN_UPDATED_EVENT = "retirement-planner:baseline-plan-updated";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function loadStoredPensionInputs(
  fallback: PensionInputs,
): PensionInputs {
  if (typeof window === "undefined") return { ...fallback };

  try {
    const saved = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!saved) return { ...fallback };

    const parsed = JSON.parse(saved) as Partial<PensionInputs>;
    const merged: PensionInputs = { ...fallback, ...parsed };

    const requiredValues = [
      merged.currentAge,
      merged.retirementAge,
      merged.currentPot,
      merged.monthlyEmployeeContribution,
      merged.monthlyEmployerContribution,
      merged.annualContributionIncrease,
      merged.annualReturn,
      merged.annualFee,
      merged.inflation,
    ];

    return requiredValues.every(isFiniteNumber) ? merged : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

export function savePensionInputs(inputs: PensionInputs): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(inputs));
  window.dispatchEvent(
    new CustomEvent<PensionInputs>(PLAN_UPDATED_EVENT, {
      detail: { ...inputs },
    }),
  );
}
