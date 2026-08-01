import type { RetirementGoals } from "../engine/models/RetirementGoals";
import { loadStoredRetirementGoals } from "../state/retirementGoalsStorage";

const fallbackRetirementGoals: RetirementGoals = {
  desiredAnnualIncome: 30_000,
  includeStatePension: true,
  statePensionAnnualAmount: 12_000,
  statePensionAge: 67,
  emergencyReserve: 20_000,
};

export const defaultRetirementGoals = loadStoredRetirementGoals(
  fallbackRetirementGoals,
);
