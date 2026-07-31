import type { ProjectionResult } from "./ProjectionResult";
import type { FeeImpact } from "./FeeImpact";

export interface RetirementComparisonResult {
    projection: ProjectionResult;

    comparison: {
        feeImpact: FeeImpact;
    };
}