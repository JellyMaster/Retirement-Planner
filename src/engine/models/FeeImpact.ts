import type { MoneyValue } from "./MoneyValue";
import type { ProjectionResult } from "./ProjectionResult";
import type { FeeImpactYear } from "./FeeImpactYear";

export interface FeeImpact {
    withFees: ProjectionResult;

    withoutFees: ProjectionResult;

    finalPotDifference: MoneyValue;

    cumulativeFees: MoneyValue;

    lostCompoundGrowth: MoneyValue;

    percentageDifference: number;

    yearlyImpact: FeeImpactYear[];
}