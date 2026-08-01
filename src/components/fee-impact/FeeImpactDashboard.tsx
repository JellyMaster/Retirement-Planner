import type { FeeImpact } from "../../engine/models/FeeImpact";
import { AppIcons } from "../../icons";
import { Card, CardHeader, Stack } from "../ui";

import { FeeImpactMetrics } from "./FeeImpactMetrics";
import { FeeImpactComparisonChart } from "./FeeImpactComparisonChart";
import { FeeImpactTimeline } from "./FeeImpactTimeline";
import { FeeImpactInsights } from "./FeeImpactInsights";

export interface FeeImpactDashboardProps {
  feeImpact: FeeImpact;
}

export function FeeImpactDashboard({ feeImpact }: FeeImpactDashboardProps) {
  return (
    <Card
      className="fee-impact-dashboard"
      padding="large"
      aria-labelledby="fee-impact-heading"
    >
      <CardHeader
        eyebrow="Fee analysis"
        title="How fees affect your retirement"
        titleId="fee-impact-heading"
        icon={AppIcons.fees}
        description="Compare your projected pension with your current annual fee against the same projection assuming no annual platform or fund charges."
      />

      <Stack gap="large" className="fee-impact-dashboard-content">
        <FeeImpactMetrics feeImpact={feeImpact} />
        <FeeImpactComparisonChart feeImpact={feeImpact} />
        <FeeImpactTimeline feeImpact={feeImpact} />
        <FeeImpactInsights feeImpact={feeImpact} />
      </Stack>
    </Card>
  );
}
