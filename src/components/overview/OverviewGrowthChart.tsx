import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { formatCurrency } from "../../utils/formatters";

interface OverviewGrowthChartProps {
  currentAge: number;
  currentPot: number;
  retirementAge: number;
  planningAge: number;
  projectionYears: ProjectionYear[];
  drawdownYears?: DrawdownYear[];
}

interface JourneyPoint {
  age: number;
  balance: number;
}

interface MilestonePoint extends JourneyPoint {
  threshold: number;
  label: string;
}

export function OverviewGrowthChart({
  currentAge,
  currentPot,
  retirementAge,
  planningAge,
  projectionYears,
  drawdownYears = [],
}: OverviewGrowthChartProps) {
  const data = createJourneyData({
    currentAge,
    currentPot,
    planningAge,
    projectionYears,
    drawdownYears,
  });

  if (data.length === 0) {
    return (
      <div className="polaris-overview-chart-empty">
        Add valid plan inputs to see your pension journey over time.
      </div>
    );
  }

  const milestones = findMilestones(data);

  return (
    <div
      className="polaris-overview-chart-canvas"
      role="img"
      aria-label={`Projected pension journey from age ${currentAge} to age ${planningAge} in today's money`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="age"
            type="number"
            domain={[currentAge, planningAge]}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={62}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Pension value"]}
            labelFormatter={(age) => `Age ${age}`}
          />
          <ReferenceLine
            x={retirementAge}
            stroke="var(--colour-text-muted)"
            strokeDasharray="4 4"
            label={{
              value: "Retirement",
              position: "insideTopRight",
              fill: "var(--colour-text-muted)",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Pension value"
            stroke="var(--colour-primary)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {milestones.map((milestone) => (
            <ReferenceDot
              key={milestone.threshold}
              x={milestone.age}
              y={milestone.balance}
              r={5}
              fill="var(--colour-surface)"
              stroke="var(--colour-primary)"
              strokeWidth={3}
              label={{
                value: milestone.label,
                position: "top",
                fill: "var(--colour-text-strong)",
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function createJourneyData({
  currentAge,
  currentPot,
  planningAge,
  projectionYears,
  drawdownYears,
}: {
  currentAge: number;
  currentPot: number;
  planningAge: number;
  projectionYears: ProjectionYear[];
  drawdownYears: DrawdownYear[];
}): JourneyPoint[] {
  const byAge = new Map<number, number>();
  byAge.set(currentAge, Math.max(0, currentPot));

  projectionYears.forEach((year) => {
    if (year.age <= planningAge) {
      byAge.set(year.age, Math.max(0, year.closingBalance.real));
    }
  });

  drawdownYears.forEach((year) => {
    const closingAge = year.age + 1;
    if (closingAge <= planningAge) {
      byAge.set(closingAge, Math.max(0, year.closingBalance));
    }
  });

  return Array.from(byAge.entries())
    .map(([age, balance]) => ({ age, balance }))
    .sort((left, right) => left.age - right.age);
}

function findMilestones(data: JourneyPoint[]): MilestonePoint[] {
  const maximumBalance = Math.max(...data.map((point) => point.balance));
  const thresholds = createMilestoneThresholds(maximumBalance);

  return thresholds.flatMap((threshold) => {
    const point = data.find((candidate) => candidate.balance >= threshold);
    return point
      ? [
          {
            ...point,
            threshold,
            label: formatMilestone(threshold),
          },
        ]
      : [];
  });
}

function createMilestoneThresholds(maximumBalance: number): number[] {
  const thresholds: number[] = [];
  const multipliers = [1, 2.5, 5];

  for (let scale = 100_000; scale <= maximumBalance; scale *= 10) {
    multipliers.forEach((multiplier) => {
      const threshold = scale * multiplier;
      if (threshold <= maximumBalance) thresholds.push(threshold);
    });
  }

  return thresholds;
}

function formatMilestone(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `£${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  return `£${Math.round(value / 1_000)}k`;
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
