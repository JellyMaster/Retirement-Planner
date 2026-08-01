import type { RetirementGoals } from "../models/RetirementGoals";

export interface MonteCarloTarget {
  targetRealBalance: number;
  requiredPrivateAnnualIncome: number;
  includedStatePensionIncome: number;
  emergencyReserve: number;
}

const ILLUSTRATED_WITHDRAWAL_RATE = 0.04;

export function calculateMonteCarloTarget(
  goals: RetirementGoals,
): MonteCarloTarget {
  const includedStatePensionIncome = goals.includeStatePension
    ? Math.max(0, goals.statePensionAnnualAmount)
    : 0;
  const requiredPrivateAnnualIncome = Math.max(
    0,
    goals.desiredAnnualIncome - includedStatePensionIncome,
  );
  const emergencyReserve = Math.max(0, goals.emergencyReserve);
  const targetRealBalance =
    requiredPrivateAnnualIncome / ILLUSTRATED_WITHDRAWAL_RATE + emergencyReserve;

  return {
    targetRealBalance,
    requiredPrivateAnnualIncome,
    includedStatePensionIncome,
    emergencyReserve,
  };
}
