import { useMemo } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import {
  calculateMonteCarloTarget,
  MonteCarloEngine,
} from "../../engine/monte-carlo";
import { AppIcons } from "../../icons";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";
import {
  Card,
  CardHeader,
  MetricCard,
  MetricGrid,
  ProgressRing,
  StatusBadge,
  type ProgressTone,
  type StatusBadgeTone,
} from "../ui";

interface MonteCarloConfidenceDashboardProps {
  inputs: PensionInputs;
  goals: RetirementGoals;
  simulations?: number;
  annualVolatility?: number;
  seed?: number;
}

interface ConfidencePresentation {
  label: string;
  description: string;
  progressTone: ProgressTone;
  badgeTone: StatusBadgeTone;
}

function getConfidencePresentation(probability: number): ConfidencePresentation {
  if (probability >= 0.9) {
    return {
      label: "High confidence",
      description:
        "Most simulated accumulation paths reached the balance needed to support your illustrated income target.",
      progressTone: "success",
      badgeTone: "success",
    };
  }

  if (probability >= 0.7) {
    return {
      label: "Moderate confidence",
      description:
        "A majority of simulated paths reached the target, but weaker market outcomes still create meaningful uncertainty.",
      progressTone: "warning",
      badgeTone: "warning",
    };
  }

  return {
    label: "Lower confidence",
    description:
      "Fewer than seven in ten simulated paths reached the target. The Retirement Coach can help you explore improvements.",
    progressTone: "danger",
    badgeTone: "danger",
  };
}

export function MonteCarloConfidenceDashboard({
  inputs,
  goals,
  simulations = 2_000,
  annualVolatility = 0.12,
  seed = 12_345,
}: MonteCarloConfidenceDashboardProps) {
  const target = useMemo(() => calculateMonteCarloTarget(goals), [goals]);
  const result = useMemo(
    () =>
      MonteCarloEngine.calculate({
        pensionInputs: inputs,
        simulations,
        seed,
        annualVolatility,
        targetRealBalance: target.targetRealBalance,
      }),
    [annualVolatility, inputs, seed, simulations, target.targetRealBalance],
  );

  const probability = result.successProbability ?? 0;
  const probabilityPercent = probability * 100;
  const presentation = getConfidencePresentation(probability);
  const downsideIncome = Math.max(
    0,
    (result.finalRealBalance.p10 - target.emergencyReserve) * 0.04 +
      target.includedStatePensionIncome,
  );
  const medianIncome = Math.max(
    0,
    (result.finalRealBalance.p50 - target.emergencyReserve) * 0.04 +
      target.includedStatePensionIncome,
  );

  return (
    <Card
      className="monte-carlo-confidence"
      padding="large"
      aria-labelledby="monte-carlo-confidence-heading"
    >
      <div className="monte-carlo-confidence-hero">
        <CardHeader
          eyebrow="Market uncertainty"
          title="Retirement confidence"
          titleId="monte-carlo-confidence-heading"
          description={presentation.description}
          icon={AppIcons.chartLine}
          badge={
            <StatusBadge tone={presentation.badgeTone} icon={AppIcons.chart}>
              {simulations.toLocaleString("en-GB")} simulations
            </StatusBadge>
          }
        />

        <ProgressRing
          className="monte-carlo-confidence-ring"
          value={probabilityPercent}
          label={presentation.label}
          tone={presentation.progressTone}
          size="large"
          valueFormatter={(value) => `${Math.round(value)}%`}
          aria-valuetext={`${Math.round(probabilityPercent)} percent of simulations reached the target`}
        />
      </div>

      <MetricGrid columns={4}>
        <MetricCard
          label="Target balance"
          value={formatCompactCurrency(target.targetRealBalance)}
          helper="Today's money"
          icon={AppIcons.goals}
          tone="accent"
        />
        <MetricCard
          label="Downside outcome"
          value={formatCompactCurrency(result.finalRealBalance.p10)}
          helper={`${formatCurrency(downsideIncome)} illustrated income`}
          icon={AppIcons.warning}
          tone="warning"
        />
        <MetricCard
          label="Median outcome"
          value={formatCompactCurrency(result.finalRealBalance.p50)}
          helper={`${formatCurrency(medianIncome)} illustrated income`}
          icon={AppIcons.pension}
          tone={result.finalRealBalance.p50 >= target.targetRealBalance ? "positive" : "neutral"}
        />
        <MetricCard
          label="Strong outcome"
          value={formatCompactCurrency(result.finalRealBalance.p90)}
          helper="90th percentile"
          icon={AppIcons.growth}
          tone="positive"
        />
      </MetricGrid>

      <div className="monte-carlo-confidence-range" aria-label="Simulated retirement balance range">
        <span>10th percentile {formatCurrency(result.finalRealBalance.p10)}</span>
        <span>Median {formatCurrency(result.finalRealBalance.p50)}</span>
        <span>90th percentile {formatCurrency(result.finalRealBalance.p90)}</span>
      </div>

      <p className="monte-carlo-confidence-disclaimer">
        This illustration varies annual investment returns around your selected expected return using {Math.round(annualVolatility * 100)}% annual volatility. It models accumulation to retirement only, uses a 4% income illustration, and is not a forecast, guarantee, probability of drawdown survival, or regulated financial advice.
      </p>
    </Card>
  );
}
