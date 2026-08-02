import { useMemo, useState } from "react";
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

import {
  calculateSequenceReturns,
  type SequenceReturnsJourney,
} from "../../engine/education/calculateSequenceReturns";
import { useChartTheme } from "../../theme/useChartTheme";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
} from "../../utils/formatters";

interface SequenceReturnsLessonProps {
  startingBalance: number;
  annualWithdrawal: number;
  retirementAge: number;
  durationYears: number;
  normalReturn: number;
}

export function SequenceReturnsLesson({
  startingBalance,
  annualWithdrawal,
  retirementAge,
  durationYears,
  normalReturn,
}: SequenceReturnsLessonProps) {
  const defaults = useMemo(
    () => ({
      startingBalance: Math.max(100_000, Math.min(2_000_000, Math.round(startingBalance))),
      annualWithdrawal: Math.max(0, Math.min(100_000, Math.round(annualWithdrawal))),
      durationYears: Math.max(10, Math.min(45, Math.round(durationYears))),
      shockPercentage: 0.25,
    }),
    [annualWithdrawal, durationYears, startingBalance],
  );
  const [balance, setBalance] = useState(defaults.startingBalance);
  const [withdrawal, setWithdrawal] = useState(defaults.annualWithdrawal);
  const [years, setYears] = useState(defaults.durationYears);
  const [shock, setShock] = useState(defaults.shockPercentage);
  const chartColours = useChartTheme();

  const comparison = useMemo(
    () =>
      calculateSequenceReturns({
        startingBalance: balance,
        annualWithdrawal: withdrawal,
        retirementAge,
        durationYears: years,
        shockPercentage: shock,
        normalReturn,
      }),
    [balance, normalReturn, retirementAge, shock, withdrawal, years],
  );

  const middleIndex = Math.floor((years - 1) / 2);
  const middleAge = retirementAge + middleIndex;
  const lateAge = retirementAge + years - 1;
  const chartData = comparison.earlyLoss.years.map((earlyYear, index) => ({
    age: earlyYear.age,
    earlyLossBalance: earlyYear.closingBalance,
    midLossBalance: comparison.midLoss.years[index]?.closingBalance ?? 0,
    lateLossBalance: comparison.lateLoss.years[index]?.closingBalance ?? 0,
  }));
  const difference = comparison.endingBalanceDifference;
  const averageReturn = comparison.earlyLoss.arithmeticAverageReturn;

  function reset() {
    setBalance(defaults.startingBalance);
    setWithdrawal(defaults.annualWithdrawal);
    setYears(defaults.durationYears);
    setShock(defaults.shockPercentage);
  }

  return (
    <section className="sequence-returns-lesson" aria-labelledby="sequence-returns-title">
      <header className="sequence-returns-heading">
        <div>
          <p className="planner-eyebrow">Interactive lesson</p>
          <h2 id="sequence-returns-title">Same returns. Different retirement outcome.</h2>
          <p>
            All three journeys use exactly the same annual returns. Only the year
            of the market fall changes, showing how early, middle and late losses
            interact differently with ongoing pension withdrawals.
          </p>
        </div>
        <span className="sequence-returns-average">
          <small>Shared average return</small>
          <strong>{formatPercentage(averageReturn)}</strong>
        </span>
      </header>

      <div className="sequence-returns-controls" aria-label="Sequence of returns controls">
        <RangeControl
          label="Starting pension"
          value={balance}
          min={100_000}
          max={2_000_000}
          step={25_000}
          valueText={formatCurrency(balance)}
          onChange={setBalance}
        />
        <RangeControl
          label="Annual pension income"
          value={withdrawal}
          min={0}
          max={100_000}
          step={1_000}
          valueText={`${formatCurrency(withdrawal)}/year`}
          onChange={setWithdrawal}
        />
        <RangeControl
          label="Retirement length"
          value={years}
          min={10}
          max={45}
          step={1}
          valueText={`${years} years`}
          onChange={setYears}
        />
        <RangeControl
          label="One-year market fall"
          value={Math.round(shock * 100)}
          min={10}
          max={50}
          step={5}
          valueText={`${Math.round(shock * 100)}% fall`}
          onChange={(value) => setShock(value / 100)}
        />
        <button type="button" className="secondary-button" onClick={reset}>
          Reset to my plan
        </button>
      </div>

      <div className="sequence-returns-outcomes">
        <JourneyCard
          journeyLabel="Journey A"
          title="Early market loss"
          subtitle={`The ${Math.round(shock * 100)}% fall happens at age ${retirementAge}.`}
          journey={comparison.earlyLoss}
          tone="warning"
        />
        <JourneyCard
          journeyLabel="Journey B"
          title="Mid-retirement market loss"
          subtitle={`The same fall happens halfway through retirement at age ${middleAge}.`}
          journey={comparison.midLoss}
          tone="neutral"
        />
        <JourneyCard
          journeyLabel="Journey C"
          title="Late market loss"
          subtitle={`The same fall happens at age ${lateAge}.`}
          journey={comparison.lateLoss}
          tone="positive"
        />
      </div>

      <section className="sequence-returns-chart-panel" aria-labelledby="sequence-chart-title">
        <div>
          <p className="planner-eyebrow">Balance comparison</p>
          <h3 id="sequence-chart-title">Watch the three journeys separate</h3>
          <p>
            The return values, average and compounded return are identical. The
            midpoint journey shows how the effect usually sits between an early
            shock and one that arrives near the end of the plan.
          </p>
        </div>
        <div className="sequence-returns-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 24, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={chartColours.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fill: chartColours.text }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={82}
                tick={{ fill: chartColours.text }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColours.tooltipBackground,
                  border: `1px solid ${chartColours.tooltipBorder}`,
                  borderRadius: "0.5rem",
                  color: chartColours.tooltipText,
                }}
                formatter={(value, name) => {
                  const rawValue = Array.isArray(value) ? value[0] : value;
                  return [formatCurrency(Number(rawValue ?? 0)), name];
                }}
                labelFormatter={(age) => `Age ${String(age)}`}
              />
              <Legend />
              <ReferenceLine
                x={retirementAge}
                stroke={chartColours.fees}
                strokeDasharray="4 4"
                label={{ value: "Early fall", fill: chartColours.text, position: "insideTopLeft" }}
              />
              <ReferenceLine
                x={middleAge}
                stroke={chartColours.secondary}
                strokeDasharray="4 4"
                label={{ value: "Mid fall", fill: chartColours.text, position: "insideTop" }}
              />
              <ReferenceLine
                x={lateAge}
                stroke={chartColours.tertiary}
                strokeDasharray="4 4"
                label={{ value: "Late fall", fill: chartColours.text, position: "insideTopRight" }}
              />
              <Line
                type="monotone"
                dataKey="earlyLossBalance"
                name="Early market loss"
                stroke={chartColours.fees}
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="midLossBalance"
                name="Mid-retirement loss"
                stroke={chartColours.secondary}
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lateLossBalance"
                name="Late market loss"
                stroke={chartColours.primary}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="sequence-returns-explanation">
        <div>
          <p className="planner-eyebrow">Why this happened</p>
          <h3>Withdrawals turn temporary losses into a lasting difference</h3>
          <p>
            After an early fall, the same cash withdrawal represents a larger
            share of the remaining pension. A fall in the middle has less time to
            recover than an early shock, but it also happens after fewer years of
            withdrawals than a late shock. This places its outcome between the two
            extremes in typical examples.
          </p>
        </div>
        <div className="sequence-returns-difference">
          <small>Range caused by return timing</small>
          <strong>{formatCurrency(Math.abs(difference))}</strong>
          <span>
            {difference > 0
              ? "between the early-loss and late-loss outcomes"
              : difference < 0
                ? "between the late-loss and early-loss outcomes"
                : "all three journeys finish at the same value"}
          </span>
        </div>
      </div>

      <section className="sequence-returns-suggestions" aria-labelledby="sequence-suggestions-title">
        <div>
          <p className="planner-eyebrow">Try changing</p>
          <h3 id="sequence-suggestions-title">See what can reduce the pressure</h3>
        </div>
        <div>
          <button type="button" onClick={() => setWithdrawal(Math.max(0, withdrawal - 5_000))}>
            Spend £5,000 less
          </button>
          <button type="button" onClick={() => setBalance(Math.min(2_000_000, balance + 50_000))}>
            Start with £50,000 more
          </button>
          <button type="button" onClick={() => setShock(Math.max(0.1, shock - 0.05))}>
            Reduce the fall by 5 points
          </button>
          <button type="button" onClick={() => setYears(Math.max(10, years - 5))}>
            Model five fewer years
          </button>
        </div>
      </section>

      <p className="sequence-returns-note">
        Educational illustration only. It ignores tax, inflation, fees and State
        Pension so the effect of return order remains easy to isolate.
      </p>
    </section>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  valueText,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="sequence-range-control">
      <span><small>{label}</small><strong>{valueText}</strong></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function JourneyCard({
  journeyLabel,
  title,
  subtitle,
  journey,
  tone,
}: {
  journeyLabel: string;
  title: string;
  subtitle: string;
  journey: SequenceReturnsJourney;
  tone: "warning" | "neutral" | "positive";
}) {
  return (
    <article className={`sequence-journey-card is-${tone}`}>
      <div>
        <small>{journeyLabel}</small>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <dl>
        <div><dt>Ending pension</dt><dd>{formatCurrency(journey.endingBalance)}</dd></div>
        <div><dt>Lowest pension</dt><dd>{formatCurrency(journey.lowestBalance)}</dd></div>
        <div><dt>Private pension runs out</dt><dd>{journey.depletionAge === null ? "No" : `Age ${journey.depletionAge}`}</dd></div>
        <div><dt>Compounded return</dt><dd>{formatPercentage(journey.compoundedReturn)}</dd></div>
      </dl>
    </article>
  );
}
