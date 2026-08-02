import {
  Bar,
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

import type { DrawdownYear } from "../../engine/drawdown";
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
import { useChartTheme } from "../../theme/useChartTheme";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface DrawdownIncomeChartProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  spendingPhases: DrawdownSpendingPhase[] | undefined;
  statePensionAge: number | undefined;
}

interface ChartDataPoint {
  age: number;
  statePensionIncome: number;
  pensionWithdrawal: number;
  incomeTax: number;
  netIncome: number;
  desiredIncome: number;
}

export function DrawdownIncomeChart({
  years,
  inflationRate,
  displayMode,
  spendingPhases,
  statePensionAge,
}: DrawdownIncomeChartProps) {
  const chartColours = useChartTheme();

  if (years.length === 0) return null;

  const chapters = spendingPhases ?? [];
  const displayYears = getDisplayYears(years, inflationRate, displayMode);
  const chartData: ChartDataPoint[] = displayYears.map((year) => ({
    age: year.age,
    statePensionIncome: year.statePensionIncome,
    pensionWithdrawal: year.pensionWithdrawal,
    incomeTax: year.incomeTax,
    netIncome: year.netIncome,
    desiredIncome: year.desiredIncome,
  }));

  return (
    <section className="panel drawdown-chart-panel">
      <div className="panel-heading">
        <h2>Income through retirement</h2>
        <p>
          See how income from your pension, State Pension and tax change through
          each retirement chapter. Values are shown in {displayMode === "today" ? "today&apos;s money" : "future money"}.
        </p>
      </div>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 28, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={chartColours.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="age" tickLine={false} tick={{ fill: chartColours.text }} axisLine={false} label={{ value: "Age", position: "insideBottom", offset: -5, fill: chartColours.text }} />
            <YAxis tickLine={false} tick={{ fill: chartColours.text }} axisLine={false} width={85} tickFormatter={formatCompactCurrency} />
            <Tooltip
              cursor={{ fill: chartColours.cursor }}
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

            <Bar dataKey="statePensionIncome" name="State Pension" stackId="gross-income" fill={chartColours.tertiary} />
            <Bar dataKey="pensionWithdrawal" name="Income from your pension" stackId="gross-income" fill={chartColours.primary} />
            <Line type="monotone" dataKey="netIncome" name="Net income" stroke={chartColours.secondary} strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="incomeTax" name="Income tax" stroke={chartColours.fees} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="desiredIncome" name={years[0]?.incomeTargetMode === "net" ? "Net target" : "Gross target"} stroke={chartColours.text} strokeDasharray="6 4" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
