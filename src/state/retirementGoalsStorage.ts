import type { RetirementGoals } from "../engine/models/RetirementGoals";

export const RETIREMENT_GOALS_STORAGE_KEY = "retirement-planner:retirement-goals";
export const RETIREMENT_GOALS_UPDATED_EVENT =
  "retirement-planner:retirement-goals-updated";

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidRetirementGoals(value: unknown): value is RetirementGoals {
  if (!value || typeof value !== "object") return false;

  const goals = value as Partial<RetirementGoals>;
  return (
    isFiniteNonNegativeNumber(goals.desiredAnnualIncome) &&
    typeof goals.includeStatePension === "boolean" &&
    isFiniteNonNegativeNumber(goals.statePensionAnnualAmount) &&
    isFiniteNonNegativeNumber(goals.statePensionAge) &&
    Number.isInteger(goals.statePensionAge) &&
    isFiniteNonNegativeNumber(goals.emergencyReserve)
  );
}

export function loadStoredRetirementGoals(
  fallback: RetirementGoals,
): RetirementGoals {
  if (typeof window === "undefined") return { ...fallback };

  try {
    const saved = window.localStorage.getItem(RETIREMENT_GOALS_STORAGE_KEY);
    if (!saved) return { ...fallback };

    const parsed = JSON.parse(saved) as unknown;
    return isValidRetirementGoals(parsed) ? { ...parsed } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

export function saveRetirementGoals(goals: RetirementGoals): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    RETIREMENT_GOALS_STORAGE_KEY,
    JSON.stringify(goals),
  );
  window.dispatchEvent(
    new CustomEvent<RetirementGoals>(RETIREMENT_GOALS_UPDATED_EVENT, {
      detail: { ...goals },
    }),
  );
}
