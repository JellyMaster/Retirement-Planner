import { useMemo, useState } from "react";
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

import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import { createEndingBalancePaths } from "../../engine/drawdown/createEndingBalancePaths";
import type { EndingBalancePath } from "../../engine/drawdown/createEndingBalancePaths";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { useChartTheme } from "../../theme/useChartTheme";
import type { MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";
import { PercentageInput } from "../forms";
import { DrawdownBalanceChart } from "./DrawdownBalanceChart";

type ChartView = "plan" | "ending-balance";
type EndingBalanceMode = NonNullable<
  ScenarioDrawdownPreferences["endingBalanceMode"]
>;

interface DrawdownBalanceChartExplorerProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
  drawdown?: ScenarioDrawdownPreferences;
  onChange: (drawdown: ScenarioDrawdownPreferences) => void;
  selectedAge?: number;
  onSelectAge?: (age: number) => void;
}

export function DrawdownBalanceChartExplorer({
  inputs,
  result,
  displayMode,
  drawdown,
  onChange,
  selectedAge,
  onSelectAge,
}: DrawdownBalanceChartExplorerProps) {
  const [view, setView] = useState<ChartView>("plan");

  return (
    <section className="drawdown-balance-chart-explorer">
      <div className="drawdown-chart-view-header">
        <div>
          <span>Balance chart view</span>
          <small>
            Start with your saved plan. Ending-balance options are available when you want to compare different amounts left in the pension.
          </small>
        </div>
        <div
          className="drawdown-chart-view-toggle"
          role="group"
          aria-label="Balance chart view"
        >
          <button
            type="button"
            className={view === "plan" ? "is-active" : undefined}
            aria-pressed={view === "plan"}
            onClick={() => setView("plan")}
          >
            Your plan
          </button>
          <button
            type="button"
            className={view === "ending-balance" ? "is-active" : undefined}
            aria-pressed={view === "ending-balance"}
            onClick={() => setView("ending-balance")}
          >
            Ending balance options
          </button>
        </div>
      </div>

      {view === "plan" ? (
        <DrawdownBalanceChart
          years={result.years}
          depletionAge={result.depletionAge}
          inflationRate={inputs.inflationRate}
          displayMode={displayMode}
          spendingPhases={inputs.spendingPhases}
          statePensionAge={
            inputs.annualStatePension > 0 ? inputs.statePensionAge : undefined
          }
          selectedAge={selectedAge}
          onSelectAge={onSelectAge}
        />
      ) : (
        <EndingBalanceComparisonChart
          inputs={inputs}
          drawdown={drawdown}
          onChange={onChange}
        />
      )}
    </section>
  );
}

function EndingBalanceComparisonChart({
  inputs,
  drawdown,
  onChange,
}: Omit<DrawdownBalanceChartExplorerProps, "result" | "displayMode" | "selectedAge" | "onSelectAge">) {
  const chartColours = useChartTheme();
  const preferences = drawdown ?? createFallbackPreferences(inputs);
  const selectedMode = preferences.endingBalanceMode ?? "preserve";
  const savedPercentage = preferences.endingBalancePercentage ?? 0.5;
  const reservePercentage =
    savedPercentage > 0 && savedPercentage < 1 ? savedPercentage : 0.5;

  const paths = useMemo(
    () => createEndingBalancePaths(inputs, reservePercentage),
    [inputs, reservePercentage],
  );

  const chartData = paths.preserve.result.years.map((year, index) => ({
    age: year.age,
    preserve: year.closingBalance,
    reserve: paths.reserve.result.years[index]?.closingBalance ?? 0,
    spend: paths.spend.result.years[index]?.closingBalance ?? 0,
  }));

  function selectMode(mode: EndingBalanceMode) {
    onChange({
      ...preferences,
      endingBalanceMode: mode,
      endingBalancePercentage: reservePercentage,
    });
  }

  function changeReserve(value: number) {
    onChange({
      ...preferences,
      endingBalanceMode: "percentage",
      endingBalancePercentage: Math.min(0.99, Math.max(0.01, value)),
    });
  }

  return (
    <section className="panel drawdown-ending-path-chart">
      <div className="panel-heading drawdown-ending-path-heading">
        <div>
          <p className="panel-eyebrow">Ending balance paths</p>
          <h2>See the income-versus-reserve trade-off</h2>
          <p>
            The retirement pot is the anchor. Each path solves for a sustainable
            spending target, while the actual amount taken from the private pension
            can vary by year as State Pension and tax change.
          </p>
          {inputs.withdrawalStrategy === "percentage" && (
            <p className="drawdown-ending-path-strategy-note">
              Your saved plan currently uses percentage drawdown. These paths are
              comparison illustrations only and use target-income modelling to
              solve the annual spending available for each reserve target. Your
              saved withdrawal strategy is not changed.
            </p>
          )}
        </div>
        <label
          className="drawdown-reserve-control"
          htmlFor="drawdown-reserve-percentage"
        >
          <span>Pot reserve at age {inputs.endAge}</span>
          <small>Adjust the middle path.</small>
          <PercentageInput
            id="drawdown-reserve-percentage"
            value={reservePercentage}
            min={1}
            max={99}
            step={5}
            onValueChange={(value) => changeReserve(value ?? 0.5)}
          />
        </label>
      </div>

      <div
        className="drawdown-ending-path-options"
        role="radiogroup"
        aria-label="Active ending balance goal"
      >
        <PathOption
          selected={selectedMode === "preserve"}
          label="Preserve 100%"
          path={paths.preserve}
          onSelect={() => selectMode("preserve")}
        />
        <PathOption
          selected={selectedMode === "percentage"}
          label={`Reserve ${(reservePercentage * 100).toFixed(0)}%`}
          path={paths.reserve}
          onSelect={() => selectMode("percentage")}
        />
        <PathOption
          selected={selectedMode === "spend-to-zero"}
          label="Spend to £0"
          path={paths.spend}
          onSelect={() => selectMode("spend-to-zero")}
        />
      </div>

      <p className="drawdown-ending-path-note">
        Average, highest and lowest drawdown figures refer to withdrawals from the
        private pension only. State Pension is modelled separately, which is why
        private-pension withdrawals can fall after State Pension starts.
      </p>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
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
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                name,
              ]}
              labelFormatter={(age) => `Age ${String(age)}`}
            />
            <Legend wrapperStyle={{ color: chartColours.text }} />
            <Line
              type="monotone"
              dataKey="preserve"
              name="Preserve 100%"
              stroke={chartColours.secondary}
              strokeWidth={selectedMode === "preserve" ? 4 : 2}
              strokeDasharray={selectedMode === "preserve" ? undefined : "6 5"}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="reserve"
              name={`Reserve ${(reservePercentage * 100).toFixed(0)}%`}
              stroke={chartColours.primary}
              strokeWidth={selectedMode === "percentage" ? 4 : 2}
              strokeDasharray={selectedMode === "percentage" ? undefined : "6 5"}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="spend"
              name="Spend to £0"
              stroke={chartColours.tertiary}
              strokeWidth={selectedMode === "spend-to-zero" ? 4 : 2}
              strokeDasharray={selectedMode === "spend-to-zero" ? undefined : "6 5"}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PathOption({
  selected,
  label,
  path,
  onSelect,
}: {
  selected: boolean;
  label: string;
  path: EndingBalancePath;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={
        selected
          ? "drawdown-ending-path-option is-selected"
          : "drawdown-ending-path-option"
      }
      onClick={onSelect}
    >
      <span>{label}</span>
      <span className="drawdown-ending-path-metric-label">
        Average private-pension drawdown
      </span>
      <strong>
        {formatCurrency(path.withdrawals.averageAnnualWithdrawal)} / year
      </strong>
      <small>
        Spending target {formatCurrency(path.income)} / year
      </small>
      <div className="drawdown-ending-path-range">
        <div>
          <span>Highest drawdown</span>
          <strong>{formatCurrency(path.withdrawals.highestWithdrawal.amount)}</strong>
          <small>Age {path.withdrawals.highestWithdrawal.age}</small>
        </div>
        <div>
          <span>Lowest drawdown</span>
          <strong>{formatCurrency(path.withdrawals.lowestWithdrawal.amount)}</strong>
          <small>Age {path.withdrawals.lowestWithdrawal.age}</small>
        </div>
      </div>
      <small>Target reserve {formatCurrency(path.targetEndingBalance)}</small>
      <small>Modelled end {formatCurrency(path.result.finalBalance)}</small>
    </button>
  );
}

function createFallbackPreferences(
  inputs: DrawdownInputs,
): ScenarioDrawdownPreferences {
  return {
    planningAge: inputs.endAge,
    withdrawalStrategy: inputs.withdrawalStrategy,
    withdrawalRate: inputs.withdrawalRate,
    desiredAnnualIncome: inputs.desiredAnnualIncome,
    incomeTargetMode: inputs.incomeTargetMode,
    taxFreeCash: inputs.taxFreeCash,
    endingBalanceMode: "preserve",
    endingBalancePercentage: 0.5,
  };
}
