import type { FeeImpact } from "../../engine/models/FeeImpact";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardHeader, ProgressBar, Stack } from "../ui";

interface FeeImpactTimelineProps {
  feeImpact: FeeImpact;
}

export function FeeImpactTimeline({ feeImpact }: FeeImpactTimelineProps) {
  const finalDifference = Math.max(feeImpact.finalPotDifference.nominal, 1);

  return (
    <Card
      className="fee-impact-timeline-panel"
      tone="subtle"
      aria-labelledby="fee-impact-timeline-heading"
    >
      <CardHeader
        headingLevel={3}
        title="Fee impact over time"
        titleId="fee-impact-timeline-heading"
        icon={AppIcons.calendar}
        description="The gap grows each year because fees reduce both your balance and the future investment growth that balance could have earned."
      />

      <Stack gap="small" className="fee-impact-timeline">
        {feeImpact.yearlyImpact.map((year) => {
          const progress = Math.min(
            100,
            (year.potDifference.nominal / finalDifference) * 100,
          );

          return (
            <Card
              as="article"
              key={year.yearIndex}
              className="fee-impact-year"
              padding="small"
              tone="default"
            >
              <div className="fee-impact-year-header">
                <strong>Age {year.age + 1}</strong>
                <span>{progress.toFixed(0)}% of final impact</span>
              </div>

              <dl className="fee-impact-year-grid">
                <div>
                  <dt>Fees this year</dt>
                  <dd>{formatCurrency(year.feePaid.nominal)}</dd>
                </div>
                <div>
                  <dt>Fees paid so far</dt>
                  <dd>{formatCurrency(year.cumulativeFees.nominal)}</dd>
                </div>
                <div>
                  <dt>Pension difference</dt>
                  <dd>{formatCurrency(year.potDifference.nominal)}</dd>
                </div>
              </dl>

              <ProgressBar
                value={progress}
                aria-label={`Fee impact at age ${year.age + 1}`}
                tone="warning"
              />
            </Card>
          );
        })}
      </Stack>
    </Card>
  );
}
