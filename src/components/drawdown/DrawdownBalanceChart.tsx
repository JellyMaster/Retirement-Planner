import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DrawdownYear } from "../../engine/drawdown";
import { useChartTheme } from "../../theme/useChartTheme";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface DrawdownBalanceChartProps {
  years: DrawdownYear[];
  depletionAge: number | null;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

interface ChartDataPoint {
  age: number;
  openingBalance: number;
  closingBalance: number;
}

export function DrawdownBalanceChart({
  years,
  depletionAge,
  inflationRate,
  displayMode,
}: DrawdownBalanceChartProps) {
  const chartColours = useChartTheme();

  if (years.length === 0) {
    return null;
  }

  const displayYears = getDisplayYears(years, inflationRate, displayMode);
  const chartData: ChartDataPoint[] = displayYears.map((year) => ({
    age: year.age,
    openingBalance: year.openingBalance,
    closingBalance: year.closingBalance,
  }));

  return (
    <section className="panel drawdown-chart-panel">
      <div className="panel-heading">
        <h2>Pension balance through retirement</h2>
        <p>
          Track the opening and closing pension balance for each retirement
          year. Values are shown in {displayMode === "today" ? "today&apos;s money" : "future money"}.
        </p>
      </div>

      <div className="drawdown-chart">
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
                    Number.isFinite(numericValue) ? numericValue : 0,
                  ),
                  name,
                ];
              }}
              labelFormatter={(age) => `Age ${String(age)}`}
            />

            <Legend wrapperStyle={{ color: chartColours.text }} />

            {depletionAge !== null && (
              <ReferenceLine
                x={depletionAge}
                stroke={chartColours.fees}
                strokeDasharray="5 5"
                label={{
                  value: "Pot depleted",
                  position: "insideTopRight",
                  fill: chartColours.text,
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="openingBalance"
              name="Opening balance"
              stroke={chartColours.secondary}
              strokeWidth={3}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="closingBalance"
              name="Closing balance"
              stroke={chartColours.primary}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
