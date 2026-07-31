import type { ProjectionResult } from "./ProjectionResult";

export interface FeeComparison {
  withFees: ProjectionResult;
  withoutFees: ProjectionResult;

  finalPotDifference: number;
  percentageDifference: number;

  totalFeesPaid: number;

  lostCompoundGrowth: number;
}