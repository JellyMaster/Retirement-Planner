import type { FeeImpact } from "../../engine/models/FeeImpact";

import { formatCurrency } from "../../utils/formatters";

interface FeeImpactTimelineProps {
    feeImpact: FeeImpact;
}

export function FeeImpactTimeline({
    feeImpact,
}: FeeImpactTimelineProps) {

    const finalDifference =
        Math.max(
            feeImpact.finalPotDifference.nominal,
            1
        );

    return (

        <section
            className="panel fee-impact-timeline-panel"
            aria-labelledby="fee-impact-timeline-heading"
        >

            <div className="panel-heading">

                <h3 id="fee-impact-timeline-heading">

                    Fee impact over time

                </h3>

                <p>

                    The gap between the two projections
                    increases every year because fees not
                    only reduce your balance, they also
                    reduce future investment growth.

                </p>

            </div>

            <div className="fee-impact-timeline">

                {feeImpact.yearlyImpact.map((year) => {

                    const progress =
                        Math.min(
                            100,
                            (
                                year.potDifference.nominal /
                                finalDifference
                            ) * 100
                        );

                    return (

                        <article
                            key={year.yearIndex}
                            className="fee-impact-year"
                        >

                            <div className="fee-impact-year-header">

                                <strong>

                                    Age {year.age + 1}

                                </strong>

                                <span>

                                    {progress.toFixed(0)}%

                                </span>

                            </div>

                            <dl className="fee-impact-year-grid">

                                <div>

                                    <dt>
                                        Fees this year
                                    </dt>

                                    <dd>

                                        {formatCurrency(
                                            year.feePaid.nominal
                                        )}

                                    </dd>

                                </div>

                                <div>

                                    <dt>
                                        Fees paid so far
                                    </dt>

                                    <dd>

                                        {formatCurrency(
                                            year.cumulativeFees.nominal
                                        )}

                                    </dd>

                                </div>

                                <div>

                                    <dt>
                                        Pension difference
                                    </dt>

                                    <dd>

                                        {formatCurrency(
                                            year.potDifference.nominal
                                        )}

                                    </dd>

                                </div>

                            </dl>

                            <div className="fee-impact-progress">

                                <div
                                    className="fee-impact-progress-fill"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />

                            </div>

                        </article>

                    );

                })}

            </div>

        </section>

    );

}