import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";

import { formatCurrency } from "../../utils/formatters";

import {
    calculateRetirementHealth,
} from "./calculateRetirementHealth";

interface RetirementHealthDashboardProps {
    inputs: PensionInputs;
    result: ProjectionResult;
    goals: RetirementGoals;
    title?: string;
}

export function RetirementHealthDashboard({
    inputs,
    result,
    goals,
    title = "Retirement health",
}: RetirementHealthDashboardProps) {
    const health = calculateRetirementHealth(result, goals);

    const statusLabel =
        health.status === "on-track"
            ? "On track"
            : health.status === "close"
                ? "Close to target"
                : "Needs attention";

    const scoreLabel =
        health.score >= 100
            ? "Target covered"
            : `${health.score}% of target`;

    return (
        <section
            className={`retirement-health-dashboard retirement-health-${health.status}`}
            aria-labelledby="retirement-health-heading"
        >
            <div className="retirement-health-overview">
                <div>
                    <p className="planner-eyebrow">
                        Retirement readiness
                    </p>

                    <h2 id="retirement-health-heading">
                        {title}
                    </h2>

                    <div className="retirement-health-status">
                        <span aria-hidden="true" />
                        {statusLabel}
                    </div>

                    <p>
                        {health.annualGap >= 0
                            ? `Your illustration is ${formatCurrency(
                                  health.annualGap
                              )} a year above your target.`
                            : `Your illustration is ${formatCurrency(
                                  Math.abs(health.annualGap)
                              )} a year below your target.`}
                    </p>
                </div>

                <div
                    className="retirement-health-score"
                    aria-label={`Readiness score ${health.score} out of 100`}
                >
                    <strong>{health.score}</strong>
                    <span>/100</span>
                    <small>{scoreLabel}</small>
                </div>
            </div>

            <div className="retirement-health-metrics">
                <article>
                    <span>Projected pot</span>
                    <strong>{formatCurrency(result.finalBalance.real)}</strong>
                    <small>Today's money</small>
                </article>

                <article>
                    <span>Estimated income</span>
                    <strong>{formatCurrency(health.estimatedAnnualIncome)}</strong>
                    <small>
                        {formatCurrency(
                            health.estimatedAnnualIncome / 12
                        )}{" "}
                        per month
                    </small>
                </article>

                <article>
                    <span>Income target</span>
                    <strong>{formatCurrency(goals.desiredAnnualIncome)}</strong>
                    <small>
                        {formatCurrency(
                            goals.desiredAnnualIncome / 12
                        )}{" "}
                        per month
                    </small>
                </article>

                <article>
                    <span>Target position</span>

                    <strong
                        className={
                            health.annualGap >= 0
                                ? "positive"
                                : "negative"
                        }
                    >
                        {health.annualGap >= 0 ? "+" : "−"}
                        {formatCurrency(Math.abs(health.annualGap))}
                    </strong>

                    <small>Per year</small>
                </article>
            </div>

            <div className="retirement-health-breakdown">
                <span>
                    Private pension illustration:{" "}
                    {formatCurrency(health.annualPrivateIncome)}
                </span>

                {goals.includeStatePension && (
                    <span>
                        State Pension from age {goals.statePensionAge}:{" "}
                        {formatCurrency(health.annualStatePension)}
                    </span>
                )}

                <span>
                    Reserve retained:{" "}
                    {formatCurrency(goals.emergencyReserve)}
                </span>

                <span>
                    Planned retirement: age {inputs.retirementAge}
                </span>
            </div>

            <p className="retirement-health-disclaimer">
                Uses 4% of the projected pension after the reserve,
                plus the State Pension amount entered above. This is
                an illustration, not regulated financial advice or a
                guaranteed sustainable income.
            </p>
        </section>
    );
}