import { useMemo } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";
import { InfoTooltip } from "../ui";

interface DrawdownIncomeYearStoryProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
  onSelectAge: (age: number) => void;
  statePensionAge?: number;
  spendingPhases?: DrawdownSpendingPhase[];
}

type RangeMarkerTone = "positive" | "warning" | "neutral";
type YearEventTone = "positive" | "warning" | "neutral";

interface RangeMarker {
  age: number;
  title: string;
  tone: RangeMarkerTone;
}

interface YearEvent {
  title: string;
  description: string;
  tone: YearEventTone;
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
  const rangeMarkers = useMemo(
    () => createRangeMarkers(years, statePensionAge, spendingPhases),
    [spendingPhases, statePensionAge, years],
  );

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
  const conclusion = createYearConclusion(originalYear, events);
  const previousAge = selectedIndex > 0 ? displayYears[selectedIndex - 1]?.age : undefined;
  const nextAge =
    selectedIndex < displayYears.length - 1
      ? displayYears[selectedIndex + 1]?.age
      : undefined;
  const firstAge = displayYears[0]?.age ?? selectedYear.age;
  const lastAge = displayYears.at(-1)?.age ?? selectedYear.age;
  const maxRangeIndex = Math.max(0, displayYears.length - 1);

  return (
    <div className="drawdown-income-year-story">
      <section
        className="panel drawdown-income-selected-year"
        aria-labelledby="drawdown-income-selected-year-title"
      >
        <div className="drawdown-income-selected-year-heading">
          <div>
            <p className="panel-eyebrow">Income at this age</p>
            <h2 id="drawdown-income-selected-year-title">Where your money comes from</h2>
            <p aria-live="polite" aria-atomic="true">
              Age {selectedYear.age} · {selectedYear.year} ·{" "}
              {displayMode === "today" ? "Today’s money" : "Future money"}
            </p>
          </div>
        </div>

        <div className="drawdown-income-age-range">
          <div className="drawdown-income-age-range-heading">
            <div className="drawdown-income-age-range-title">
              <div>
                <strong>Explore retirement by age</strong>
                <span>Move through the plan to see when your income sources or planned spending change.</span>
              </div>
              <InfoTooltip
                ariaLabel="Explain the retirement age timeline and warning markers"
                size="small"
                align="left"
              >
                <strong>What this timeline shows</strong>
                <p>
                  Use the slider to inspect each retirement year. Markers highlight important milestones and the first year something needs attention.
                </p>
                <strong>Why warnings only appear once</strong>
                <p>
                  Repeated warning years are not marked individually. Once a warning begins, only its first year is shown so the timeline stays readable. The issue may continue in later years even when no additional marker is shown.
                </p>
                <small>
                  For example, if your planned income first falls short at age 84 and remains below plan afterwards, only age 84 is marked.
                </small>
              </InfoTooltip>
            </div>
            <div className="drawdown-income-age-range-legend" aria-label="Timeline marker key">
              <span><i className="is-milestone" /> Milestone</span>
              <span><i className="is-warning" /> Needs attention</span>
            </div>
          </div>

          <div className="drawdown-income-age-range-track-wrap">
            <div className="drawdown-income-age-range-markers" aria-label="Important retirement ages">
              {rangeMarkers.map((marker) => {
                const markerIndex = displayYears.findIndex((year) => year.age === marker.age);
                if (markerIndex < 0) return null;
                const left = maxRangeIndex === 0 ? 0 : (markerIndex / maxRangeIndex) * 100;
                return (
                  <button
                    key={`${marker.age}-${marker.title}`}
                    type="button"
                    className={`drawdown-income-age-marker is-${marker.tone}`}
                    style={{ left: `${left}%` }}
                    aria-label={`${marker.title} at age ${marker.age}. Inspect this year.`}
                    title={`${marker.title} · Age ${marker.age}`}
                    onClick={() => onSelectAge(marker.age)}
                  >
                    <span aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <input
              className="drawdown-income-age-slider"
              type="range"
              min={0}
              max={maxRangeIndex}
              step={1}
              value={selectedIndex}
              aria-label={`Inspect retirement age. Currently age ${selectedYear.age}`}
              aria-valuetext={`Age ${selectedYear.age}`}
              onChange={(event) => {
                const nextIndex = Number(event.target.value);
                const nextYear = displayYears[nextIndex];
                if (nextYear) onSelectAge(nextYear.age);
              }}
            />

            <div className="drawdown-income-age-range-labels" aria-hidden="true">
              <span>Age {firstAge}</span>
              <span>Age {lastAge}</span>
            </div>
          </div>
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
          <IncomeMetric label="Money from your pension" value={selectedYear.pensionWithdrawal} />
          <IncomeMetric label="State Pension" value={selectedYear.statePensionIncome} />
          <IncomeMetric label="Income before tax" value={selectedYear.grossIncome} />
          <IncomeMetric
            label="Estimated tax"
            value={-selectedYear.incomeTax}
            negative={selectedYear.incomeTax > 0}
          />
          <IncomeMetric label="Money available to spend" value={selectedYear.netIncome} emphasis />
          <IncomeMetric label="Your planned income" value={selectedYear.desiredIncome} />
        </dl>
      </section>

      <section
        className={`panel drawdown-income-year-events${
          events.some((event) => event.tone === "warning") ? " has-warning" : ""
        }`}
        aria-labelledby="drawdown-income-year-events-title"
      >
        <div className="panel-heading">
          <p className="panel-eyebrow">What this year means</p>
          <h2 id="drawdown-income-year-events-title">What is happening at age {selectedYear.age}?</h2>
          <p>We highlight changes that affect where your income comes from or whether your planned income is still being met.</p>
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
            <article className="drawdown-income-year-event is-positive">
              <strong>Your retirement income continues as planned</strong>
              <p>Nothing significant changes this year. The same income sources continue to support the money available to spend.</p>
            </article>
          )}
        </div>

        <div className={`drawdown-income-year-conclusion is-${conclusion.tone}`}>
          <span>What this means for your plan</span>
          <strong>{conclusion.title}</strong>
          <p>{conclusion.description}</p>
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

function createRangeMarkers(
  years: DrawdownYear[],
  statePensionAge?: number,
  spendingPhases?: DrawdownSpendingPhase[],
): RangeMarker[] {
  const markers = new Map<number, RangeMarker>();

  const addMarker = (marker: RangeMarker) => {
    const existing = markers.get(marker.age);
    if (!existing || markerPriority(marker.tone) > markerPriority(existing.tone)) {
      markers.set(marker.age, marker);
    }
  };

  const statePensionStart = years.find(
    (year, index) =>
      year.statePensionIncome > 0 &&
      (index === 0 || years[index - 1].statePensionIncome <= 0),
  );
  const stateAge = statePensionStart?.age ?? statePensionAge;
  if (stateAge !== undefined && years.some((year) => year.age === stateAge)) {
    addMarker({ age: stateAge, title: "State Pension starts", tone: "positive" });
  }

  spendingPhases?.forEach((phase) => {
    if (years.some((year) => year.age === phase.startAge)) {
      addMarker({ age: phase.startAge, title: `${phase.label} begins`, tone: "neutral" });
    }
  });

  const firstShortfall = years.find((year, index) => {
    const hasShortfall = year.netIncomeShortfall > 0 || year.incomeShortfall > 0;
    if (!hasShortfall) return false;
    const previous = index > 0 ? years[index - 1] : undefined;
    return !previous || (previous.netIncomeShortfall <= 0 && previous.incomeShortfall <= 0);
  });
  if (firstShortfall) {
    addMarker({ age: firstShortfall.age, title: "Planned income is no longer fully met", tone: "warning" });
  }

  const firstDepletion = years.find((year, index) => {
    const depleted = year.isDepleted || year.closingBalance <= 0;
    if (!depleted) return false;
    const previous = index > 0 ? years[index - 1] : undefined;
    return !previous || (!previous.isDepleted && previous.closingBalance > 0);
  });
  if (firstDepletion) {
    addMarker({ age: firstDepletion.age, title: "Private pension fully used", tone: "warning" });
  }

  return [...markers.values()].sort((a, b) => a.age - b.age);
}

function markerPriority(tone: RangeMarkerTone) {
  if (tone === "warning") return 3;
  if (tone === "positive") return 2;
  return 1;
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
}): YearEvent[] {
  const events: YearEvent[] = [];

  const statePensionStarts =
    year.statePensionIncome > 0 &&
    (!previousYear || previousYear.statePensionIncome <= 0);
  if (statePensionStarts || year.age === statePensionAge) {
    events.push({
      title: "Your State Pension begins this year",
      description:
        "Part of your retirement income now comes from the State Pension. This usually reduces how much needs to come from your private pension.",
      tone: "positive",
    });
  }

  const incomeBelowTarget = year.netIncomeShortfall > 0 || year.incomeShortfall > 0;
  const previousIncomeBelowTarget = previousYear
    ? previousYear.netIncomeShortfall > 0 || previousYear.incomeShortfall > 0
    : false;
  if (incomeBelowTarget && !previousIncomeBelowTarget) {
    events.push({
      title: "Your planned income is no longer fully met",
      description:
        "From this year, the illustration provides less money than you planned to spend. Income continues, but it is below your chosen amount.",
      tone: "warning",
    });
  }

  const pensionFullyUsed = year.isDepleted || year.closingBalance <= 0;
  const previousPensionFullyUsed = previousYear
    ? previousYear.isDepleted || previousYear.closingBalance <= 0
    : false;
  if (pensionFullyUsed && !previousPensionFullyUsed) {
    events.push({
      title: "Your private pension has now been fully used",
      description:
        "From this point, any remaining retirement income comes from other sources included in your plan, such as the State Pension.",
      tone: "warning",
    });
  }

  const chapter = spendingPhases?.find((phase) => phase.startAge === year.age);
  if (chapter) {
    events.push({
      title: `${chapter.label} begins`,
      description:
        "Your planned spending changes from this age, so the amount of income your retirement plan needs to provide changes too.",
      tone: "neutral",
    });
  }

  return events;
}

function createYearConclusion(year: DrawdownYear, events: YearEvent[]) {
  const warning = events.find((event) => event.tone === "warning");
  if (warning?.title.includes("fully used")) {
    return {
      tone: "warning" as const,
      title: "Your private pension is no longer providing income.",
      description:
        "Future income now depends on the other income sources included in your plan, such as the State Pension.",
    };
  }

  if (warning) {
    return {
      tone: "warning" as const,
      title: "This is the first year your planned income is not fully met.",
      description:
        "The plan continues, but the money available to spend is below your planned amount. This is a useful point to review when comparing retirement choices.",
    };
  }

  if (events.some((event) => event.title.includes("State Pension"))) {
    return {
      tone: "positive" as const,
      title: "Your income now comes from more than one source.",
      description:
        "The State Pension provides part of the money you can spend, which can reduce how much needs to come from your private pension.",
    };
  }

  if (events.length > 0) {
    return {
      tone: "neutral" as const,
      title: "Your planned retirement changes from this year.",
      description:
        "The amount you plan to spend has changed, so the amount needed from your pension may change as well.",
    };
  }

  const belowTarget = year.netIncomeShortfall > 0 || year.incomeShortfall > 0;
  if (belowTarget) {
    return {
      tone: "warning" as const,
      title: "Your income remains below your planned amount.",
      description:
        "The warning began in an earlier year, so it is not repeated on the timeline. The illustration is still providing less income than you planned for.",
    };
  }

  return {
    tone: "positive" as const,
    title: "Your retirement income continues as planned.",
    description:
      "There is no new issue to review this year, and your income continues on the same basis as the previous year.",
  };
}
