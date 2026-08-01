import type { RetirementScoreFactorTone } from "../models/RetirementScoreBreakdown";

export const RETIREMENT_SCORE_WEIGHTS = {
  incomeCoverage: 0.4,
  contributionStrength: 0.15,
  feeEfficiency: 0.1,
  retirementTiming: 0.1,
  planningHorizon: 0.1,
  reserveAffordability: 0.1,
  statePensionSupport: 0.05,
} as const;

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getFactorTone(score: number): RetirementScoreFactorTone {
  if (score >= 90) return "strong";
  if (score >= 75) return "positive";
  if (score >= 55) return "review";
  return "attention";
}

export function scoreFeeEfficiency(annualFee: number): number {
  if (annualFee <= 0.005) return 100;
  if (annualFee <= 0.0075) return 90;
  if (annualFee <= 0.01) return 75;
  if (annualFee <= 0.015) return 50;
  if (annualFee <= 0.02) return 30;
  return 15;
}

export function scorePlanningHorizon(yearsToRetirement: number): number {
  if (yearsToRetirement >= 25) return 100;
  if (yearsToRetirement >= 20) return 90;
  if (yearsToRetirement >= 15) return 75;
  if (yearsToRetirement >= 10) return 55;
  if (yearsToRetirement >= 5) return 35;
  return 20;
}

export function scoreRetirementTiming(retirementAge: number): number {
  if (retirementAge >= 68) return 100;
  if (retirementAge >= 66) return 90;
  if (retirementAge >= 64) return 80;
  if (retirementAge >= 62) return 68;
  if (retirementAge >= 60) return 55;
  if (retirementAge >= 57) return 40;
  return 25;
}
