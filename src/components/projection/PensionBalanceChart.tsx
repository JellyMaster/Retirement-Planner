
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

import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";


interface PensionBalanceChartProps {
  years: ProjectionYear[];
}

interface ChartDataPoint {
  age: number;
  nominalBalance: number;
  realBalance: number;
}

export function PensionBalanceChart({
  years,
}: PensionBalanceChartProps) {
  if (years.length === 0) {
    return null;
  }

  const chartData: ChartDataPoint[] =
    years.map((year) => ({
      age: year.age + 1,

      nominalBalance:
        year.closingBalance.nominal,

      realBalance:
        year.closingBalance.real,
    }));

  return (
    <section className="panel projection-chart-panel">
      <div className="panel-heading">
        <h2>Pension value over time</h2>

        <p>
          Compare the projected pension balance with its
          estimated value in today&apos;s money.
        </p>
      </div>

      <div className="projection-chart">
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
              tickFormatter={formatCompactCurrency}
            />

            <Tooltip
              formatter={(value, name) => {
                const rawValue =
                  Array.isArray(value)
                    ? value[0]
                    : value;

                const numericValue =
                  Number(rawValue ?? 0);

                return [
                  formatCurrency(
                    Number.isFinite(
                      numericValue
                    )
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
              dataKey="nominalBalance"
              name="Projected value"
              stroke="#287865"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="realBalance"
              name="Today's money"
              stroke="#6b7280"
              strokeWidth={3}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}



