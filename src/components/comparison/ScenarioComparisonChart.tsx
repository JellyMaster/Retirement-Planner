import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { useChartTheme } from "../../theme/useChartTheme";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface ScenarioComparisonChartProps {
  baseYears: ProjectionYear[];
  comparisonYears: ProjectionYear[];
  baseRetirementAge: number;
  comparisonRetirementAge: number;
}

interface ComparisonChartPoint {
  age: number;
  baseBalance?: number;
  comparisonBalance?: number;
  lowerBalance?: number;
  balanceGap?: number;
  balanceDifference?: number;
}

export function ScenarioComparisonChart({
  baseYears,
  comparisonYears,
  baseRetirementAge,
  comparisonRetirementAge,
}: ScenarioComparisonChartProps) {
  const chartColours = useChartTheme();

  if (baseYears.length === 0 && comparisonYears.length === 0) {
    return null;
  }

  const chartData = createChartData(baseYears, comparisonYears);
  const retirementAgesMatch = baseRetirementAge === comparisonRetirementAge;

  return (
    <section className="panel scenario-chart-panel">
      <div className="panel-heading comparison-chart-heading">
        <div>
          <h2>Year-by-year pension projection</h2>
          <p>
            Follow how the plans diverge over time. The shaded band shows the
            gap between their projected balances.
          </p>
        </div>
        <div className="comparison-chart-key" aria-label="Chart explanation">
          <span><i className="comparison-chart-key-current" />Current plan</span>
          <span><i className="comparison-chart-key-alternative" />Comparison plan</span>
          <span><i className="comparison-chart-key-gap" />Balance gap</span>
        </div>
      </div>

      <div className="scenario-comparison-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 28, right: 24, bottom: 10, left: 10 }}
          >
            <CartesianGrid
              stroke={chartColours.grid}
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="age"
              tickLine={false}
              tick={{ fill: chartColours.text }}
              axisLine={false}
              label={{
                value: "Age",
                position: "insideBottom",
                offset: -5,
                fill: chartColours.text,
              }}
            />

            <YAxis
              tickLine={false}
              tick={{ fill: chartColours.text }}
              axisLine={false}
              width={85}
              tickFormatter={formatCompactCurrency}
            />

            <Tooltip
              cursor={{ stroke: chartColours.cursor }}
              contentStyle={{
                backgroundColor: chartColours.tooltipBackground,
                border: `1px solid ${chartColours.tooltipBorder}`,
                borderRadius: "0.5rem",
                color: chartColours.tooltipText,
              }}
              labelStyle={{ color: chartColours.tooltipText }}
              itemStyle={{ color: chartColours.tooltipText }}
              formatter={(value, name) => {
                const rawValue = Array.isArray(value) ? value[0] : value;
                const numericValue = Number(rawValue ?? 0);
                const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

                if (name === "Difference") {
                  const prefix = safeValue > 0 ? "+" : "";
                  return [`${prefix}${formatCurrency(safeValue)}`, name];
                }

                return [formatCurrency(safeValue), name];
              }}
              labelFormatter={(age) => `Age ${String(age)}`}
            />

            <Legend wrapperStyle={{ color: chartColours.text }} />

            <Area
              type="monotone"
              dataKey="lowerBalance"
              stackId="comparison-gap"
              stroke="none"
              fill="transparent"
              legendType="none"
              tooltipType="none"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="balanceGap"
              stackId="comparison-gap"
              name="Balance gap"
              stroke="none"
              fill={chartColours.primary}
              fillOpacity={0.12}
              legendType="none"
              tooltipType="none"
              connectNulls
            />

            {retirementAgesMatch ? (
              <ReferenceLine
                x={baseRetirementAge}
                stroke={chartColours.cursor}
                strokeDasharray="4 4"
                label={{
                  value: `Both retire at ${baseRetirementAge}`,
                  position: "insideTopRight",
                  fill: chartColours.text,
                  fontSize: 12,
                }}
              />
            ) : (
              <>
                <ReferenceLine
                  x={baseRetirementAge}
                  stroke={chartColours.primary}
                  strokeDasharray="4 4"
                  label={{
                    value: `Current retires ${baseRetirementAge}`,
                    position: "insideTopLeft",
                    fill: chartColours.primary,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine
                  x={comparisonRetirementAge}
                  stroke={chartColours.secondary}
                  strokeDasharray="4 4"
                  label={{
                    value: `Comparison retires ${comparisonRetirementAge}`,
                    position: "insideTopRight",
                    fill: chartColours.secondary,
                    fontSize: 11,
                  }}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="baseBalance"
              name="Current plan"
              stroke={chartColours.primary}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="comparisonBalance"
              name="Comparison plan"
              stroke={chartColours.secondary}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="balanceDifference"
              name="Difference"
              stroke="transparent"
              strokeWidth={0}
              dot={false}
              activeDot={false}
              legendType="none"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function createChartData(
  baseYears: ProjectionYear[],
  comparisonYears: ProjectionYear[]
): ComparisonChartPoint[] {
  const pointsByAge = new Map<number, ComparisonChartPoint>();

  for (const year of baseYears) {
    const age = year.age + 1;

    pointsByAge.set(age, {
      ...pointsByAge.get(age),
      age,
      baseBalance: year.closingBalance.nominal,
    });
  }

  for (const year of comparisonYears) {
    const age = year.age + 1;

    pointsByAge.set(age, {
      ...pointsByAge.get(age),
      age,
      comparisonBalance: year.closingBalance.nominal,
    });
  }

  return Array.from(pointsByAge.values())
    .sort((first, second) => first.age - second.age)
    .map((point) => {
      if (point.baseBalance === undefined || point.comparisonBalance === undefined) {
        return point;
      }

      return {
        ...point,
        lowerBalance: Math.min(point.baseBalance, point.comparisonBalance),
        balanceGap: Math.abs(point.comparisonBalance - point.baseBalance),
        balanceDifference: point.comparisonBalance - point.baseBalance,
      };
    });
}
