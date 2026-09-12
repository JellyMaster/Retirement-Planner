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
  const baselineRetirementYears = Math.max(0, planningAge - baselineRetirementAge + 1);
  const retirementYearsDifference = retirementYears - baselineRetirementYears;
  const minAge = currentAge;
  const maxAge = Math.max(currentAge, Math.min(100, statePensionAge + 5));
  const ageRange = Math.max(1, maxAge - minAge);
  const baselinePosition = Math.max(0, Math.min(100, ((baselineRetirementAge - minAge) / ageRange) * 100));
  const immediateRetirement = retirementAge === currentAge;
  const inflation = activeScenario.inputs.inflation;
  const baselineInflationFactor = Math.pow(1 + inflation, Math.max(0, baselineRetirementAge - currentAge));
  const experimentInflationFactor = Math.pow(1 + inflation, Math.max(0, retirementAge - currentAge));
  const showingToday = displayMode === "today";
  const displayedBaselinePension = showingToday ? baselineProjectedPension : baselineProjectedPension * baselineInflationFactor;
  const displayedPension = showingToday ? projectedPension : projectedPension * experimentInflationFactor;
  const pensionDifference = displayedPension - displayedBaselinePension;
  const savedPlanTiming = createSavedPlanTiming(ageDifference);
  const saveAlreadyExists = hasChanged && !canSave && saveMessage === null;
  const savedMarkers = savedExperiments
    .map((item, index) => ({ ...item, markerNumber: index + 1, markerTone: index % 6 }))
    .filter((item) => item.retirementAge >= minAge && item.retirementAge <= maxAge)
    .map((item) => ({ ...item, position: ((item.retirementAge - minAge) / ageRange) * 100 }));

  return (
    <section className="what-if-workspace what-if-workspace-compact" aria-labelledby="retirement-age-experiment-title">
      <header className="what-if-workspace-header what-if-workspace-header-compact">
        <div><p className="planner-eyebrow">What if</p><h2 id="retirement-age-experiment-title">Retirement age</h2></div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-decision-layout">
        <section className="what-if-change-panel" aria-labelledby="retirement-age-change-title">
          <div className="what-if-panel-heading">
            <p className="planner-eyebrow">Change</p>
            <h3 id="retirement-age-change-title">When would you like to retire?</h3>
            <p>Change your retirement age. Everything else stays the same.</p>
          </div>
          <div className="what-if-primary-value">
            <span>Retirement age</span><strong>Age {retirementAge}</strong>
            <small>Saved plan: age {baselineRetirementAge} · {savedPlanTiming}</small>
          </div>
          <div className="what-if-slider-wrap what-if-slider-wrap-primary">
            <div className="what-if-slider-track-wrap">
              <input id="what-if-retirement-age" type="range" min={minAge} max={maxAge} step={1} value={retirementAge} aria-label="Retirement age" aria-valuetext={`Age ${retirementAge}`} onChange={(event) => onRetirementAgeChange(Number(event.target.value))} />
              {savedMarkers.map((marker) => (
                <span
                  key={marker.id}
                  className={`what-if-contribution-experiment-marker what-if-marker-tone-${marker.markerTone}`}
                  style={{ left: `${marker.position}%` }}
                  title={`${marker.name} · Retire at age ${marker.retirementAge}`}
                  aria-hidden="true"
                >
                  {marker.markerNumber}
                </span>
              ))}
              <span className="what-if-slider-reference-marker" style={{ left: `${baselinePosition}%` }} aria-hidden="true" />
            </div>
            <div className="what-if-slider-labels what-if-slider-labels-reference" aria-hidden="true">
              <span>Age {minAge}</span><span className="what-if-slider-saved-label" style={{ left: `${baselinePosition}%` }}>Saved · {baselineRetirementAge}</span><span>Age {maxAge}</span>
            </div>
            {savedMarkers.length > 0 && (
              <p className="what-if-contribution-marker-key">Numbered markers match the saved retirement-age experiments in the panel.</p>
            )}
          </div>
          <p className="what-if-control-note">{immediateRetirement ? "Retiring now means using the pension you have already built, with no more years to pay in or let it grow before retirement." : "Changing when you retire changes how long you can pay into your pension, how long it can grow, and how many years it may need to support you."}</p>
        </section>

        <section className="what-if-result-panel" aria-labelledby="retirement-age-outcome-title" aria-live="polite">
          <div className="what-if-result-heading">
            <div><p className="planner-eyebrow">Outcome</p><h3 id="retirement-age-outcome-title">{hasChanged ? `Retire at ${retirementAge}` : "Your saved retirement age"}</h3></div>
            <span className="what-if-result-status is-neutral">{hasChanged ? `${Math.abs(ageDifference)} ${Math.abs(ageDifference) === 1 ? "year" : "years"} ${ageDifference < 0 ? "earlier" : "later"}` : "Saved plan"}</span>
          </div>

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-outcome-copy">
                <strong>{hasChanged ? `What happens if you retire at ${retirementAge}?` : `${activePlanName} is unchanged`}</strong>
                <p>{directImpactExplanation(ageDifference, pensionDifference, retirementYearsDifference)}</p>
              </div>
              <div className="what-if-simple-results" aria-label="Simple retirement age outcomes">
                <SimpleResult value={formatCurrency(displayedPension)} label="Pension when you retire" note={hasChanged ? `${formatPlainCurrencyDifference(pensionDifference)} than retiring at ${baselineRetirementAge}` : `Your pension if you retire at ${baselineRetirementAge}`} tone={pensionDifference < 0 ? "negative" : pensionDifference > 0 ? "positive" : "neutral"} />
                <SimpleResult value={`${retirementYears} years`} label="Years in retirement" note={hasChanged ? retirementYearsNote(retirementYearsDifference) : `From age ${retirementAge} to ${planningAge}`} tone="neutral" />
              </div>
            </>
          ) : (
            <>
              <div className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}>
                <span className="what-if-story-icon" aria-hidden="true"><FontAwesomeIcon icon={immediateRetirement ? AppIcons.concepts.retirement : AppIcons.clock} fixedWidth /></span>
                <div><strong>What changing your retirement age does</strong><p>{directImpactExplanation(ageDifference, pensionDifference, retirementYearsDifference)}</p></div>
              </div>
              <div className="what-if-key-results" aria-label="Detailed retirement age outcomes">
                <KeyResult label="Pension when you retire" value={formatCurrency(displayedPension)} difference={formatSignedCurrency(pensionDifference)} />
                <KeyResult label="Years in retirement" value={`${retirementYears} years`} difference={formatSignedYears(retirementYearsDifference)} />
              </div>
            </>
          )}

          <div className="what-if-inline-actions">
            <button type="button" className="ui-button ui-button-secondary ui-button-medium" disabled={!hasChanged} title={hasChanged ? `Reset to ${activePlanName}` : undefined} onClick={onReset}>Reset</button>
            <button type="button" className="ui-button ui-button-primary ui-button-medium" disabled={!hasChanged || !canSave} title={saveAlreadyExists ? "This retirement-age experiment is already saved." : undefined} onClick={onSave}>{saveAlreadyExists ? "Already saved" : "Save experiment"}</button>
          </div>
        </section>
      </div>

      {viewMode === "detailed" && (
        <div className="what-if-detail-disclosures">
          <details className="what-if-detail-card">
            <summary><span><strong>Why did this change?</strong><small>See what is driving the change in your pension.</small></span><span aria-hidden="true">+</span></summary>
            <ul className="what-if-detail-list">{createReasons(ageDifference, immediateRetirement).map((reason) => (<li key={reason}><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>{reason}</span></li>))}</ul>
          </details>
          <details className="what-if-detail-card">
            <summary><span><strong>Detailed comparison</strong><small>Compare what changes with your saved plan.</small></span><span aria-hidden="true">+</span></summary>
            <div className="what-if-detail-comparison">
              <OutcomeCard label="Pension when you retire" baseline={formatCurrency(displayedBaselinePension)} experiment={formatCurrency(displayedPension)} difference={formatSignedCurrency(pensionDifference)} />
              <OutcomeCard label="Years in retirement" baseline={`${baselineRetirementYears} years`} experiment={`${retirementYears} years`} difference={formatSignedYears(retirementYearsDifference)} />
            </div>
          </details>
        </div>
      )}

      {displayMode === "nominal" && hasChanged && (<p className="what-if-money-basis-note">Future-money figures are shown in pounds at each plan&apos;s retirement date, so the comparison also reflects the different amount of inflation before each retirement age.</p>)}
      {saveMessage && (<p className="what-if-save-message" role="status">{saveMessage}</p>)}
    </section>
  );
}

function SimpleResult({ value, label, note, tone }: { value: string; label: string; note: string; tone: "positive" | "negative" | "neutral" }) {
  return <article className="what-if-simple-result"><strong>{value}</strong><span>{label}</span><small className={`is-${tone}`}>{note}</small></article>;
}

function KeyResult({ label, value, difference }: { label: string; value: string; difference: string }) {
  return <article className="what-if-key-result"><span>{label}</span><strong>{value}</strong><small className={toneClassName(difference)}>{difference}</small></article>;
}

function OutcomeCard({ label, baseline, experiment, difference }: { label: string; baseline: string; experiment: string; difference: string }) {
  return (
    <article className="what-if-outcome-card what-if-outcome-card-compact">
      <span>{label}</span><div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${toneSuffix(difference)}`}>{difference}</em>
    </article>
  );
}

function directImpactExplanation(ageDifference: number, pensionDifference: number, retirementYearsDifference: number): string {
  if (ageDifference === 0) return "Move the retirement-age slider to see how changing when you retire affects the pension you start with and how many years it may need to support you.";
  const years = Math.abs(ageDifference);
  const yearWord = years === 1 ? "year" : "years";
  const retirementYears = Math.abs(retirementYearsDifference);
  const retirementYearWord = retirementYears === 1 ? "year" : "years";
  const pensionChange = formatCurrency(Math.abs(pensionDifference));
  if (ageDifference < 0) return `You'd have ${years} fewer ${yearWord} to pay into your pension and for it to grow. You'd start retirement with ${pensionChange} less and need your pension to support you for ${retirementYears} ${retirementYearWord} longer.`;
  return `You'd have ${years} more ${yearWord} to pay into your pension and for it to grow. You'd start retirement with ${pensionChange} more and need your pension to support you for ${retirementYears} fewer ${retirementYearWord}.`;
}

function retirementYearsNote(difference: number): string {
  if (difference === 0) return "Same as your saved plan";
  const years = Math.abs(difference);
  return `${years} ${years === 1 ? "year" : "years"} ${difference > 0 ? "longer" : "shorter"} than your saved plan`;
}

function createSavedPlanTiming(ageDifference: number): string {
  if (ageDifference === 0) return "matches this experiment";
  const years = Math.abs(ageDifference);
  return `saved plan is ${years} ${years === 1 ? "year" : "years"} ${ageDifference < 0 ? "later" : "earlier"}`;
}

function createReasons(ageDifference: number, immediateRetirement: boolean): string[] {
  if (immediateRetirement) return ["You stop paying into your pension when retirement starts.", "Your pension has no more time to grow before you begin taking money from it.", "Your pension needs to support you from now until your planning age."];
  if (ageDifference < 0) return ["You have fewer years to pay into your pension before retirement.", "Your pension has less time to grow before you begin taking money from it.", "Your pension needs to support you for more years in retirement."];
  if (ageDifference > 0) return ["You have more years to pay into your pension before retirement.", "Your pension has more time to grow before you begin taking money from it.", "Your pension needs to support you for fewer years in retirement."];
  return ["This is the retirement age in your saved plan.", "The time you have to pay in and let your pension grow is unchanged.", "The number of years your pension needs to support you is unchanged."];
}

function formatPlainCurrencyDifference(value: number): string {
  if (Math.abs(value) < 0.5) return "The same";
  return `${formatCurrency(Math.abs(value))} ${value > 0 ? "more" : "less"}`;
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
