import type { RetirementHealthMetrics } from "../../components/goals/calculateRetirementHealth";
import type { RecommendationImpact, RecommendationMetrics, RecommendationScenario } from "./RecommendationTypes";

interface CalculateRecommendationImpactArguments {
  scenario: RecommendationScenario;
  baseline: RecommendationMetrics;
  candidate: RecommendationMetrics;
  baselineHealth: RetirementHealthMetrics;
  candidateHealth: RetirementHealthMetrics;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateRecommendationImpact({
  scenario,
  baseline,
  candidate,
  baselineHealth,
  candidateHealth,
}: CalculateRecommendationImpactArguments): RecommendationImpact {
  const projectedPotChange =
    candidate.projection.finalBalance.real -
    baseline.projection.finalBalance.real;
  const illustratedAnnualIncomeChange =
    candidateHealth.estimatedAnnualIncome -
    baselineHealth.estimatedAnnualIncome;
  const readinessScoreChange =
    candidate.readinessScore - baseline.readinessScore;
  const weightedScoreChange =
    candidate.weightedScore - baseline.weightedScore;
  const monteCarloConfidenceChange =
    candidate.monteCarloConfidence - baseline.monteCarloConfidence;
  const sustainabilityProbabilityChange =
    baseline.sustainabilityProbability === undefined ||
    candidate.sustainabilityProbability === undefined
      ? undefined
      : candidate.sustainabilityProbability -
        baseline.sustainabilityProbability;

  // A transparent heuristic used only to rank recommendations. Confidence and
  // sustainability changes are expressed as fractions, so multiply by 100 to
  // convert them to percentage-point contributions.
  const rawImpactScore =
    monteCarloConfidenceChange * 100 * 4 +
    (sustainabilityProbabilityChange ?? 0) * 100 * 3 +
    readinessScoreChange * 1.5 +
    weightedScoreChange +
    Math.max(0, projectedPotChange) / 25_000 +
    Math.max(0, illustratedAnnualIncomeChange) / 1_000;
  const impactScore = Number(Math.max(0, rawImpactScore).toFixed(2));
  const impactRating = clamp(Math.ceil(impactScore / 5), 1, 5) as
    | 1
    | 2
    | 3
    | 4
    | 5;
  const impactPerUnit = Number(
    (impactScore / Math.max(0.01, scenario.changeMagnitude)).toFixed(4),
  );

  return {
    projectedPotChange,
    illustratedAnnualIncomeChange,
    readinessScoreChange,
    weightedScoreChange,
    monteCarloConfidenceChange,
    sustainabilityProbabilityChange,
    impactScore,
    impactRating,
    impactPerUnit,
  };
}
