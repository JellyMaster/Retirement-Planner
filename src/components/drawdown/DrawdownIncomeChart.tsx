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
  selectedAge?: number;
  onSelectAge?: (age: number) => void;
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
  selectedAge,
  onSelectAge,
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
        <h2>How your retirement income changes</h2>
        <p>
          Follow where your income comes from, how much tax is estimated and how much money is available to spend through retirement.
          {onSelectAge ? " Select any age on the chart to understand that year in more detail." : ""}
          {` Values are shown in ${displayMode === "today" ? "today's money" : "future money"}.`}
        </p>
      </div>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 28, right: 20, bottom: 10, left: 10 }}
            onClick={(event) => {
              if (!onSelectAge || event?.activeLabel === undefined) return;
              const age = Number(event.activeLabel);
              if (Number.isFinite(age)) onSelectAge(age);
            }}
          >
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

            {selectedAge !== undefined && (
              <ReferenceLine
                x={selectedAge}
                stroke={chartColours.primary}
                strokeWidth={2}
                label={{ value: `Age ${selectedAge}`, position: "insideTopLeft", fill: chartColours.text }}
              />
            )}
            {statePensionAge !== undefined && statePensionAge !== selectedAge && (
              <ReferenceLine x={statePensionAge} stroke={chartColours.tertiary} strokeDasharray="4 4" label={{ value: "State Pension starts", position: "insideTopRight", fill: chartColours.text }} />
            )}
            {chapters.slice(1).map((phase) => (
              <ReferenceLine key={`${phase.label}-${phase.startAge}`} x={phase.startAge} stroke={chartColours.secondary} strokeDasharray="3 5" label={{ value: phase.label, position: "insideTopLeft", fill: chartColours.text }} />
            ))}

            <Bar dataKey="statePensionIncome" name="State Pension" stackId="gross-income" fill={chartColours.tertiary} />
            <Bar dataKey="pensionWithdrawal" name="Money from your pension" stackId="gross-income" fill={chartColours.primary} />
            <Line type="monotone" dataKey="netIncome" name="Money available to spend" stroke={chartColours.secondary} strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="incomeTax" name="Estimated tax" stroke={chartColours.fees} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="desiredIncome" name="Your planned income" stroke={chartColours.text} strokeDasharray="6 4" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
