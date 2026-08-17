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
import { DrawdownEngine } from "../../engine/drawdown/DrawdownEngine";
import { calculateSustainableTargetIncome } from "../../engine/drawdown/calculateSustainableTargetIncome";
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

const drawdownEngine = new DrawdownEngine();

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
      <div className="drawdown-chart-view-toggle" role="group" aria-label="Balance chart view">
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
  const reservePercentage = preferences.endingBalancePercentage ?? 0.5;

  const paths = useMemo(() => {
    const preserve = createPath(inputs, { mode: "preserve", percentage: 1 });
    const reserve = createPath(inputs, {
      mode: "percentage",
      percentage: reservePercentage,
    });
    const spend = createPath(inputs, { mode: "spend-to-zero", percentage: 0 });

    return { preserve, reserve, spend };
  }, [inputs, reservePercentage]);

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

  function selectMode(mode: EndingBalanceMode) {
    onChange({
      ...preferences,
      endingBalanceMode: mode,
      endingBalancePercentage:
        mode === "preserve"
          ? 1
          : mode === "spend-to-zero"
            ? 0
            : reservePercentage > 0 && reservePercentage < 1
              ? reservePercentage
              : 0.5,
    });
  }

  function changeReserve(value: number) {
    onChange({
      ...preferences,
      endingBalanceMode: "percentage",
      endingBalancePercentage: Math.min(1, Math.max(0, value)),
    });
  }

  return (
    <section className="panel drawdown-ending-path-chart">
      <div className="panel-heading drawdown-ending-path-heading">
        <div>
          <p className="panel-eyebrow">Ending balance options</p>
          <h2>Compare how much pension you could keep</h2>
          <p>
            Each line shows the pension balance if income is set at the maximum
            modelled sustainable level for that ending-balance goal.
          </p>
        </div>
        <label className="drawdown-reserve-control" htmlFor="drawdown-reserve-percentage">
          <span>Pot reserve at age {inputs.endAge}</span>
          <PercentageInput
            id="drawdown-reserve-percentage"
            value={reservePercentage}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) => changeReserve(value ?? 0)}
          />
        </label>
      </div>

      <div className="drawdown-ending-path-options" role="radiogroup" aria-label="Active ending balance goal">
        <PathOption
          selected={selectedMode === "preserve"}
          label="Preserve 100%"
          income={paths.preserve.income}
          endingBalance={paths.preserve.result.finalBalance}
          onSelect={() => selectMode("preserve")}
        />
        <PathOption
          selected={selectedMode === "percentage"}
          label={`Reserve ${(reservePercentage * 100).toFixed(0)}%`}
          income={paths.reserve.income}
          endingBalance={paths.reserve.result.finalBalance}
          onSelect={() => selectMode("percentage")}
        />
        <PathOption
          selected={selectedMode === "spend-to-zero"}
          label="Spend to £0"
          income={paths.spend.income}
          endingBalance={paths.spend.result.finalBalance}
          onSelect={() => selectMode("spend-to-zero")}
        />
      </div>

      <p className="drawdown-ending-path-note">
        Selecting a path sets the ending-balance goal used by the sustainable-income,
        headroom and Retirement Living Standards figures on the Overview.
      </p>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={chartColours.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="age"
              tickLine={false}
              tick={{ fill: chartColours.text }}
              axisLine={false}
              label={{ value: "Age", position: "insideBottom", offset: -5, fill: chartColours.text }}
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
      className={selected ? "drawdown-ending-path-option is-selected" : "drawdown-ending-path-option"}
      onClick={onSelect}
    >
      <span>{label}</span>
      <strong>{formatCurrency(income)} / year</strong>
      <small>Ends with about {formatCurrency(endingBalance)}</small>
    </button>
  );
}

function createPath(
  inputs: DrawdownInputs,
  goal: { mode: EndingBalanceMode; percentage: number },
) {
  const income = calculateSustainableTargetIncome(inputs, {
    endingBalanceGoal: goal,
  });
  const candidateInputs = applyIncomeBaseline(inputs, income);
  return {
    income,
    result: drawdownEngine.calculate(candidateInputs),
  };
}

function applyIncomeBaseline(inputs: DrawdownInputs, annualIncome: number): DrawdownInputs {
  const baseline = inputs.desiredAnnualIncome;
  const spendingPhases = inputs.spendingPhases?.map((phase, index) => ({
    ...phase,
    annualIncome:
      baseline > 0
        ? phase.annualIncome * (annualIncome / baseline)
        : index === 0
          ? annualIncome
          : phase.annualIncome,
  }));

  return {
    ...inputs,
    desiredAnnualIncome: annualIncome,
    ...(spendingPhases ? { spendingPhases } : {}),
  };
}

function createFallbackPreferences(inputs: DrawdownInputs): ScenarioDrawdownPreferences {
  return {
    planningAge: inputs.endAge,
    withdrawalStrategy: inputs.withdrawalStrategy,
    withdrawalRate: inputs.withdrawalRate,
    desiredAnnualIncome: inputs.desiredAnnualIncome,
    incomeTargetMode: inputs.incomeTargetMode,
    taxFreeCash: inputs.taxFreeCash,
    endingBalanceMode: "preserve",
    endingBalancePercentage: 1,
  };
}
