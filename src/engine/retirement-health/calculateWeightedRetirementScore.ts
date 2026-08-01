import type { PensionInputs } from "../models/PensionInputs";
import type { ProjectionResult } from "../models/ProjectionResult";
import type { RetirementGoals } from "../models/RetirementGoals";
import type {
  RetirementScoreBreakdownResult,
  RetirementScoreFactor,
} from "../models/RetirementScoreBreakdown";
import { calculateRetirementHealth } from "../../components/goals/calculateRetirementHealth";
import {
  RETIREMENT_SCORE_WEIGHTS,
  clampScore,
  getFactorTone,
  scoreFeeEfficiency,
  scorePlanningHorizon,
  scoreRetirementTiming,
} from "./retirementScoreFactors";

interface CalculateWeightedRetirementScoreArguments {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
}

function createFactor(
  factor: Omit<RetirementScoreFactor, "weightedPoints" | "tone">,
): RetirementScoreFactor {
  const score = clampScore(factor.score);

  return {
    ...factor,
    score,
    weightedPoints: Number((score * factor.weight).toFixed(2)),
    tone: getFactorTone(score),
  };
}

export function calculateWeightedRetirementScore({
  inputs,
  result,
  goals,
}: CalculateWeightedRetirementScoreArguments): RetirementScoreBreakdownResult {
  const health = calculateRetirementHealth(result, goals);
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const monthlySaving =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const annualSaving = monthlySaving * 12;
  const targetIncome = Math.max(1, goals.desiredAnnualIncome);
  const contributionRatio = annualSaving / targetIncome;
  const contributionScore = clampScore((contributionRatio / 0.25) * 100);
  const feeScore = scoreFeeEfficiency(inputs.annualFee);
  const timingScore = scoreRetirementTiming(inputs.retirementAge);
  const horizonScore = scorePlanningHorizon(yearsToRetirement);
  const reserveRatio =
    result.finalBalance.real > 0
      ? goals.emergencyReserve / result.finalBalance.real
      : goals.emergencyReserve > 0
        ? 1
        : 0;
  const reserveScore = clampScore(
    health.investablePot <= 0
      ? 10
      : reserveRatio <= 0.1
        ? 100
        : reserveRatio <= 0.2
          ? 85
          : reserveRatio <= 0.3
            ? 70
            : reserveRatio <= 0.5
              ? 50
              : 25,
  );
  const statePensionScore = goals.includeStatePension
    ? goals.statePensionAnnualAmount > 0
      ? 100
      : 45
    : 60;

  const factors: RetirementScoreFactor[] = [
    createFactor({
      id: "income-coverage",
      label: "Income target coverage",
      score: health.score,
      weight: RETIREMENT_SCORE_WEIGHTS.incomeCoverage,
      summary:
        health.annualGap >= 0
          ? "Your illustrated income covers the target you entered."
          : `Your illustrated income covers ${Math.round(health.coverage * 100)}% of your target.`,
      detail:
        "Compares the illustrated annual retirement income with your desired annual income. This remains the largest part of the weighted score.",
    }),
    createFactor({
      id: "contribution-strength",
      label: "Contribution strength",
      score: contributionScore,
      weight: RETIREMENT_SCORE_WEIGHTS.contributionStrength,
      summary: `${monthlySaving.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })} is currently being added each month.`,
      detail:
        "Assesses annual pension saving relative to the retirement-income target you entered. It is an indicator, not a prescribed contribution rate.",
    }),
    createFactor({
      id: "fee-efficiency",
      label: "Fee efficiency",
      score: feeScore,
      weight: RETIREMENT_SCORE_WEIGHTS.feeEfficiency,
      summary: `Your annual pension fee is ${(inputs.annualFee * 100).toFixed(2)}%.`,
      detail:
        "Lower charges retain more money for compounding. This indicator scores fees at or below 0.50% most strongly.",
    }),
    createFactor({
      id: "retirement-timing",
      label: "Retirement timing",
      score: timingScore,
      weight: RETIREMENT_SCORE_WEIGHTS.retirementTiming,
      summary: `Your planned retirement age is ${inputs.retirementAge}.`,
      detail:
        "Later retirement generally allows more contributions and growth. This is a planning indicator, not a judgement about the right age for you.",
    }),
    createFactor({
      id: "planning-horizon",
      label: "Planning horizon",
      score: horizonScore,
      weight: RETIREMENT_SCORE_WEIGHTS.planningHorizon,
      summary: `There ${yearsToRetirement === 1 ? "is" : "are"} ${yearsToRetirement} ${yearsToRetirement === 1 ? "year" : "years"} until retirement.`,
      detail:
        "A longer horizon provides more time for contributions, compounding and adjustments if circumstances change.",
    }),
    createFactor({
      id: "reserve-affordability",
      label: "Reserve affordability",
      score: reserveScore,
      weight: RETIREMENT_SCORE_WEIGHTS.reserveAffordability,
      summary: `${goals.emergencyReserve.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })} is retained outside the income illustration.`,
      detail:
        "Considers how much of the projected pension is reserved before the private-income illustration is calculated.",
    }),
    createFactor({
      id: "state-pension-support",
      label: "State Pension support",
      score: statePensionScore,
      weight: RETIREMENT_SCORE_WEIGHTS.statePensionSupport,
      summary: goals.includeStatePension
        ? `State Pension is included from age ${goals.statePensionAge}.`
        : "State Pension is not included in this plan.",
      detail:
        "Recognises whether an additional State Pension income source is included. It has a deliberately small weighting because eligibility and future amounts can change.",
    }),
  ];

  const weightedScore = clampScore(
    factors.reduce((total, factor) => total + factor.weightedPoints, 0),
  );

  return {
    incomeCoverageScore: health.score,
    weightedScore,
    factors,
  };
}
