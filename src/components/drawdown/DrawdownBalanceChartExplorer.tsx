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
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { useChartTheme } from "../../theme/useChartTheme";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
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
}

export function DrawdownBalanceChartExplorer({
  inputs,
  result,
  displayMode,
  drawdown,
  onChange,
}: DrawdownBalanceChartExplorerProps) {
  const [view, setView] = useState<ChartView>("plan");

  return (
    <section className="drawdown-balance-chart-explorer">
      <div className="drawdown-chart-view-header">
        <div>
          <span>Balance chart view</span>
          <small>
            Switch between your saved plan and sustainable ending-balance paths.
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
        />
      ) : (
        <EndingBalanceComparisonChart
          inputs={inputs}
          displayMode={displayMode}
          drawdown={drawdown}
          onChange={onChange}
        />
      )}
    </section>
  );
}

function EndingBalanceComparisonChart({
  inputs,
  displayMode,
  drawdown,
  onChange,
}: Omit<DrawdownBalanceChartExplorerProps, "result">) {
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

  const preserveYears = getDisplayYears(
    paths.preserve.result.years,
    inputs.inflationRate,
    displayMode,
  );
  const reserveYears = getDisplayYears(
    paths.reserve.result.years,
    inputs.inflationRate,
    displayMode,
  );
  const spendYears = getDisplayYears(
    paths.spend.result.years,
    inputs.inflationRate,
    displayMode,
  );

  const chartData = preserveYears.map((year, index) => ({
    age: year.age,
    preserve: year.closingBalance,
    reserve: reserveYears[index]?.closingBalance ?? 0,
    spend: spendYears[index]?.closingBalance ?? 0,
  }));

  const displayedEndingBalances = {
    preserve: preserveYears.at(-1)?.closingBalance ?? 0,
    reserve: reserveYears.at(-1)?.closingBalance ?? 0,
    spend: spendYears.at(-1)?.closingBalance ?? 0,
  };

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
            Each line uses the highest modelled target income that still reaches
            its ending-balance goal at age {inputs.endAge}.
          </p>
          {inputs.withdrawalStrategy === "percentage" && (
            <p className="drawdown-ending-path-strategy-note">
              Your saved plan currently uses percentage drawdown. These comparison
              paths temporarily use target-income modelling so the three reserve
              choices can be compared on the same basis. Your saved withdrawal
              strategy is not changed.
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
          income={paths.preserve.income}
          endingBalance={displayedEndingBalances.preserve}
          onSelect={() => selectMode("preserve")}
        />
        <PathOption
          selected={selectedMode === "percentage"}
          label={`Reserve ${(reservePercentage * 100).toFixed(0)}%`}
          income={paths.reserve.income}
          endingBalance={displayedEndingBalances.reserve}
          onSelect={() => selectMode("percentage")}
        />
        <PathOption
          selected={selectedMode === "spend-to-zero"}
          label="Spend to £0"
          income={paths.spend.income}
          endingBalance={displayedEndingBalances.spend}
          onSelect={() => selectMode("spend-to-zero")}
        />
      </div>

      <p className="drawdown-ending-path-note">
        The highlighted path is the goal used by the sustainable-income, headroom
        and Retirement Living Standards figures on the Overview. The chart itself
        does not overwrite your saved retirement-income target.
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
  income,
  endingBalance,
  onSelect,
}: {
  selected: boolean;
  label: string;
  income: number;
  endingBalance: number;
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
      <strong>{formatCurrency(income)} / year</strong>
      <small>Ends with about {formatCurrency(endingBalance)}</small>
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
