import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonteCarloYearPercentiles } from "../../engine/monte-carlo";
import { useChartTheme } from "../../theme/useChartTheme";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";
import { Card, CardHeader } from "../ui";
import { AppIcons } from "../../icons";

interface MonteCarloPercentileChartProps {
  yearlyPercentiles: readonly MonteCarloYearPercentiles[];
  targetRealBalance: number;
}

interface ChartPoint {
  age: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  target: number;
}

export function MonteCarloPercentileChart({
  yearlyPercentiles,
  targetRealBalance,
}: MonteCarloPercentileChartProps) {
  const colours = useChartTheme();

  if (yearlyPercentiles.length === 0) {
    return null;
  }

  const data: ChartPoint[] = yearlyPercentiles.map((year) => ({
    age: year.age,
    p10: year.real.p10,
    p25: year.real.p25,
    p50: year.real.p50,
    p75: year.real.p75,
    p90: year.real.p90,
    target: targetRealBalance,
  }));

  return (
    <Card
      className="monte-carlo-percentile-chart-card"
      tone="subtle"
      padding="medium"
      aria-labelledby="monte-carlo-percentile-chart-heading"
    >
      <CardHeader
        eyebrow="Range of outcomes"
        title="How uncertainty grows over time"
        titleId="monte-carlo-percentile-chart-heading"
        description="The shaded bands show the range between weaker and stronger simulated outcomes in today's money."
        icon={AppIcons.chart}
      />

      <div className="monte-carlo-percentile-chart" role="img" aria-label="Monte Carlo percentile paths from the 10th to the 90th percentile">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 8 }}>
            <CartesianGrid stroke={colours.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colours.text }}
              label={{ value: "Age", position: "insideBottom", offset: -6, fill: colours.text }}
            />
            <YAxis
              width={84}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colours.text }}
              tickFormatter={formatCompactCurrency}
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
              formatter={(value, name) => [formatCurrency(Number(value ?? 0)), name]}
              labelFormatter={(age) => `Age ${String(age)}`}
            />
            <Legend wrapperStyle={{ color: colours.text }} />

            <Area type="monotone" dataKey="p90" name="90th percentile" stroke="none" fill={colours.primary} fillOpacity={0.08} />
            <Area type="monotone" dataKey="p75" name="75th percentile" stroke="none" fill={colours.primary} fillOpacity={0.12} />
            <Area type="monotone" dataKey="p25" name="25th percentile" stroke="none" fill={colours.secondary} fillOpacity={0.10} />
            <Area type="monotone" dataKey="p10" name="10th percentile" stroke="none" fill={colours.secondary} fillOpacity={0.15} />
            <Line type="monotone" dataKey="p50" name="Median" stroke={colours.primary} strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="target" name="Target" stroke={colours.secondary} strokeWidth={2} strokeDasharray="7 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
