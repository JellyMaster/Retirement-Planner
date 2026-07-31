import type { PensionInputs } from "../models/PensionInputs";
import type { RetirementComparisonResult } from "../models/RetirementComparisonResult";

import { RetirementProjectionEngine } from "./RetirementProjectionEngine";
import { FeeImpactCalculator } from "./FeeImpactCalculator";

export class RetirementComparisonEngine {

    static calculate(
        inputs: PensionInputs
    ): RetirementComparisonResult {

        const projection =
            RetirementProjectionEngine.calculate(inputs);

        return {

            projection,

            comparison: {

                feeImpact:
                    FeeImpactCalculator.calculate(inputs),

            },

        };
    }
}