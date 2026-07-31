import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { FeeImpact } from "../../engine/models/FeeImpact";
import { AppIcons } from "../../icons";

import { formatCurrency } from "../../utils/formatters";

interface FeeImpactInsightsProps {
    feeImpact: FeeImpact;
}

export function FeeImpactInsights({
    feeImpact,
}: FeeImpactInsightsProps) {

    const finalDifference =
        feeImpact.finalPotDifference.nominal;

    const totalFees =
        feeImpact.cumulativeFees.nominal;

    const lostGrowth =
        feeImpact.lostCompoundGrowth.nominal;

    const percentageReduction =
        feeImpact.percentageDifference;

    const growthMultiplier =
        totalFees > 0
            ? lostGrowth / totalFees
            : 0;

    const insights: string[] = [];

    insights.push(
        `Your retirement pot is projected to be ${formatCurrency(
            finalDifference
        )} smaller because of annual fees.`
    );

    insights.push(
        `${formatCurrency(
            totalFees
        )} is expected to be deducted in fees during the projection.`
    );

    if (lostGrowth > 0) {

        insights.push(
            `${formatCurrency(
                lostGrowth
            )} of the total reduction comes from investment growth that those fees would otherwise have earned.`
        );

    }

    insights.push(
        `Overall, fees reduce your projected retirement pot by ${percentageReduction.toFixed(
            2
        )}%.`
    );

    if (growthMultiplier >= 1) {

        insights.push(
            `Every £1 paid in fees ultimately costs approximately £${(
                1 + growthMultiplier
            ).toFixed(2)} by retirement after allowing for lost compound growth.`
        );

    }

    return (

        <section
            className="panel fee-impact-insights-panel"
            aria-labelledby="fee-impact-insights-heading"
        >

            <div className="panel-heading">

                <h3 id="fee-impact-insights-heading">
                    Key insights
                </h3>

                <p>
                    Understanding the long-term effect of annual charges.
                </p>

            </div>

            <div className="fee-impact-insights">

                {insights.map((insight) => (

                    <article
                        key={insight}
                        className="fee-impact-insight"
                    >

                        <div
                            className="fee-impact-insight-icon"
                            aria-hidden="true"
                        >
                            <FontAwesomeIcon icon={AppIcons.recommendations} />
                        </div>

                        <p>{insight}</p>

                    </article>

                ))}

            </div>

        </section>

    );

}