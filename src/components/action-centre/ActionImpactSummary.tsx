import { MetricCard, MetricGrid } from "../ui";
import type { RecommendationBaseline, RetirementRecommendation } from "../../engine/recommendations";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";

interface ActionImpactSummaryProps {
  baseline: RecommendationBaseline;
  recommendation: RetirementRecommendation;
}

function formatPointChange(value: number): string {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${rounded} pts`;
}

function formatProbability(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ActionImpactSummary({
  baseline,
  recommendation,
}: ActionImpactSummaryProps) {
  const { impact, metrics } = recommendation;

  return (
    <MetricGrid columns={3} className="action-impact-grid">
      <MetricCard
        compact
        label="Projected pot"
        value={formatCompactCurrency(metrics.projection.finalBalance.real)}
        helper={`${impact.projectedPotChange >= 0 ? "+" : ""}${formatCompactCurrency(impact.projectedPotChange)}`}
        tone={impact.projectedPotChange >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        compact
        label="Illustrated income"
        value={formatCurrency(
          Math.max(
            0,
            metrics.projection.finalBalance.real - baseline.goals.emergencyReserve,
          ) * 0.04 +
            (baseline.goals.includeStatePension
              ? baseline.goals.statePensionAnnualAmount
              : 0),
        )}
        helper={`${impact.illustratedAnnualIncomeChange >= 0 ? "+" : ""}${formatCurrency(impact.illustratedAnnualIncomeChange)} a year`}
        tone={impact.illustratedAnnualIncomeChange >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        compact
        label="Confidence"
        value={formatProbability(metrics.monteCarloConfidence)}
        helper={formatPointChange(impact.monteCarloConfidenceChange * 100)}
        tone={impact.monteCarloConfidenceChange >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        compact
        label="Readiness"
        value={`${metrics.readinessScore}/100`}
        helper={formatPointChange(impact.readinessScoreChange)}
        tone={impact.readinessScoreChange >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        compact
        label="Weighted score"
        value={`${metrics.weightedScore}/100`}
        helper={formatPointChange(impact.weightedScoreChange)}
        tone={impact.weightedScoreChange >= 0 ? "positive" : "negative"}
      />
      {metrics.sustainabilityProbability !== undefined && (
        <MetricCard
          compact
          label="Sustainability"
          value={formatProbability(metrics.sustainabilityProbability)}
          helper={formatPointChange((impact.sustainabilityProbabilityChange ?? 0) * 100)}
          tone={(impact.sustainabilityProbabilityChange ?? 0) >= 0 ? "positive" : "negative"}
        />
      )}
    </MetricGrid>
  );
}
