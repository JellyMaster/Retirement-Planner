
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

interface ContributionGrowthChartProps {
  years: ProjectionYear[];
}

interface ChartDataPoint {
  age: number;
  contributions: number;
  investmentGrowth: number;
  fees: number;
}

export function ContributionGrowthChart({
  years,
}: ContributionGrowthChartProps) {
  if (years.length === 0) {
    return null;
  }

  const chartData: ChartDataPoint[] = years.map(
    (year) => ({
      age: year.age + 1,
      contributions:
        year.contributions.nominal,
      investmentGrowth:
        year.investmentGrowth.nominal,

      // Display fees below the horizontal axis.
      fees: -Math.abs(year.fees.nominal),
    })
  );

  return (
    <section className="panel contribution-growth-chart-panel">
      <div className="panel-heading">
        <h2>Contributions and growth</h2>

        <p>
          See how annual contributions and investment
          returns affect your pension, with fees shown
          below zero.
        </p>
      </div>

      <div className="contribution-growth-chart">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
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

                const numericValue = Number(
                  rawValue ?? 0
                );

                return [
                  formatCurrency(
                    Math.abs(
                      Number.isFinite(numericValue)
                        ? numericValue
                        : 0
                    )
                  ),
                  name,
                ];
              }}
              labelFormatter={(age) =>
                `Age ${String(age)}`
              }
            />

            <Legend />

            <Bar
              dataKey="contributions"
              name="Contributions"
              stackId="annualIncrease"
              fill="#287865"
            />

            <Bar
              dataKey="investmentGrowth"
              name="Investment growth"
              stackId="annualIncrease"
              fill="#79b8a8"
            />

            <Bar
              dataKey="fees"
              name="Fees"
              fill="#9ca3af"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}



