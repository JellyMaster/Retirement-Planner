import type { PensionInputs } from "../models/PensionInputs";
import type { ProjectionResult } from "../models/ProjectionResult";
import type { RetirementGoals } from "../models/RetirementGoals";
import type { RetirementScoreBreakdownResult } from "../models/RetirementScoreBreakdown";

export type RecommendationCategory =
  | "saving"
  | "retirement-timing"
  | "fees"
  | "combined";

export type RecommendationEffort = "low" | "medium" | "high";

export interface RecommendationScenario {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  effort: RecommendationEffort;
  inputs: PensionInputs;
  changeMagnitude: number;
  changes: string[];
}

export interface RecommendationMetrics {
  projection: ProjectionResult;
  readinessScore: number;
  weightedScore: number;
  monteCarloConfidence: number;
  sustainabilityProbability?: number;
}

export interface RecommendationImpact {
  projectedPotChange: number;
  illustratedAnnualIncomeChange: number;
  readinessScoreChange: number;
  weightedScoreChange: number;
  monteCarloConfidenceChange: number;
  sustainabilityProbabilityChange?: number;
  impactScore: number;
  impactRating: 1 | 2 | 3 | 4 | 5;
  impactPerUnit: number;
}

export interface RetirementRecommendation extends RecommendationScenario {
  metrics: RecommendationMetrics;
  impact: RecommendationImpact;
}

export interface RecommendationBaseline {
  inputs: PensionInputs;
  goals: RetirementGoals;
  metrics: RecommendationMetrics;
  weightedBreakdown: RetirementScoreBreakdownResult;
}

export interface RecommendationEngineConfig {
  inputs: PensionInputs;
  goals: RetirementGoals;
  monteCarloSimulations?: number;
  sustainabilitySimulations?: number;
  monteCarloSeed?: number;
  annualVolatility?: number;
  sustainabilityEndAge?: number;
  includeSustainability?: boolean;
  maximumRecommendations?: number;
}

export interface RecommendationEngineResult {
  baseline: RecommendationBaseline;
  recommendations: RetirementRecommendation[];
}
