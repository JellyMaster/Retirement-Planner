import type { FeeImpact } from "../../engine/models/FeeImpact";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { MetricCard, MetricGrid } from "../ui";

interface FeeImpactMetricsProps {
  feeImpact: FeeImpact;
}

export function FeeImpactMetrics({ feeImpact }: FeeImpactMetricsProps) {
  return (
    <MetricGrid columns={3} className="fee-impact-metrics">
      <MetricCard
        label="Projected pot (with fees)"
        value={formatCurrency(feeImpact.withFees.finalBalance.nominal)}
        helper={`${formatCurrency(feeImpact.withFees.finalBalance.real)} in today's money`}
        icon={AppIcons.pension}
      />

      <MetricCard
        label="Projected pot (no fees)"
        value={formatCurrency(feeImpact.withoutFees.finalBalance.nominal)}
        helper={`${formatCurrency(feeImpact.withoutFees.finalBalance.real)} in today's money`}
        icon={AppIcons.growth}
        tone="positive"
      />

      <MetricCard
        label="Total fee impact"
        value={formatCurrency(feeImpact.finalPotDifference.nominal)}
        helper={`${formatCurrency(feeImpact.finalPotDifference.real)} in today's money`}
        icon={AppIcons.fees}
        tone="negative"
      />

      <MetricCard
        label="Fees actually paid"
        value={formatCurrency(feeImpact.cumulativeFees.nominal)}
        helper={`${formatCurrency(feeImpact.cumulativeFees.real)} in today's money`}
        icon={AppIcons.money}
        tone="warning"
      />

      <MetricCard
        label="Lost compound growth"
        value={formatCurrency(feeImpact.lostCompoundGrowth.nominal)}
        helper={`${formatCurrency(feeImpact.lostCompoundGrowth.real)} in today's money`}
        icon={AppIcons.chartLine}
        tone="warning"
      />

      <MetricCard
        label="Retirement pot reduced by"
        value={`${feeImpact.percentageDifference.toFixed(2)}%`}
        helper="Due to annual fund and platform fees"
        icon={AppIcons.fees}
        tone="accent"
      />
    </MetricGrid>
  );
}
