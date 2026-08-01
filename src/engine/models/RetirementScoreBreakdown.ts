export type RetirementScoreFactorId =
  | "income-coverage"
  | "contribution-strength"
  | "fee-efficiency"
  | "retirement-timing"
  | "planning-horizon"
  | "reserve-affordability"
  | "state-pension-support";

export type RetirementScoreFactorTone = "strong" | "positive" | "review" | "attention";

export interface RetirementScoreFactor {
  id: RetirementScoreFactorId;
  label: string;
  score: number;
  weight: number;
  weightedPoints: number;
  tone: RetirementScoreFactorTone;
  summary: string;
  detail: string;
}

export interface RetirementScoreBreakdownResult {
  incomeCoverageScore: number;
  weightedScore: number;
  factors: RetirementScoreFactor[];
}
