import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useScenarios } from "../scenarios";
import { AppIcons } from "../../icons";
import "../../styles/what-if-view-modes.css";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

interface SavedRetirementAgeExperiment {
  id: string;
  name: string;
  retirementAge: number;
}

interface RetirementAgeExperimentProps {
  activePlanName: string;
  currentAge: number;
  statePensionAge: number;
  baselineRetirementAge: number;
  retirementAge: number;
  planningAge: number;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  savedExperiments?: SavedRetirementAgeExperiment[];
  onRetirementAgeChange: (age: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function RetirementAgeExperiment({
  activePlanName,
  currentAge,
  statePensionAge,
  baselineRetirementAge,
  retirementAge,
  planningAge,
  baselineProjectedPension,
  projectedPension,
  canSave,
  saveMessage,
  savedExperiments = [],
  onRetirementAgeChange,
  onReset,
  onSave,
}: RetirementAgeExperimentProps) {
  const { activeScenario } = useScenarios();
  const { viewMode, displayMode } = useWhatIfDisplaySettings();
  const ageDifference = retirementAge - baselineRetirementAge;
  const hasChanged = ageDifference !== 0;
  const retirementYears = Math.max(0, planningAge - retirementAge + 1);
  const baselineRetirementYears = Math.max(
    0,
    planningAge - baselineRetirementAge + 1,
  );
  const retirementYearsDifference = retirementYears - baselineRetirementYears;
  const minAge = currentAge;
  const maxAge = Math.max(currentAge, Math.min(100, statePensionAge + 5));
  const ageRange = Math.max(1, maxAge - minAge);
  const baselinePosition = Math.max(
    0,
    Math.min(100, ((baselineRetirementAge - minAge) / ageRange) * 100),
  );
  const immediateRetirement = retirementAge === currentAge;
  const inflation = activeScenario.inputs.inflation;
  const baselineInflationFactor = Math.pow(
    1 + inflation,
    Math.max(0, baselineRetirementAge - currentAge),
  );
  const experimentInflationFactor = Math.pow(
    1 + inflation,
    Math.max(0, retirementAge - currentAge),
  );
  const showingToday = displayMode === "today";
  const displayedBaselinePension = showingToday
    ? baselineProjectedPension
    : baselineProjectedPension * baselineInflationFactor;
  const displayedPension = showingToday
    ? projectedPension
    : projectedPension * experimentInflationFactor;
  const pensionDifference = displayedPension - displayedBaselinePension;
  const savedPlanTiming = createSavedPlanTiming(ageDifference);
  const saveAlreadyExists = hasChanged && !canSave && saveMessage === null;
  const savedMarkers = savedExperiments
    .filter(
      (item) => item.retirementAge >= minAge && item.retirementAge <= maxAge,
    )
    .map((item) => ({
      ...item,
      position: ((item.retirementAge - minAge) / ageRange) * 100,
    }));

  return (
    <section
      className="what-if-workspace what-if-workspace-compact"
      aria-labelledby="retirement-age-experiment-title"
    >
      <header className="what-if-workspace-header what-if-workspace-header-compact">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="retirement-age-experiment-title">Retirement age</h2>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-decision-layout">
        <section
          className="what-if-change-panel"
          aria-labelledby="retirement-age-change-title"
        >
          <div className="what-if-panel-heading">
            <p className="planner-eyebrow">Change</p>
            <h3 id="retirement-age-change-title">When would you like to retire?</h3>
            <p>Move one lever. Everything else stays as saved in your plan.</p>
          </div>
          <div className="what-if-primary-value">
            <span>Experimental retirement age</span>
            <strong>Age {retirementAge}</strong>
            <small>
              Saved plan: age {baselineRetirementAge} · {savedPlanTiming}
            </small>
          </div>
          <div className="what-if-slider-wrap what-if-slider-wrap-primary">
            <div className="what-if-slider-track-wrap">
              <input
                id="what-if-retirement-age"
                type="range"
                min={minAge}
                max={maxAge}
                step={1}
                value={retirementAge}
                aria-label="Experimental retirement age"
                aria-valuetext={`Age ${retirementAge}`}
                onChange={(event) =>
                  onRetirementAgeChange(Number(event.target.value))
                }
              />
              {savedMarkers.map((marker) => (
                <span
                  key={marker.id}
                  className={`what-if-slider-experiment-marker${
                    marker.retirementAge === retirementAge ? " is-current" : ""
                  }`}
                  style={{ left: `${marker.position}%` }}
                  title={`${marker.name} · Retire at age ${marker.retirementAge}`}
                  aria-hidden="true"
                />
              ))}
              <span
                className="what-if-slider-reference-marker"
                style={{ left: `${baselinePosition}%` }}
                aria-hidden="true"
              />
            </div>
            <div
              className="what-if-slider-labels what-if-slider-labels-reference"
              aria-hidden="true"
            >
              <span>Age {minAge}</span>
              <span
                className="what-if-slider-saved-label"
                style={{ left: `${baselinePosition}%` }}
              >
                Saved · {baselineRetirementAge}
              </span>
              <span>Age {maxAge}</span>
            </div>
            {savedMarkers.length > 0 && (
              <p className="what-if-slider-marker-key">
                <span className="what-if-slider-marker-key-dot" aria-hidden="true" />
                {savedMarkers.length === 1
                  ? "1 saved experiment is marked on the slider"
                  : `${savedMarkers.length} saved experiments are marked on the slider`}
              </p>
            )}
          </div>
          <p className="what-if-control-note">
            {immediateRetirement
              ? "Retiring now uses the pension already built, with no further contribution or accumulation years."
              : "Changing retirement age affects both how long the pension can grow and how many retirement years it may need to support."}
          </p>
        </section>

        <section
          className="what-if-result-panel"
          aria-labelledby="retirement-age-outcome-title"
          aria-live="polite"
        >
          <div className="what-if-result-heading">
            <div>
              <p className="planner-eyebrow">Outcome</p>
              <h3 id="retirement-age-outcome-title">
                {hasChanged ? `Retire at ${retirementAge}` : "Your saved retirement age"}
              </h3>
            </div>
            <span className="what-if-result-status is-neutral">
              {hasChanged
                ? `${Math.abs(ageDifference)} ${
                    Math.abs(ageDifference) === 1 ? "year" : "years"
                  } ${ageDifference < 0 ? "earlier" : "later"}`
                : "Saved plan"}
            </span>
          </div>

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-outcome-copy">
                <strong>
                  {hasChanged
                    ? `What changes if you retire at ${retirementAge}?`
                    : `${activePlanName} is unchanged`}
                </strong>
                <p>{directImpactExplanation(ageDifference, retirementAge)}</p>
              </div>
              <div
                className="what-if-simple-results"
                aria-label="Simple retirement age outcomes"
              >
                <SimpleResult
                  value={formatCurrency(displayedPension)}
                  label="Pension when retirement starts"
                  note={
                    hasChanged
                      ? `${formatSignedCurrency(
                          pensionDifference,
                        )} compared with retiring at ${baselineRetirementAge}`
                      : "Your saved plan starting pension"
                  }
                  tone={
                    pensionDifference < 0
                      ? "negative"
                      : pensionDifference > 0
                        ? "positive"
                        : "neutral"
                  }
                />
                <SimpleResult
                  value={`${retirementYears} years`}
                  label="Modelled retirement years"
                  note={
                    hasChanged
                      ? retirementYearsNote(retirementYearsDifference)
                      : `Ages ${retirementAge} to ${planningAge}, inclusive`
                  }
                  tone="neutral"
                />
              </div>
            </>
          ) : (
            <>
              <div
                className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}
              >
                <span className="what-if-story-icon" aria-hidden="true">
                  <FontAwesomeIcon
                    icon={
                      immediateRetirement
                        ? AppIcons.concepts.retirement
                        : AppIcons.clock
                    }
                    fixedWidth
                  />
                </span>
                <div>
                  <strong>Direct impact of changing retirement age</strong>
                  <p>{directImpactExplanation(ageDifference, retirementAge)}</p>
                </div>
              </div>
              <div
                className="what-if-key-results"
                aria-label="Detailed retirement age outcomes"
              >
                <KeyResult
                  label="Pension at retirement"
                  value={formatCurrency(displayedPension)}
                  difference={formatSignedCurrency(pensionDifference)}
                />
                <KeyResult
                  label="Modelled retirement years"
                  value={`${retirementYears} years`}
                  difference={formatSignedYears(retirementYearsDifference)}
                />
              </div>
            </>
          )}

          <div className="what-if-inline-actions">
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-medium"
              disabled={!hasChanged}
              title={hasChanged ? `Reset to ${activePlanName}` : undefined}
              onClick={onReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="ui-button ui-button-primary ui-button-medium"
              disabled={!hasChanged || !canSave}
              title={
                saveAlreadyExists
                  ? "This retirement-age experiment is already saved."
                  : undefined
              }
              onClick={onSave}
            >
              {saveAlreadyExists ? "Already saved" : "Save experiment"}
            </button>
          </div>
        </section>
      </div>

      {viewMode === "detailed" && (
        <div className="what-if-detail-disclosures">
          <details className="what-if-detail-card">
            <summary>
              <span>
                <strong>Why did this change?</strong>
                <small>See the mechanics behind the direct pension impact.</small>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <ul className="what-if-detail-list">
              {createReasons(ageDifference, immediateRetirement).map((reason) => (
                <li key={reason}>
                  <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </details>
          <details className="what-if-detail-card">
            <summary>
              <span>
                <strong>Detailed comparison</strong>
                <small>Compare the direct effect with the saved plan.</small>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="what-if-detail-comparison">
              <OutcomeCard
                label="Pension at retirement"
                baseline={formatCurrency(displayedBaselinePension)}
                experiment={formatCurrency(displayedPension)}
                difference={formatSignedCurrency(pensionDifference)}
              />
              <OutcomeCard
                label="Modelled retirement years"
                baseline={`${baselineRetirementYears} years`}
                experiment={`${retirementYears} years`}
                difference={formatSignedYears(retirementYearsDifference)}
              />
            </div>
          </details>
        </div>
      )}

      {displayMode === "nominal" && hasChanged && (
        <p className="what-if-money-basis-note">
          Future-money figures are shown in pounds at each plan&apos;s retirement date,
          so the comparison also reflects the different amount of inflation before each
          retirement age.
        </p>
      )}
      {saveMessage && (
        <p className="what-if-save-message" role="status">
          {saveMessage}
        </p>
      )}
    </section>
  );
}

function SimpleResult({
  value,
  label,
  note,
  tone,
}: {
  value: string;
  label: string;
  note: string;
  tone: "positive" | "negative" | "neutral";
}) {
  return (
    <article className="what-if-simple-result">
      <strong>{value}</strong>
      <span>{label}</span>
      <small className={`is-${tone}`}>{note}</small>
    </article>
  );
}

function KeyResult({
  label,
  value,
  difference,
}: {
  label: string;
  value: string;
  difference: string;
}) {
  return (
    <article className="what-if-key-result">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={toneClassName(difference)}>{difference}</small>
    </article>
  );
}

function OutcomeCard({
  label,
  baseline,
  experiment,
  difference,
}: {
  label: string;
  baseline: string;
  experiment: string;
  difference: string;
}) {
  return (
    <article className="what-if-outcome-card what-if-outcome-card-compact">
      <span>{label}</span>
      <div>
        <small>Saved plan</small>
        <strong>{baseline}</strong>
      </div>
      <FontAwesomeIcon
        className="what-if-outcome-arrow"
        icon={AppIcons.chartLine}
        aria-hidden="true"
      />
      <div>
        <small>Experiment</small>
        <strong>{experiment}</strong>
      </div>
      <em className={`what-if-outcome-difference${toneSuffix(difference)}`}>
        {difference}
      </em>
    </article>
  );
}

function directImpactExplanation(
  ageDifference: number,
  retirementAge: number,
): string {
  if (ageDifference === 0) {
    return "Move the retirement-age slider to see how changing when you retire affects the pension you start with and how long it may need to support you.";
  }
  if (ageDifference < 0) {
    return `Retiring at ${retirementAge} gives your pension less time for contributions and growth, so you start retirement with less money and need it to support more retirement years.`;
  }
  return `Retiring at ${retirementAge} gives your pension more time for contributions and growth, so you start retirement with more money and need it to support fewer retirement years.`;
}

function retirementYearsNote(difference: number): string {
  if (difference === 0) return "Same length as your saved plan";
  const years = Math.abs(difference);
  return `${years} ${years === 1 ? "year" : "years"} ${
    difference > 0 ? "more" : "fewer"
  } to support`;
}

function createSavedPlanTiming(ageDifference: number): string {
  if (ageDifference === 0) return "matches this experiment";
  const years = Math.abs(ageDifference);
  return `saved plan is ${years} ${years === 1 ? "year" : "years"} ${
    ageDifference < 0 ? "later" : "earlier"
  }`;
}

function createReasons(
  ageDifference: number,
  immediateRetirement: boolean,
): string[] {
  if (immediateRetirement) {
    return [
      "There are no further contribution years before retirement.",
      "The pension has no further accumulation period before withdrawals begin.",
      "The pension needs to support the full modelled retirement period immediately.",
    ];
  }
  if (ageDifference < 0) {
    return [
      "There are fewer years of contributions before retirement.",
      "The pension has less time for investment growth before withdrawals begin.",
      "There are more retirement years for the pension to support.",
    ];
  }
  if (ageDifference > 0) {
    return [
      "There are more years of contributions before retirement.",
      "The pension has longer for investment growth before withdrawals begin.",
      "There are fewer retirement years for the pension to support.",
    ];
  }
  return [
    "This matches the retirement age in your saved plan.",
    "Contribution years and the accumulation period are unchanged.",
    "The planned retirement period is unchanged.",
  ];
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "£0";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedYears(value: number): string {
  if (value === 0) return "No change";
  const years = Math.abs(value);
  return `${value > 0 ? "+" : "−"}${years} ${years === 1 ? "year" : "years"}`;
}

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("−")) return " is-negative";
  return "";
}

function toneClassName(value: string): string {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("−")) return "is-negative";
  return "";
}
