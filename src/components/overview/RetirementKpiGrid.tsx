import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { MetricCard, MetricGrid } from "../ui";

interface RetirementKpiGridProps {
  projectedPot: number;
  estimatedIncome: number;
  annualGap: number;
  retirementAge: number;
  yearsToRetirement: number;
}

export function RetirementKpiGrid({
  projectedPot,
  estimatedIncome,
  annualGap,
  retirementAge,
  yearsToRetirement,
}: RetirementKpiGridProps) {
  const targetDetail =
    annualGap >= 0
      ? `${formatCurrency(annualGap)} above your annual target`
      : `${formatCurrency(Math.abs(annualGap))} below your annual target`;

  return (
    <MetricGrid className="retirement-overview-kpi-grid" columns={4}>
      <MetricCard
        label="Projected pension"
        value={formatCurrency(projectedPot)}
        helper="Estimated value in today’s money"
        icon={AppIcons.pension}
      />
      <MetricCard
        label="Illustrated income"
        value={`${formatCurrency(estimatedIncome)} / year`}
        helper={targetDetail}
        icon={AppIcons.money}
        tone={annualGap >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        label="Planned retirement"
        value={`Age ${retirementAge}`}
        helper={
          yearsToRetirement === 1
            ? "1 year from your current age"
            : `${yearsToRetirement} years from your current age`
        }
        icon={AppIcons.calendar}
      />
      <MetricCard
        label="Target position"
        value={annualGap >= 0 ? "Target covered" : "Target shortfall"}
        helper={targetDetail}
        icon={annualGap >= 0 ? AppIcons.success : AppIcons.warning}
        tone={annualGap >= 0 ? "positive" : "negative"}
      />
    </MetricGrid>
  );
}
