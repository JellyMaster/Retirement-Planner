import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardHeader, MetricCard, MetricGrid, ProgressRing, StatusBadge } from "../ui";
import { calculateRetirementHealth } from "./calculateRetirementHealth";

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
  const tone = health.status === "on-track" ? "success" : health.status === "close" ? "warning" : "danger";

  return (
    <Card
      className={`retirement-health-dashboard retirement-health-${health.status}`}
      padding="large"
      aria-labelledby="retirement-health-heading"
    >
      <div className="retirement-health-overview">
        <CardHeader
          eyebrow="Retirement readiness"
          title={title}
          titleId="retirement-health-heading"
          icon={AppIcons.health}
          description={
            health.annualGap >= 0
              ? `Your illustration is ${formatCurrency(health.annualGap)} a year above your target.`
              : `Your illustration is ${formatCurrency(Math.abs(health.annualGap))} a year below your target.`
          }
          badge={
            <StatusBadge tone={tone} icon={health.annualGap >= 0 ? AppIcons.success : AppIcons.warning}>
              {statusLabel}
            </StatusBadge>
          }
        />

        <ProgressRing
          className="retirement-health-score"
          value={health.score}
          label={health.score >= 100 ? "Target covered" : "Income coverage"}
          tone={tone}
          size="medium"
        />
      </div>

      <MetricGrid className="retirement-health-metrics" columns={4}>
        <MetricCard
          label="Projected pot"
          value={formatCurrency(result.finalBalance.real)}
          helper="Today's money"
          icon={AppIcons.pension}
        />
        <MetricCard
          label="Estimated income"
          value={formatCurrency(health.estimatedAnnualIncome)}
          helper={`${formatCurrency(health.estimatedAnnualIncome / 12)} per month`}
          icon={AppIcons.money}
          tone={health.annualGap >= 0 ? "positive" : "warning"}
        />
        <MetricCard
          label="Income target"
          value={formatCurrency(goals.desiredAnnualIncome)}
          helper={`${formatCurrency(goals.desiredAnnualIncome / 12)} per month`}
          icon={AppIcons.goals}
        />
        <MetricCard
          label="Target position"
          value={`${health.annualGap >= 0 ? "+" : "−"}${formatCurrency(Math.abs(health.annualGap))}`}
          helper="Per year"
          icon={health.annualGap >= 0 ? AppIcons.success : AppIcons.warning}
          tone={health.annualGap >= 0 ? "positive" : "negative"}
        />
      </MetricGrid>

      <div className="retirement-health-breakdown">
        <span>Private pension illustration: {formatCurrency(health.annualPrivateIncome)}</span>
        {goals.includeStatePension && (
          <span>State Pension from age {goals.statePensionAge}: {formatCurrency(health.annualStatePension)}</span>
        )}
        <span>Reserve retained: {formatCurrency(goals.emergencyReserve)}</span>
        <span>Planned retirement: age {inputs.retirementAge}</span>
      </div>

      <p className="retirement-health-disclaimer">
        Uses 4% of the projected pension after the reserve, plus the State Pension amount entered above. This is an illustration, not regulated financial advice or a guaranteed sustainable income.
      </p>
    </Card>
  );
}
