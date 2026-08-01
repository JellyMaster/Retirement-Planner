import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonteCarloDrawdownAgeStatistics } from "../../engine/monte-carlo-drawdown";
import { AppIcons } from "../../icons";
import { useChartTheme } from "../../theme/useChartTheme";
import { Card, CardHeader } from "../ui";

interface RetirementSurvivalChartProps {
  statistics: readonly MonteCarloDrawdownAgeStatistics[];
}

export function RetirementSurvivalChart({
  statistics,
}: RetirementSurvivalChartProps) {
  const colours = useChartTheme();
  const data = statistics.map((item) => ({
    age: item.age,
    funded: item.survivalProbability * 100,
    incomeReliable: item.incomeReliabilityProbability * 100,
  }));

  if (data.length === 0) return null;

  return (
    <Card
      className="retirement-survival-chart-card"
      tone="subtle"
      padding="medium"
      aria-labelledby="retirement-survival-chart-heading"
    >
      <CardHeader
        eyebrow="Lifetime resilience"
        title="How retirement reliability changes with age"
        titleId="retirement-survival-chart-heading"
        description="The lines show the share of simulated paths still funded and meeting the income goal at each age."
        icon={AppIcons.chartLine}
      />

      <div
        className="retirement-survival-chart"
        role="img"
        aria-label="Percentage of simulated retirement paths funded and meeting the income target by age"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 8 }}>
            <CartesianGrid stroke={colours.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colours.text }}
              label={{ value: "Age", position: "insideBottom", offset: -6, fill: colours.text }}
            />
            <YAxis
              domain={[0, 100]}
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colours.text }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ stroke: colours.cursor }}
              contentStyle={{
                backgroundColor: colours.tooltipBackground,
                border: `1px solid ${colours.tooltipBorder}`,
                borderRadius: "0.5rem",
                color: colours.tooltipText,
              }}
              labelStyle={{ color: colours.tooltipText }}
              itemStyle={{ color: colours.tooltipText }}
              formatter={(value, name) => [`${Math.round(Number(value ?? 0))}%`, name]}
              labelFormatter={(age) => `Age ${String(age)}`}
            />
            <Legend wrapperStyle={{ color: colours.text }} />
            <Line
              type="monotone"
              dataKey="funded"
              name="Pension remains funded"
              stroke={colours.primary}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="incomeReliable"
              name="Income target met"
              stroke={colours.secondary}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
