
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
  if (
    baseYears.length === 0 &&
    comparisonYears.length === 0
  ) {
    return null;
  }

  const chartData = createChartData(
    baseYears,
    comparisonYears
  );

  return (
    <section className="panel scenario-chart-panel">
      <div className="panel-heading">
        <h2>Scenario balance comparison</h2>

        <p>
          Compare how the projected pension balance changes
          under each set of assumptions.
        </p>
      </div>

      <div className="scenario-comparison-chart">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              bottom: 10,
              left: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              label={{
                value: "Age",
                position: "insideBottom",
                offset: -5,
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              width={85}
              tickFormatter={formatAxisCurrency}
            />

            <Tooltip
              formatter={(value, name) => {
                const rawValue = Array.isArray(value)
                  ? value[0]
                  : value;

                const numericValue = Number(
                  rawValue ?? 0
                );

                return [
                  formatCurrency(
                    Number.isFinite(numericValue)
                      ? numericValue
                      : 0
                  ),
                  name,
                ];
              }}
              labelFormatter={(age) =>
                `Age ${String(age)}`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="baseBalance"
              name="Current plan"
              stroke="#287865"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="comparisonBalance"
              name="Comparison plan"
              stroke="#7c3aed"
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
  const pointsByAge = new Map<
    number,
    ComparisonChartPoint
  >();

  for (const year of baseYears) {
    const age = year.age + 1;

    pointsByAge.set(age, {
      ...pointsByAge.get(age),
      age,
      baseBalance:
        year.closingBalance.nominal,
    });
  }

  for (const year of comparisonYears) {
    const age = year.age + 1;

    pointsByAge.set(age, {
      ...pointsByAge.get(age),
      age,
      comparisonBalance:
        year.closingBalance.nominal,
    });
  }

  return Array.from(
    pointsByAge.values()
  ).sort((first, second) => {
    return first.age - second.age;
  });
}

function formatAxisCurrency(
  value: number
): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `£${(
      absoluteValue / 1_000_000
    ).toFixed(1)}m`;
  }

  if (absoluteValue >= 1_000) {
    return `£${Math.round(
      absoluteValue / 1_000
    )}k`;
  }

  return `£${Math.round(
    absoluteValue
  )}`;
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

