import type { FeeImpact } from "../../engine/models/FeeImpact";
import { formatCurrency } from "../../utils/formatters";

interface FeeImpactMetricsProps {
    feeImpact: FeeImpact;
}

export function FeeImpactMetrics({
    feeImpact,
}: FeeImpactMetricsProps) {

    return (

        <div className="fee-impact-metrics">

            <MetricCard
                label="Projected pot (with fees)"
                value={
                    feeImpact.withFees.finalBalance.nominal
                }
                secondaryValue={
                    feeImpact.withFees.finalBalance.real
                }
            />

            <MetricCard
                label="Projected pot (no fees)"
                value={
                    feeImpact.withoutFees.finalBalance.nominal
                }
                secondaryValue={
                    feeImpact.withoutFees.finalBalance.real
                }
            />

            <MetricCard
                label="Difference"
                value={
                    feeImpact.finalPotDifference.nominal
                }
                secondaryValue={
                    feeImpact.finalPotDifference.real
                }
                positive
            />

            <MetricCard
                label="Fees actually paid"
                value={
                    feeImpact.cumulativeFees.nominal
                }
                secondaryValue={
                    feeImpact.cumulativeFees.real
                }
            />

            <MetricCard
                label="Lost compound growth"
                value={
                    feeImpact.lostCompoundGrowth.nominal
                }
                secondaryValue={
                    feeImpact.lostCompoundGrowth.real
                }
                warning
            />

            <PercentageCard
                percentage={
                    feeImpact.percentageDifference
                }
            />

        </div>

    );

}

interface MetricCardProps {

    label: string;

    value: number;

    secondaryValue: number;

    positive?: boolean;

    warning?: boolean;

}

function MetricCard({

    label,

    value,

    secondaryValue,

    positive = false,

    warning = false,

}: MetricCardProps) {

    const className = [

        "summary-card",

        positive && "summary-card-positive",

        warning && "summary-card-warning",

    ]
        .filter(Boolean)
        .join(" ");

    return (

        <article className={className}>

            <p className="summary-label">
                {label}
            </p>

            <strong className="summary-value">

                {formatCurrency(value)}

            </strong>

            <p className="summary-real-value">

                {formatCurrency(secondaryValue)}

                {" "}in today's money

            </p>

        </article>

    );

}

interface PercentageCardProps {

    percentage: number;

}

function PercentageCard({

    percentage,

}: PercentageCardProps) {

    return (

        <article className="summary-card summary-card-highlight">

            <p className="summary-label">

                Retirement pot reduced by

            </p>

            <strong className="summary-value">

                {percentage.toFixed(2)}%

            </strong>

            <p className="summary-real-value">

                Due to annual fund/platform fees

            </p>

        </article>

    );

}