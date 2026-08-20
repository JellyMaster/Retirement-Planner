import { useMemo } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownIncomeYearStoryProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
  onSelectAge: (age: number) => void;
  statePensionAge?: number;
  spendingPhases?: DrawdownSpendingPhase[];
}

export function DrawdownIncomeYearStory({
  years,
  inflationRate,
  displayMode,
  selectedAge,
  onSelectAge,
  statePensionAge,
  spendingPhases,
}: DrawdownIncomeYearStoryProps) {
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );
  const selectedIndex = Math.max(
    0,
    displayYears.findIndex((year) => year.age === selectedAge),
  );
  const selectedYear = displayYears[selectedIndex] ?? displayYears[0];

  if (!selectedYear) return null;

  const originalIndex = years.findIndex((year) => year.age === selectedYear.age);
  const originalYear = years[originalIndex];
  const previousYear = originalIndex > 0 ? years[originalIndex - 1] : undefined;
  const events = createYearEvents({
    year: originalYear,
    previousYear,
    statePensionAge,
    spendingPhases,
  });
  const previousAge = selectedIndex > 0 ? displayYears[selectedIndex - 1]?.age : undefined;
  const nextAge =
    selectedIndex < displayYears.length - 1
      ? displayYears[selectedIndex + 1]?.age
      : undefined;

  return (
    <div className="drawdown-income-year-story">
      <section
        className="panel drawdown-income-selected-year"
        aria-labelledby="drawdown-income-selected-year-title"
      >
        <div className="drawdown-income-selected-year-heading">
          <div>
            <p className="panel-eyebrow">Selected year</p>
            <h2 id="drawdown-income-selected-year-title">Age {selectedYear.age}</h2>
            <p aria-live="polite" aria-atomic="true">
              Inspecting age {selectedYear.age} · {selectedYear.year} ·{" "}
              {displayMode === "today" ? "Today’s money" : "Future money"}
            </p>
          </div>
          <label>
            <span>Inspect age</span>
            <select
              value={selectedYear.age}
              onChange={(event) => onSelectAge(Number(event.target.value))}
            >
              {displayYears.map((year) => (
                <option key={year.age} value={year.age}>
                  Age {year.age}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="drawdown-income-year-navigation" role="group" aria-label="Inspect nearby retirement years">
          <button
            type="button"
            className="ui-button ui-button-secondary ui-button-small"
            disabled={previousAge === undefined}
            onClick={() => previousAge !== undefined && onSelectAge(previousAge)}
          >
            ← Previous year
          </button>
          <span aria-hidden="true">Age {selectedYear.age}</span>
          <button
            type="button"
            className="ui-button ui-button-secondary ui-button-small"
            disabled={nextAge === undefined}
            onClick={() => nextAge !== undefined && onSelectAge(nextAge)}
          >
            Next year →
          </button>
        </div>

        <dl className="drawdown-income-selected-year-grid">
          <IncomeMetric label="Private pension" value={selectedYear.pensionWithdrawal} />
          <IncomeMetric label="State Pension" value={selectedYear.statePensionIncome} />
          <IncomeMetric label="Gross income" value={selectedYear.grossIncome} />
          <IncomeMetric
            label="Estimated tax"
            value={-selectedYear.incomeTax}
            negative={selectedYear.incomeTax > 0}
          />
          <IncomeMetric label="Money available to spend" value={selectedYear.netIncome} emphasis />
          <IncomeMetric
            label={selectedYear.incomeTargetMode === "net" ? "Net income target" : "Gross income target"}
            value={selectedYear.desiredIncome}
          />
        </dl>
      </section>

      <section
        className={`panel drawdown-income-year-events${
          events.some((event) => event.tone === "warning") ? " has-warning" : ""
        }`}
        aria-labelledby="drawdown-income-year-events-title"
      >
        <div className="panel-heading">
          <p className="panel-eyebrow">Important this year</p>
          <h2 id="drawdown-income-year-events-title">What changes at age {selectedYear.age}?</h2>
        </div>
        <div className="drawdown-income-year-event-list">
          {events.length > 0 ? (
            events.map((event) => (
              <article key={event.title} className={`drawdown-income-year-event is-${event.tone}`}>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
              </article>
            ))
          ) : (
            <article className="drawdown-income-year-event is-neutral">
              <strong>No major change this year</strong>
              <p>Your modelled income continues on the same basis as the preceding year.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

function IncomeMetric({
  label,
  value,
  emphasis = false,
  negative = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`${emphasis ? "is-emphasis" : ""}${negative ? " is-negative" : ""}`.trim()}>
      <dt>{label}</dt>
      <dd>{formatCurrency(value)}</dd>
    </div>
  );
}

function createYearEvents({
  year,
  previousYear,
  statePensionAge,
  spendingPhases,
}: {
  year: DrawdownYear;
  previousYear?: DrawdownYear;
  statePensionAge?: number;
  spendingPhases?: DrawdownSpendingPhase[];
}) {
  const events: Array<{
    title: string;
    description: string;
    tone: "positive" | "warning" | "neutral";
  }> = [];

  const statePensionStarts =
    year.statePensionIncome > 0 &&
    (!previousYear || previousYear.statePensionIncome <= 0);
  if (statePensionStarts || year.age === statePensionAge) {
    events.push({
      title: "State Pension starts",
      description:
        "Part of your retirement income is now provided by State Pension, which can reduce the amount needed from your private pension.",
      tone: "positive",
    });
  }

  const shortfall = year.netIncomeShortfall > 0 || year.incomeShortfall > 0;
  const previousShortfall = previousYear
    ? previousYear.netIncomeShortfall > 0 || previousYear.incomeShortfall > 0
    : false;
  if (shortfall && !previousShortfall) {
    events.push({
      title: "Income falls below your target",
      description:
        "From this year, the model can no longer fully provide your selected retirement income. Your pension has not necessarily run out, but the amount available is below the target.",
      tone: "warning",
    });
  }

  const depleted = year.isDepleted || year.closingBalance <= 0;
  const previousDepleted = previousYear
    ? previousYear.isDepleted || previousYear.closingBalance <= 0
    : false;
  if (depleted && !previousDepleted) {
    events.push({
      title: "Private pension is depleted",
      description:
        "The private pension reaches £0 during this year, so later modelled income depends on other sources such as State Pension.",
      tone: "warning",
    });
  }

  const chapter = spendingPhases?.find((phase) => phase.startAge === year.age);
  if (chapter) {
    events.push({
      title: `${chapter.label} begins`,
      description:
        "Your planned spending changes from this age, so the income requested from the retirement plan changes too.",
      tone: "neutral",
    });
  }

  return events;
}
