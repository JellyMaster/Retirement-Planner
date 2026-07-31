import type { RetirementGoals } from "../engine/models/RetirementGoals";

export const defaultRetirementGoals: RetirementGoals = {
  desiredAnnualIncome: 30_000,
  includeStatePension: true,
  statePensionAnnualAmount: 12_000,
  statePensionAge: 67,
  emergencyReserve: 20_000,
};
