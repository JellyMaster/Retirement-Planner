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

import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { useChartTheme } from "../../theme/useChartTheme";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface ScenarioComparisonChartProps {
  baseYears: ProjectionYear[];
  comparisonYears: ProjectionYear[];
}

interface ComparisonChartPoint {
  age: number;
  baseBalance?: number;
  comparisonBalance?: number;
}

export function ScenarioComparisonChart({
  baseYears,
  comparisonYears,
}: ScenarioComparisonChartProps) {
  const chartColours = useChartTheme();

  if (baseYears.length === 0 && comparisonYears.length === 0) {
    return null;
  }

  const chartData = createChartData(baseYears, comparisonYears);

  return (
    <section className="panel scenario-chart-panel">
      <div className="panel-heading">
        <h2>Scenario balance comparison</h2>
        <p>
          Compare how the projected pension balance changes under each set of
          assumptions.
        </p>
      </div>

      <div className="scenario-comparison-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
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

                return [
                  formatCurrency(
                    Number.isFinite(numericValue) ? numericValue : 0
                  ),
                  name,
                ];
              }}
              labelFormatter={(age) => `Age ${String(age)}`}
            />

            <Legend wrapperStyle={{ color: chartColours.text }} />

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
          </LineChart>
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

  return Array.from(pointsByAge.values()).sort(
    (first, second) => first.age - second.age
  );
}
