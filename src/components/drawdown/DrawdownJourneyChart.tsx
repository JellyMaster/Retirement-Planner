import { useMemo, useState } from "react";
import {
  Bar,
  Brush,
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
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface DrawdownJourneyChartProps {
  years: DrawdownYear[];
  endAge: number;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  spendingPhases: DrawdownSpendingPhase[] | undefined;
  statePensionAge: number | undefined;
  depletionAge: number | null;
}

interface JourneyPoint {
  age: number;
  closingBalance: number;
  pensionWithdrawal: number | null;
  statePensionIncome: number | null;
  netIncome: number | null;
}

export function DrawdownJourneyChart({
  years,
  endAge,
  inflationRate,
  displayMode,
  spendingPhases,
  statePensionAge,
  depletionAge,
}: DrawdownJourneyChartProps) {
  const chartColours = useChartTheme();
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );
  const chartData: JourneyPoint[] = useMemo(() => {
    const annualPoints = displayYears.map((year) => ({
      age: year.age,
      closingBalance: year.closingBalance,
      pensionWithdrawal: year.pensionWithdrawal,
      statePensionIncome: year.statePensionIncome,
      netIncome: year.netIncome,
    }));
    const finalYear = displayYears.at(-1);

    if (!finalYear || finalYear.age >= endAge) return annualPoints;

    return [
      ...annualPoints,
      {
        age: endAge,
        closingBalance: finalYear.closingBalance,
        pensionWithdrawal: null,
        statePensionIncome: null,
        netIncome: null,
      },
    ];
  }, [displayYears, endAge]);
  const lastIndex = Math.max(0, chartData.length - 1);
  const [range, setRange] = useState({ startIndex: 0, endIndex: lastIndex });
  const chapters = spendingPhases ?? [];

  if (chartData.length === 0) return null;

  const visibleCount = range.endIndex - range.startIndex + 1;

  function setSafeRange(startIndex: number, endIndex: number) {
    const safeStart = Math.max(0, Math.min(startIndex, lastIndex));
    const safeEnd = Math.max(safeStart, Math.min(endIndex, lastIndex));
    setRange({ startIndex: safeStart, endIndex: safeEnd });
  }

  function zoomIn() {
    if (visibleCount <= 6) return;
    const reduction = Math.max(1, Math.floor(visibleCount * 0.2));
    const left = Math.floor(reduction / 2);
    const right = reduction - left;
    setSafeRange(range.startIndex + left, range.endIndex - right);
  }

  function zoomOut() {
    if (range.startIndex === 0 && range.endIndex === lastIndex) return;
    const expansion = Math.max(2, Math.ceil(visibleCount * 0.25));
    const left = Math.floor(expansion / 2);
    const right = expansion - left;
    setSafeRange(range.startIndex - left, range.endIndex + right);
  }

  function resetZoom() {
    setRange({ startIndex: 0, endIndex: lastIndex });
  }

  return (
    <section className="panel drawdown-journey-chart-panel" aria-labelledby="drawdown-journey-chart-title">
      <div className="panel-heading drawdown-journey-chart-heading">
        <div>
          <p className="panel-eyebrow">Retirement journey</p>
          <h2 id="drawdown-journey-chart-title">Your pension and income through retirement</h2>
          <p>
            Follow the pension you have left and see how private-pension withdrawals
            and State Pension combine to provide retirement income. Values are shown
            in {displayMode === "today" ? "today’s money" : "future money"}.
          </p>
        </div>
        <div className="drawdown-chart-zoom" role="group" aria-label="Retirement journey chart zoom">
          <button type="button" onClick={zoomIn} disabled={visibleCount <= 6}>Zoom in</button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={range.startIndex === 0 && range.endIndex === lastIndex}
          >
            Zoom out
          </button>
          <button
            type="button"
            onClick={resetZoom}
            disabled={range.startIndex === 0 && range.endIndex === lastIndex}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="drawdown-journey-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 28, right: 18, bottom: 10, left: 8 }}
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
              yAxisId="balance"
              tickLine={false}
              tick={{ fill: chartColours.text }}
              axisLine={false}
              width={76}
              tickFormatter={formatCompactCurrency}
            />
            <YAxis
              yAxisId="income"
              orientation="right"
              tickLine={false}
              tick={{ fill: chartColours.text }}
              axisLine={false}
              width={70}
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
              formatter={(value, name) => [formatCurrency(Number(value ?? 0)), name]}
              labelFormatter={(age) => `Age ${String(age)}`}
            />
            <Legend wrapperStyle={{ color: chartColours.text }} />

            {statePensionAge !== undefined && (
              <ReferenceLine
                x={statePensionAge}
                stroke={chartColours.tertiary}
                strokeDasharray="4 4"
                label={{
                  value: "State Pension starts",
                  position: "insideTopRight",
                  fill: chartColours.text,
                }}
              />
            )}
            {chapters.slice(1).map((phase) => (
              <ReferenceLine
                key={`${phase.label}-${phase.startAge}`}
                x={phase.startAge}
                stroke={chartColours.secondary}
                strokeDasharray="3 5"
                label={{
                  value: phase.label,
                  position: "insideTopLeft",
                  fill: chartColours.text,
                }}
              />
            ))}
            {depletionAge !== null && (
              <ReferenceLine
                x={depletionAge}
                stroke={chartColours.fees}
                strokeDasharray="5 5"
                label={{
                  value: "Pension depleted",
                  position: "insideTopRight",
                  fill: chartColours.text,
                }}
              />
            )}
            <ReferenceLine
              x={endAge}
              yAxisId="balance"
              stroke={chartColours.grid}
              strokeDasharray="2 5"
              label={{
                value: "Plan age",
                position: "insideTopRight",
                fill: chartColours.text,
              }}
            />

            <Bar
              yAxisId="income"
              dataKey="pensionWithdrawal"
              name="Private pension"
              stackId="retirement-income"
              fill={chartColours.secondary}
              opacity={0.72}
            />
            <Bar
              yAxisId="income"
              dataKey="statePensionIncome"
              name="State Pension"
              stackId="retirement-income"
              fill={chartColours.tertiary}
              opacity={0.82}
            />
            <Line
              yAxisId="balance"
              type="monotone"
              dataKey="closingBalance"
              name="Pension balance"
              stroke={chartColours.primary}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="income"
              type="monotone"
              dataKey="netIncome"
              name="Net income"
              stroke={chartColours.text}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
            <Brush
              dataKey="age"
              height={28}
              travellerWidth={10}
              startIndex={range.startIndex}
              endIndex={range.endIndex}
              stroke={chartColours.primary}
              onChange={(next) => {
                if (next.startIndex === undefined || next.endIndex === undefined) return;
                setRange({ startIndex: next.startIndex, endIndex: next.endIndex });
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
