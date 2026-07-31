import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FeeImpact } from "../../engine/models/FeeImpact";
import { useChartTheme } from "../../theme/useChartTheme";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface FeeImpactComparisonChartProps {
  feeImpact: FeeImpact;
}

interface FeeImpactChartDataPoint {
  age: number;
  withFees: number;
  withoutFees: number;
  feeImpact: number;
}

export function FeeImpactComparisonChart({
  feeImpact,
}: FeeImpactComparisonChartProps) {
  const chartColours = useChartTheme();

  const chartData: FeeImpactChartDataPoint[] =
    feeImpact.withFees.years.map((withFeeYear, index) => {
      const withoutFeeYear = feeImpact.withoutFees.years[index];

      const withFees = withFeeYear.closingBalance.nominal;
      const withoutFees =
        withoutFeeYear?.closingBalance.nominal ?? withFees;

      return {
        age: withFeeYear.age + 1,
        withFees,
        withoutFees,
        feeImpact: Math.max(0, withoutFees - withFees),
      };
    });

  if (chartData.length === 0) {
    return null;
  }

  return (
    <section
      className="panel projection-chart-panel fee-impact-chart-panel"
      aria-labelledby="fee-impact-chart-heading"
    >
      <div className="panel-heading">
        <h3 id="fee-impact-chart-heading">
          Pension value with and without fees
        </h3>

        <p>
          The shaded area shows the cumulative reduction in your projected
          pension caused by fees and the investment growth those fees would
          otherwise have earned.
        </p>
      </div>

      <div className="projection-chart fee-impact-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
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
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const point = payload[0]
                  ?.payload as FeeImpactChartDataPoint | undefined;

                if (!point) {
                  return null;
                }

                return (
                  <div
                    className="fee-impact-chart-tooltip"
                    style={{
                      backgroundColor: chartColours.tooltipBackground,
                      border: `1px solid ${chartColours.tooltipBorder}`,
                      borderRadius: "0.5rem",
                      color: chartColours.tooltipText,
                      padding: "0.75rem",
                    }}
                  >
                    <strong>Age {String(label)}</strong>

                    <dl>
                      <div>
                        <dt>With fees</dt>
                        <dd>{formatCurrency(point.withFees)}</dd>
                      </div>

                      <div>
                        <dt>Without fees</dt>
                        <dd>{formatCurrency(point.withoutFees)}</dd>
                      </div>

                      <div>
                        <dt>Cumulative impact</dt>
                        <dd>{formatCurrency(point.feeImpact)}</dd>
                      </div>
                    </dl>
                  </div>
                );
              }}
            />

            <Legend wrapperStyle={{ color: chartColours.text }} />

            {/*
              These two stacked areas create a band between the with-fees
              and without-fees balances. The first area is an invisible
              baseline; the second area represents the fee impact.
            */}
            <Area
              type="monotone"
              dataKey="withFees"
              stackId="fee-impact-band"
              stroke="none"
              fill="transparent"
              legendType="none"
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="feeImpact"
              stackId="fee-impact-band"
              name="Cumulative fee impact"
              stroke="none"
              fill={chartColours.secondary}
              fillOpacity={0.16}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="withFees"
              name="With fees"
              stroke={chartColours.primary}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="withoutFees"
              name="Without fees"
              stroke={chartColours.secondary}
              strokeWidth={3}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}