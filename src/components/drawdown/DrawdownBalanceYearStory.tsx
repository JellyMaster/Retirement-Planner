import { useMemo } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface BalanceTimelineProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
  onSelectAge: (age: number) => void;
  statePensionAge?: number;
}

interface DrawdownBalanceYearStoryProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
}

interface BalanceMilestone {
  age: number;
  label: string;
  tone: "neutral" | "warning";
}

export function DrawdownBalanceAgeControl({
  years,
  inflationRate,
  displayMode,
  selectedAge,
  onSelectAge,
  statePensionAge,
}: BalanceTimelineProps) {
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );
  const selectedIndex = Math.max(
    0,
    displayYears.findIndex((year) => year.age === selectedAge),
  );
  const selected = displayYears[selectedIndex];

  if (!selected) return null;

  const firstPressureAge = displayYears.find(
    (year) => year.pensionWithdrawal + year.fees > year.investmentGrowth,
  )?.age;
  const firstDepletionAge = displayYears.find((year) => year.isDepleted)?.age;
  const firstSustainedDeclineAge = findFirstSustainedDeclineAge(displayYears);
  const effectiveStatePensionAge =
    statePensionAge ?? displayYears.find((year) => year.statePensionIncome > 0)?.age;
  const milestones = createBalanceMilestones({
    displayYears,
    statePensionAge: effectiveStatePensionAge,
    firstPressureAge,
    firstSustainedDeclineAge,
    firstDepletionAge,
  });

  return (
    <section
      className="drawdown-balance-timeline-control"
      aria-labelledby="drawdown-balance-timeline-title"
    >
      <div className="drawdown-balance-age-control">
        <div className="drawdown-balance-age-control-heading">
          <div>
            <strong id="drawdown-balance-timeline-title">Choose an age</strong>
            <span>Move through retirement or select a milestone to see what changed.</span>
          </div>
        </div>

        <div className="drawdown-balance-age-track-wrap">
          <div className="drawdown-balance-age-markers" aria-label="Pension balance milestones">
            {milestones.map((milestone) => {
              const index = displayYears.findIndex((year) => year.age === milestone.age);
              const position = displayYears.length <= 1
                ? 0
                : (index / (displayYears.length - 1)) * 100;

              return (
                <button
                  key={`${milestone.age}-${milestone.label}`}
                  type="button"
                  className={`drawdown-balance-age-marker is-${milestone.tone}`}
                  style={{ left: `${position}%` }}
                  title={`Age ${milestone.age}: ${milestone.label}`}
                  aria-label={`Age ${milestone.age}: ${milestone.label}`}
                  onClick={() => onSelectAge(milestone.age)}
                >
                  <span />
                </button>
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(displayYears.length - 1, 0)}
            step={1}
            value={selectedIndex}
            aria-label="Select retirement age for pension balance breakdown"
            onChange={(event) => {
              const year = displayYears[Number(event.target.value)];
              if (year) onSelectAge(year.age);
            }}
          />
        </div>

        <div className="drawdown-balance-age-labels">
          <span>Age {displayYears[0]?.age}</span>
          <strong>Age {selected.age}</strong>
          <span>Age {displayYears.at(-1)?.age}</span>
        </div>

        {milestones.length > 0 && (
          <div className="drawdown-balance-age-legend" aria-hidden="true">
            <span><i /> Milestone</span>
            <span><i className="is-warning" /> Needs attention</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function DrawdownBalanceYearStory({
  years,
  inflationRate,
  displayMode,
  selectedAge,
}: DrawdownBalanceYearStoryProps) {
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );
  const selectedIndex = Math.max(
    0,
    displayYears.findIndex((year) => year.age === selectedAge),
  );
  const selected = displayYears[selectedIndex];
  const next = displayYears[selectedIndex + 1];

  if (!selected) return null;

  const moneyOut = selected.pensionWithdrawal + selected.fees;
  const balanceChange = selected.closingBalance - selected.openingBalance;
  const growthCoversOutgoings = selected.investmentGrowth >= moneyOut;
  const firstPressureAge = displayYears.find(
    (year) => year.pensionWithdrawal + year.fees > year.investmentGrowth,
  )?.age;
  const firstDepletionAge = displayYears.find((year) => year.isDepleted)?.age;

  return (
    <section className="drawdown-balance-year-story" aria-labelledby="drawdown-balance-year-title">
      <div className="panel drawdown-balance-year-breakdown">
        <header className="drawdown-balance-year-heading">
          <div>
            <p className="panel-eyebrow">Why it changed</p>
            <h3 id="drawdown-balance-year-title">What does this year mean?</h3>
            <p>Age {selected.age} · {selected.year} · {displayMode === "today" ? "Today’s money" : "Future money"}</p>
          </div>
        </header>

        <div className={`drawdown-balance-explanation ${balanceChange < 0 ? "is-neutral" : "is-positive"}`}>
          <strong>{balanceChange >= 0 ? "Your pension finished the year higher" : "Your pension reduced this year"}</strong>
          <p>
            {growthCoversOutgoings
              ? `Investment growth of ${formatCurrency(selected.investmentGrowth)} was enough to cover ${formatCurrency(selected.pensionWithdrawal)} taken from the pension and ${formatCurrency(selected.fees)} in fees.`
              : `The ${formatCurrency(selected.pensionWithdrawal)} taken from your pension plus ${formatCurrency(selected.fees)} in fees was greater than the ${formatCurrency(selected.investmentGrowth)} gained through investment growth. A falling balance can be a normal part of using your pension in retirement.`}
          </p>
          <small>
            Overall change at age {selected.age}: {balanceChange >= 0 ? "+" : "−"}{formatCurrency(Math.abs(balanceChange))}
          </small>
        </div>
      </div>

      <aside className="panel drawdown-balance-year-context" aria-labelledby="drawdown-balance-year-context-title">
        <div className="panel-heading">
          <p className="panel-eyebrow">Worth knowing</p>
          <h3 id="drawdown-balance-year-context-title">What is happening around this year?</h3>
        </div>

        <div className="drawdown-balance-context-list">
          {selected.age === firstPressureAge && (
            <BalanceContext
              title="Growth no longer covers everything taken out"
              text="This is the first year when pension withdrawals and fees are greater than investment growth. That does not automatically mean the plan is off track, but it marks the point where the balance starts doing more of the work."
              tone="warning"
            />
          )}
          {selected.age === firstDepletionAge && (
            <BalanceContext
              title="Your private pension is fully used"
              text="From this point, the private pension can no longer provide further withdrawals. Any remaining retirement income comes from other sources included in the plan."
              tone="warning"
            />
          )}
          {selected.age !== firstPressureAge && selected.age !== firstDepletionAge && (
            <BalanceContext
              title="Your pension is following the projected path"
              text="There is no new balance milestone in this year. The important point is whether the balance is changing at a pace that still supports the rest of the plan."
              tone="positive"
            />
          )}
        </div>

        {next && (
          <div className="drawdown-balance-next-year">
            <span>What happens next?</span>
            <strong>
              {next.closingBalance > selected.closingBalance
                ? "The projected pension balance rises next year."
                : next.closingBalance < selected.closingBalance
                  ? "The projected pension balance reduces again next year."
                  : "The projected pension balance is broadly unchanged next year."}
            </strong>
            <p>
              At age {next.age}, the illustrated end-of-year balance is {formatCurrency(next.closingBalance)}.
            </p>
          </div>
        )}
      </aside>
    </section>
  );
}

function findFirstSustainedDeclineAge(
  years: ReturnType<typeof getDisplayYears>,
): number | undefined {
  const runLength = 3;

  for (let index = 0; index <= years.length - runLength; index += 1) {
    const run = years.slice(index, index + runLength);
    if (run.every((year) => year.closingBalance < year.openingBalance)) {
      return run[0]?.age;
    }
  }

  return undefined;
}

function createBalanceMilestones({
  displayYears,
  statePensionAge,
  firstPressureAge,
  firstSustainedDeclineAge,
  firstDepletionAge,
}: {
  displayYears: ReturnType<typeof getDisplayYears>;
  statePensionAge?: number;
  firstPressureAge?: number;
  firstSustainedDeclineAge?: number;
  firstDepletionAge?: number;
}): BalanceMilestone[] {
  const byAge = new Map<number, BalanceMilestone>();
  const availableAges = new Set(displayYears.map((year) => year.age));

  const add = (age: number | undefined, label: string, tone: BalanceMilestone["tone"]) => {
    if (age === undefined || !availableAges.has(age)) return;
    const existing = byAge.get(age);
    if (existing) {
      existing.label = `${existing.label}; ${label}`;
      if (tone === "warning") existing.tone = "warning";
      return;
    }
    byAge.set(age, { age, label, tone });
  };

  add(statePensionAge, "State Pension starts, which may reduce how much needs to come from your private pension", "neutral");
  add(firstSustainedDeclineAge, "The pension begins a sustained period of reducing year by year", "neutral");
  add(firstPressureAge, "Growth no longer covers pension withdrawals and fees", "warning");
  add(firstDepletionAge, "The private pension is fully used", "warning");

  return [...byAge.values()].sort((a, b) => a.age - b.age);
}

function BalanceContext({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "positive" | "warning";
}) {
  return (
    <article className={`drawdown-balance-context is-${tone}`}>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}
