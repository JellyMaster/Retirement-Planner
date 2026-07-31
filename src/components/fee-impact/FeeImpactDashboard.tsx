import type { FeeImpact } from "../../engine/models/FeeImpact";

import { FeeImpactMetrics } from "./FeeImpactMetrics";
import { FeeImpactComparisonChart } from "./FeeImpactComparisonChart";
import { FeeImpactTimeline } from "./FeeImpactTimeline";
import { FeeImpactInsights } from "./FeeImpactInsights";

export interface FeeImpactDashboardProps {
    feeImpact: FeeImpact;
}

export function FeeImpactDashboard({
    feeImpact,
}: FeeImpactDashboardProps) {

    return (

        <section
            className="fee-impact-dashboard"
            aria-labelledby="fee-impact-heading"
        >

            <div className="fee-impact-header">

                <div>

                    <p className="planner-eyebrow">
                        Fee analysis
                    </p>

                    <h2 id="fee-impact-heading">
                        How fees affect your retirement
                    </h2>

                    <p>

                        Compare your projected pension with your
                        current annual fee against the same projection
                        assuming no annual platform or fund charges.

                    </p>

                </div>

            </div>

            <FeeImpactMetrics
                feeImpact={feeImpact}
            />

            <FeeImpactComparisonChart
                feeImpact={feeImpact}
            />

            <FeeImpactTimeline
                feeImpact={feeImpact}
            />

            <FeeImpactInsights
                feeImpact={feeImpact}
            />

        </section>

    );

}