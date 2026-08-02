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
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
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
  spendingPhases: DrawdownSpendingPhase[] | undefined;
  statePensionAge: number | undefined;
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
  spendingPhases,
  statePensionAge,
}: DrawdownBalanceChartProps) {
  const chartColours = useChartTheme();

  if (years.length === 0) return null;

  const chapters = spendingPhases ?? [];
  const displayYears = getDisplayYears(years, inflationRate, displayMode);
  const chartData: ChartDataPoint[] = displayYears.map((year) => ({
    age: year.age,
    openingBalance: year.openingBalance,
    closingBalance: year.closingBalance,
  }));

  return (
    <section className="panel drawdown-chart-panel">
      <div className="panel-heading">
        <h2>Your pension through retirement</h2>
        <p>
          Track the pension left at the start and end of each year, with key
          retirement chapter changes marked on the chart. Values are shown in {displayMode === "today" ? "today&apos;s money" : "future money"}.
        </p>
      </div>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 28, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={chartColours.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="age" tickLine={false} tick={{ fill: chartColours.text }} axisLine={false} label={{ value: "Age", position: "insideBottom", offset: -5, fill: chartColours.text }} />
            <YAxis tickLine={false} tick={{ fill: chartColours.text }} axisLine={false} width={85} tickFormatter={formatCompactCurrency} />
            <Tooltip
              cursor={{ stroke: chartColours.cursor }}
              contentStyle={{ backgroundColor: chartColours.tooltipBackground, border: `1px solid ${chartColours.tooltipBorder}`, borderRadius: "0.5rem", color: chartColours.tooltipText }}
              labelStyle={{ color: chartColours.tooltipText }}
              itemStyle={{ color: chartColours.tooltipText }}
              formatter={(value, name) => {
                const rawValue = Array.isArray(value) ? value[0] : value;
                const numericValue = Number(rawValue ?? 0);
                return [formatCurrency(Number.isFinite(numericValue) ? numericValue : 0), name];
              }}
              labelFormatter={(age) => `Age ${String(age)}`}
            />
            <Legend wrapperStyle={{ color: chartColours.text }} />

            {statePensionAge !== undefined && (
              <ReferenceLine x={statePensionAge} stroke={chartColours.tertiary} strokeDasharray="4 4" label={{ value: "State Pension", position: "insideTopRight", fill: chartColours.text }} />
            )}
            {chapters.slice(1).map((phase) => (
              <ReferenceLine key={`${phase.label}-${phase.startAge}`} x={phase.startAge} stroke={chartColours.secondary} strokeDasharray="3 5" label={{ value: phase.label, position: "insideTopLeft", fill: chartColours.text }} />
            ))}
            {depletionAge !== null && (
              <ReferenceLine x={depletionAge} stroke={chartColours.fees} strokeDasharray="5 5" label={{ value: "Private pension runs out", position: "insideTopRight", fill: chartColours.text }} />
            )}

            <Line type="monotone" dataKey="openingBalance" name="Pension at start of year" stroke={chartColours.secondary} strokeWidth={3} strokeDasharray="6 5" dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="closingBalance" name="Pension at end of year" stroke={chartColours.primary} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
