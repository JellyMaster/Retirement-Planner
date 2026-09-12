import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useScenarios } from "../scenarios";
import { AppIcons } from "../../icons";
import "../../styles/what-if-view-modes.css";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfScenarios } from "./WhatIfScenarioContext";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

interface ExtraSavingExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  baselineExtraContribution: number;
  baselineExtraContributionAge: number;
  extraContribution: number;
  extraContributionAge: number;
  baselineProjectedPension: number;
  projectedPension: number;
  canSave: boolean;
  saveMessage: string | null;
  onExtraContributionChange: (amount: number) => void;
  onExtraContributionAgeChange: (age: number) => void;
  onReset: () => void;
  onSave: () => void;
}

interface SavedExtraSavingMarker {
  id: string;
  name: string;
  markerNumber: number;
  amount: number;
  age: number;
}

export function ExtraSavingExperiment({
  activePlanName,
  currentAge,
  retirementAge,
  baselineExtraContribution,
  baselineExtraContributionAge,
  extraContribution,
  extraContributionAge,
  baselineProjectedPension,
  projectedPension,
  canSave,
  saveMessage,
  onExtraContributionChange,
  onExtraContributionAgeChange,
  onReset,
  onSave,
}: ExtraSavingExperimentProps) {
  const { activeScenario } = useScenarios();
  const { scenarios: whatIfScenarios } = useWhatIfScenarios();
  const { viewMode, displayMode } = useWhatIfDisplaySettings();
  const amountDifference = extraContribution - baselineExtraContribution;
  const baselineHasExtra = baselineExtraContribution > 0;
  const experimentHasExtra = extraContribution > 0;
  const ageDifference = experimentHasExtra
    ? extraContributionAge - baselineExtraContributionAge
    : 0;
  const hasChanged = amountDifference !== 0 || (baselineHasExtra && experimentHasExtra && ageDifference !== 0);
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const inflationFactor = Math.pow(1 + activeScenario.inputs.inflation, yearsToRetirement);
  const showingToday = displayMode === "today";
  const displayedBaselinePension = showingToday
    ? baselineProjectedPension
    : baselineProjectedPension * inflationFactor;
  const displayedPension = showingToday
    ? projectedPension
    : projectedPension * inflationFactor;
  const pensionDifference = displayedPension - displayedBaselinePension;
  const latestAge = Math.max(currentAge, retirementAge - 1);
  const saveAlreadyExists = hasChanged && !canSave && saveMessage === null;

  const savedMarkers: SavedExtraSavingMarker[] = whatIfScenarios
    .filter(
      (scenario) =>
        scenario.baseScenarioId === activeScenario.id &&
        scenario.experimentType === "extra-saving",
    )
    .map((scenario, index) => ({
      id: scenario.id,
      name: scenario.name,
      markerNumber: index + 1,
      amount: scenario.inputs.extraMonthlyContribution ?? 0,
      age: scenario.inputs.extraContributionAge ?? baselineExtraContributionAge,
    }));

  const amountMaximum = roundUp(
    Math.max(1_000, baselineExtraContribution + 1_000, extraContribution, ...savedMarkers.map((marker) => marker.amount)),
    250,
  );
  const ageRange = Math.max(1, latestAge - currentAge);
  const baselineAgePosition = ((baselineExtraContributionAge - currentAge) / ageRange) * 100;

  return (
    <section className="what-if-workspace what-if-workspace-compact what-if-contribution-experiment" aria-labelledby="extra-saving-experiment-title">
      <header className="what-if-workspace-header what-if-workspace-header-compact">
        <div>
          <p className="planner-eyebrow">What if</p>
          <h2 id="extra-saving-experiment-title">Save more later</h2>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-decision-layout">
        <section className="what-if-change-panel" aria-labelledby="extra-saving-change-title">
          <div className="what-if-panel-heading">
            <p className="planner-eyebrow">Change</p>
            <h3 id="extra-saving-change-title">What if you started saving extra later?</h3>
            <p>Choose an extra monthly payment and the age it starts. Your regular contributions stay unchanged.</p>
          </div>

          <div className="what-if-contribution-levers">
            <div className="what-if-contribution-lever">
              <div className="what-if-contribution-lever-heading">
                <span>Extra monthly saving</span>
                <strong>{formatCurrency(extraContribution)}/month</strong>
                <small>{baselineHasExtra ? `Saved: ${formatCurrency(baselineExtraContribution)}/month` : "Saved plan: no extra monthly saving"}</small>
              </div>
              <AmountSlider
                baseline={baselineExtraContribution}
                amount={extraContribution}
                maximum={amountMaximum}
                markers={savedMarkers}
                onChange={onExtraContributionChange}
              />
            </div>

            <div className="what-if-contribution-lever">
              <div className="what-if-contribution-lever-heading">
                <span>Start age</span>
                <strong>Age {extraContributionAge}</strong>
                <small>{baselineHasExtra ? `Saved: age ${baselineExtraContributionAge}` : "Choose when the extra saving would begin"}</small>
              </div>
              <div className="what-if-slider-wrap what-if-slider-wrap-primary">
                <div className="what-if-slider-track-wrap">
                  <input
                    type="range"
                    min={currentAge}
                    max={latestAge}
                    step={1}
                    value={extraContributionAge}
                    aria-label="Experimental extra contribution start age"
                    aria-valuetext={`Starts at age ${extraContributionAge}`}
                    onChange={(event) => onExtraContributionAgeChange(Number(event.target.value))}
                  />
                  {baselineHasExtra && (
                    <span className="what-if-slider-reference-marker" style={{ left: `${baselineAgePosition}%` }} aria-hidden="true" />
                  )}
                  {savedMarkers.filter((marker) => marker.amount > 0 && marker.age >= currentAge && marker.age <= latestAge).map((marker) => (
                    <span
                      key={marker.id}
                      className={`what-if-contribution-experiment-marker what-if-marker-tone-${(marker.markerNumber - 1) % 6}`}
                      style={{ left: `${((marker.age - currentAge) / ageRange) * 100}%` }}
                      title={`${marker.markerNumber}. ${marker.name} · Starts at age ${marker.age}`}
                      aria-hidden="true"
                    >
                      {marker.markerNumber}
                    </span>
                  ))}
                </div>
                <div className="what-if-slider-labels what-if-slider-labels-reference" aria-hidden="true">
                  <span>Age {currentAge}</span>
                  {baselineHasExtra && <span className="what-if-slider-saved-label" style={{ left: `${baselineAgePosition}%` }}>Saved · {baselineExtraContributionAge}</span>}
                  <span>Age {latestAge}</span>
                </div>
              </div>
            </div>
          </div>

          {savedMarkers.length > 0 && (
            <p className="what-if-contribution-marker-key">Numbered markers match the saved experiments in the panel. The same number and colour identify an experiment on both sliders.</p>
          )}
        </section>

        <section className="what-if-result-panel" aria-labelledby="extra-saving-outcome-title" aria-live="polite">
          <div className="what-if-result-heading">
            <div>
              <p className="planner-eyebrow">Outcome</p>
              <h3 id="extra-saving-outcome-title">{hasChanged ? "What saving extra later could do" : "Your saved extra-saving plan"}</h3>
            </div>
            <span className="what-if-result-status is-neutral">{hasChanged ? statusText(amountDifference, ageDifference) : "Saved plan"}</span>
          </div>

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-results" aria-label="Simple extra saving outcomes">
                <SimpleResult
                  value={experimentHasExtra ? `${formatCurrency(extraContribution)}/month` : "£0/month"}
                  label={experimentHasExtra ? `Extra saving from age ${extraContributionAge}` : "Extra saving"}
                  note={extraSavingNote(baselineExtraContribution, baselineExtraContributionAge, extraContribution, extraContributionAge)}
                  tone={amountDifference > 0 ? "positive" : amountDifference < 0 ? "negative" : "neutral"}
                />
                <SimpleResult
                  value={formatCurrency(displayedPension)}
                  label="Pension when you retire"
                  note={hasChanged ? `${formatPlainCurrencyDifference(pensionDifference)} than your saved plan` : `Your pension at age ${retirementAge}`}
                  tone={pensionDifference > 0 ? "positive" : pensionDifference < 0 ? "negative" : "neutral"}
                />
              </div>
              <div className="what-if-simple-outcome-copy">
                <strong>{hasChanged ? simpleTitle(amountDifference, ageDifference) : `${activePlanName} is unchanged`}</strong>
                <p>{simpleExplanation(extraContribution, extraContributionAge, pensionDifference, yearsToRetirement, hasChanged)}</p>
              </div>
            </>
          ) : (
            <>
              <div className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}>
                <span className="what-if-story-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.clock} fixedWidth /></span>
                <div>
                  <strong>What changing your future extra saving does</strong>
                  <p>{detailedExplanation(baselineExtraContribution, baselineExtraContributionAge, extraContribution, extraContributionAge, pensionDifference)}</p>
                </div>
              </div>
              <div className="what-if-key-results" aria-label="Detailed extra saving outcomes">
                <KeyResult label="Extra monthly saving" value={`${formatCurrency(extraContribution)}/month`} difference={`${formatSignedCurrency(amountDifference)}/month`} />
                <KeyResult label="Pension when you retire" value={formatCurrency(displayedPension)} difference={formatSignedCurrency(pensionDifference)} />
              </div>
            </>
          )}

          <div className="what-if-inline-actions">
            <button type="button" className="ui-button ui-button-secondary ui-button-medium" disabled={!hasChanged} onClick={onReset}>Reset experiment</button>
            <button
              type="button"
              className="ui-button ui-button-primary ui-button-medium"
              disabled={!hasChanged || !canSave}
              title={saveAlreadyExists ? "This extra-saving experiment is already saved." : undefined}
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
            <summary><span><strong>Why did this change?</strong><small>See how the amount and timing affect the result.</small></span><span aria-hidden="true">+</span></summary>
            <ul className="what-if-detail-list">
              {reasons(baselineExtraContribution, baselineExtraContributionAge, extraContribution, extraContributionAge).map((reason) => (
                <li key={reason}><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>{reason}</span></li>
              ))}
            </ul>
          </details>
          <details className="what-if-detail-card">
            <summary><span><strong>Detailed comparison</strong><small>Compare this scheduled saving with your saved plan.</small></span><span aria-hidden="true">+</span></summary>
            <div className="what-if-detail-comparison">
              <OutcomeCard
                label="Extra monthly saving"
                baseline={baselineHasExtra ? `${formatCurrency(baselineExtraContribution)}/month` : "Not included"}
                experiment={experimentHasExtra ? `${formatCurrency(extraContribution)}/month` : "Not included"}
                difference={`${formatSignedCurrency(amountDifference)}/month`}
              />
              <OutcomeCard
                label="Start age"
                baseline={baselineHasExtra ? `Age ${baselineExtraContributionAge}` : "Not included"}
                experiment={experimentHasExtra ? `Age ${extraContributionAge}` : "Not included"}
                difference={baselineHasExtra && experimentHasExtra ? formatSignedYears(ageDifference) : experimentHasExtra ? "Added" : "Removed"}
              />
              <OutcomeCard
                label="Pension when you retire"
                baseline={formatCurrency(displayedBaselinePension)}
                experiment={formatCurrency(displayedPension)}
                difference={formatSignedCurrency(pensionDifference)}
              />
            </div>
          </details>
        </div>
      )}

      {displayMode === "nominal" && hasChanged && (
        <p className="what-if-money-basis-note">Future-money figures show the estimated pound value at retirement. The extra saving amount remains the monthly amount you entered.</p>
      )}
      {saveMessage && <p className="what-if-save-message" role="status">{saveMessage}</p>}
    </section>
  );
}

function AmountSlider({ baseline, amount, maximum, markers, onChange }: {
  baseline: number;
  amount: number;
  maximum: number;
  markers: SavedExtraSavingMarker[];
  onChange: (amount: number) => void;
}) {
  const baselinePosition = maximum <= 0 ? 0 : (baseline / maximum) * 100;
  return (
    <div className="what-if-slider-wrap what-if-slider-wrap-primary what-if-contribution-slider">
      <div className="what-if-contribution-range-track">
        <input
          type="range"
          min={0}
          max={maximum}
          step={25}
          value={amount}
          aria-label="Experimental extra monthly contribution"
          aria-valuetext={`${formatCurrency(amount)} per month`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="what-if-contribution-saved-marker" style={{ left: `${baselinePosition}%` }} title={`Saved plan · ${formatCurrency(baseline)}/month`} aria-hidden="true" />
        {markers.filter((marker) => marker.amount >= 0 && marker.amount <= maximum).map((marker) => (
          <span
            key={marker.id}
            className={`what-if-contribution-experiment-marker what-if-marker-tone-${(marker.markerNumber - 1) % 6}`}
            style={{ left: `${(marker.amount / maximum) * 100}%` }}
            title={`${marker.markerNumber}. ${marker.name} · ${formatCurrency(marker.amount)}/month`}
            aria-hidden="true"
          >
            {marker.markerNumber}
          </span>
        ))}
      </div>
      <div className="what-if-slider-labels what-if-contribution-slider-labels" aria-hidden="true">
        <span>£0</span>
        <span className="what-if-contribution-saved-label" style={{ left: `${baselinePosition}%` }}>Saved · {formatCurrency(baseline)}</span>
        <span>{formatCurrency(maximum)}</span>
      </div>
    </div>
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
      <span>{label}</span>
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${toneSuffix(difference)}`}>{difference}</em>
    </article>
  );
}

function extraSavingNote(baselineAmount: number, baselineAge: number, amount: number, age: number): string {
  if (baselineAmount === amount && (amount === 0 || baselineAge === age)) return "Same as your saved plan";
  if (baselineAmount === 0 && amount > 0) return `New extra saving from age ${age}`;
  if (amount === 0) return "Scheduled extra saving removed";
  const amountChange = formatSignedCurrency(amount - baselineAmount);
  if (baselineAge === age) return `${amountChange}/month from the same age`;
  return `${amountChange}/month · starts ${Math.abs(age - baselineAge)} ${Math.abs(age - baselineAge) === 1 ? "year" : "years"} ${age < baselineAge ? "earlier" : "later"}`;
}

function statusText(amountDifference: number, ageDifference: number): string {
  if (amountDifference > 0) return "Saving extra";
  if (amountDifference < 0) return "Saving less later";
  if (ageDifference < 0) return "Starting earlier";
  if (ageDifference > 0) return "Starting later";
  return "Saved plan";
}

function simpleTitle(amountDifference: number, ageDifference: number): string {
  if (amountDifference > 0) return "Extra saving gives your pension more to build on";
  if (amountDifference < 0) return "Reducing future extra saving lowers the pension at retirement";
  if (ageDifference < 0) return "Starting the extra saving earlier gives it more time to grow";
  return "Starting the extra saving later gives it less time to grow";
}

function simpleExplanation(amount: number, age: number, pensionDifference: number, yearsToRetirement: number, hasChanged: boolean): string {
  if (!hasChanged) return "Change the extra monthly amount or start age to see how scheduled future saving could affect your pension at retirement.";
  const savingText = amount > 0 ? `${formatCurrency(amount)}/month from age ${age}` : "No scheduled extra monthly saving";
  return `${savingText}. Across the ${yearsToRetirement} years to retirement, your projected pension is ${formatCurrency(Math.abs(pensionDifference))} ${pensionDifference >= 0 ? "higher" : "lower"} than your saved plan.`;
}

function detailedExplanation(baselineAmount: number, baselineAge: number, amount: number, age: number, pensionDifference: number): string {
  if (baselineAmount === amount && (amount === 0 || baselineAge === age)) return "Change the amount or start age to see how a scheduled extra payment affects the pension you could have at retirement.";
  const baselineText = baselineAmount > 0 ? `${formatCurrency(baselineAmount)}/month from age ${baselineAge}` : "no scheduled extra saving";
  const experimentText = amount > 0 ? `${formatCurrency(amount)}/month from age ${age}` : "no scheduled extra saving";
  return `Your saved plan has ${baselineText}; this experiment uses ${experimentText}. Your projected pension changes by ${formatSignedCurrency(pensionDifference)}.`;
}

function reasons(baselineAmount: number, baselineAge: number, amount: number, age: number): string[] {
  const result: string[] = [];
  if (amount > baselineAmount) result.push("A larger extra monthly payment puts more money into the pension before retirement.");
  else if (amount < baselineAmount) result.push("A smaller extra monthly payment reduces the amount added before retirement.");
  else result.push("The extra monthly amount is unchanged.");

  if (amount > 0 && baselineAmount > 0 && age < baselineAge) result.push("Starting earlier gives each extra payment more time to benefit from investment growth.");
  else if (amount > 0 && baselineAmount > 0 && age > baselineAge) result.push("Starting later gives the extra payments fewer years to be invested.");
  else if (amount > 0) result.push(`The extra saving is modelled from age ${age} until retirement.`);
  else result.push("No scheduled extra payment is included in this experiment.");
  return result;
}

function roundUp(value: number, interval: number): number {
  return Math.ceil(value / interval) * interval;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "£0";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatPlainCurrencyDifference(value: number): string {
  if (Math.abs(value) < 0.5) return "About the same";
  return `${formatCurrency(Math.abs(value))} ${value > 0 ? "more" : "less"}`;
}

function formatSignedYears(value: number): string {
  if (value === 0) return "No change";
  const years = Math.abs(value);
  return `${value > 0 ? "+" : "−"}${years} ${years === 1 ? "year" : "years"}`;
}

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("−") || value.startsWith("-") || value === "Removed") return " is-negative";
  if (value === "Added") return " is-positive";
  return "";
}

function toneClassName(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return "is-negative";
  return undefined;
}
