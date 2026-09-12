import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useScenarios } from "../scenarios";
import { AppIcons } from "../../icons";
import "../../styles/what-if-view-modes.css";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfScenarios } from "./WhatIfScenarioContext";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

interface ContributionExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  baselineEmployeeContribution: number;
  employeeContribution: number;
  baselineEmployerContribution: number;
  employerContribution: number;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  onEmployeeContributionChange: (amount: number) => void;
  onEmployerContributionChange: (amount: number) => void;
  onReset: () => void;
  onSave: () => void;
}

interface SavedContributionMarker {
  id: string;
  name: string;
  markerNumber: number;
  employeeContribution: number;
  employerContribution: number;
}

export function ContributionExperiment({
  activePlanName,
  currentAge,
  retirementAge,
  baselineEmployeeContribution,
  employeeContribution,
  baselineEmployerContribution,
  employerContribution,
  baselineProjectedPension,
  projectedPension,
  canSave,
  saveMessage,
  onEmployeeContributionChange,
  onEmployerContributionChange,
  onReset,
  onSave,
}: ContributionExperimentProps) {
  const { activeScenario } = useScenarios();
  const { scenarios: whatIfScenarios } = useWhatIfScenarios();
  const { viewMode, displayMode } = useWhatIfDisplaySettings();
  const employeeDifference = employeeContribution - baselineEmployeeContribution;
  const employerDifference = employerContribution - baselineEmployerContribution;
  const hasChanged = employeeDifference !== 0 || employerDifference !== 0;
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
  const totalSavedContribution = baselineEmployeeContribution + baselineEmployerContribution;
  const totalExperimentContribution = employeeContribution + employerContribution;
  const regularDifference = totalExperimentContribution - totalSavedContribution;
  const saveAlreadyExists = hasChanged && !canSave && saveMessage === null;
  const savedContributionMarkers: SavedContributionMarker[] = whatIfScenarios
    .filter(
      (scenario) =>
        scenario.baseScenarioId === activeScenario.id &&
        scenario.experimentType === "contributions",
    )
    .map((scenario, index) => ({
      id: scenario.id,
      name: scenario.name,
      markerNumber: index + 1,
      employeeContribution: scenario.inputs.monthlyEmployeeContribution,
      employerContribution: scenario.inputs.monthlyEmployerContribution,
    }));
  const employeeMaximum = contributionMaximum(
    baselineEmployeeContribution,
    employeeContribution,
    savedContributionMarkers.map((marker) => marker.employeeContribution),
  );
  const employerMaximum = contributionMaximum(
    baselineEmployerContribution,
    employerContribution,
    savedContributionMarkers.map((marker) => marker.employerContribution),
  );

  return (
    <section
      className="what-if-workspace what-if-workspace-compact what-if-contribution-experiment"
      aria-labelledby="contribution-experiment-title"
    >
      <header className="what-if-workspace-header what-if-workspace-header-compact">
        <div>
          <p className="planner-eyebrow">What if</p>
          <h2 id="contribution-experiment-title">Save more</h2>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-decision-layout">
        <section className="what-if-change-panel" aria-labelledby="contribution-change-title">
          <div className="what-if-panel-heading">
            <p className="planner-eyebrow">Change</p>
            <h3 id="contribution-change-title">How much goes into your pension each month?</h3>
            <p>Change what you pay in and what your employer contributes. Everything else stays the same.</p>
          </div>
          <div className="what-if-contribution-levers">
            <ContributionLever
              label="Your contribution"
              baseline={baselineEmployeeContribution}
              amount={employeeContribution}
              maximum={employeeMaximum}
              markers={savedContributionMarkers.map((marker) => ({
                id: marker.id,
                name: marker.name,
                markerNumber: marker.markerNumber,
                amount: marker.employeeContribution,
              }))}
              ariaLabel="Experimental monthly employee contribution change"
              onChange={onEmployeeContributionChange}
            />
            <ContributionLever
              label="Employer contribution"
              baseline={baselineEmployerContribution}
              amount={employerContribution}
              maximum={employerMaximum}
              markers={savedContributionMarkers.map((marker) => ({
                id: marker.id,
                name: marker.name,
                markerNumber: marker.markerNumber,
                amount: marker.employerContribution,
              }))}
              ariaLabel="Experimental monthly employer contribution change"
              onChange={onEmployerContributionChange}
            />
          </div>
          {savedContributionMarkers.length > 0 && (
            <p className="what-if-contribution-marker-key">
              Numbered markers match the saved experiments in the panel. The same number and colour identify an experiment on both sliders.
            </p>
          )}
          <div className="what-if-contribution-total">
            <span>Total going into your pension</span>
            <strong>{formatCurrency(totalExperimentContribution)}/month</strong>
            <small>
              {regularDifference === 0
                ? "Same as your saved plan"
                : `${formatSignedCurrency(regularDifference)}/month compared with your saved plan`}
            </small>
          </div>
        </section>

        <section className="what-if-result-panel" aria-labelledby="contribution-outcome-title" aria-live="polite">
          <div className="what-if-result-heading">
            <div>
              <p className="planner-eyebrow">Outcome</p>
              <h3 id="contribution-outcome-title">
                {hasChanged ? "What your saving change could do" : "Your saved contribution plan"}
              </h3>
            </div>
            <span className="what-if-result-status is-neutral">
              {hasChanged ? contributionStatus(regularDifference) : "Saved plan"}
            </span>
          </div>

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-results" aria-label="Simple saving outcomes">
                <SimpleResult
                  value={`${formatCurrency(totalExperimentContribution)}/month`}
                  label="Total going into your pension"
                  note={regularDifference === 0 ? "Same as your saved plan" : `${formatSignedCurrency(regularDifference)}/month compared with your saved plan`}
                  tone={regularDifference > 0 ? "positive" : regularDifference < 0 ? "negative" : "neutral"}
                />
                <SimpleResult
                  value={formatCurrency(displayedPension)}
                  label="Pension when you retire"
                  note={hasChanged ? `${formatPlainCurrencyDifference(pensionDifference)} than your saved plan` : `Your pension at age ${retirementAge}`}
                  tone={pensionDifference > 0 ? "positive" : pensionDifference < 0 ? "negative" : "neutral"}
                />
              </div>
              <div className="what-if-simple-outcome-copy">
                <strong>{hasChanged ? createSimpleTitle(regularDifference, pensionDifference) : `${activePlanName} is unchanged`}</strong>
                <p>{createSimpleExplanation(regularDifference, pensionDifference, yearsToRetirement)}</p>
              </div>
            </>
          ) : (
            <>
              <div className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}>
                <span className="what-if-story-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={AppIcons.concepts.pension} fixedWidth />
                </span>
                <div>
                  <strong>What changing your regular contributions does</strong>
                  <p>{createDetailedExplanation(employeeDifference, employerDifference, pensionDifference, yearsToRetirement)}</p>
                </div>
              </div>
              <div className="what-if-key-results" aria-label="Detailed saving outcomes">
                <KeyResult
                  label="Total regular contributions"
                  value={`${formatCurrency(totalExperimentContribution)}/month`}
                  difference={`${formatSignedCurrency(regularDifference)}/month`}
                />
                <KeyResult
                  label="Pension when you retire"
                  value={formatCurrency(displayedPension)}
                  difference={formatSignedCurrency(pensionDifference)}
                />
              </div>
            </>
          )}

          <div className="what-if-inline-actions">
            <button type="button" className="ui-button ui-button-secondary ui-button-medium" disabled={!hasChanged} onClick={onReset}>
              Reset experiment
            </button>
            <button
              type="button"
              className="ui-button ui-button-primary ui-button-medium"
              disabled={!hasChanged || !canSave}
              title={saveAlreadyExists ? "This saving experiment is already saved." : undefined}
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
              <span><strong>Why did this change?</strong><small>See what is driving the change in your pension.</small></span>
              <span aria-hidden="true">+</span>
            </summary>
            <ul className="what-if-detail-list">
              {createReasons(employeeDifference, employerDifference).map((reason) => (
                <li key={reason}><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>{reason}</span></li>
              ))}
            </ul>
          </details>
          <details className="what-if-detail-card">
            <summary>
              <span><strong>Detailed comparison</strong><small>Compare the regular contributions with your saved plan.</small></span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="what-if-detail-comparison">
              <OutcomeCard label="Your monthly contribution" baseline={`${formatCurrency(baselineEmployeeContribution)}/month`} experiment={`${formatCurrency(employeeContribution)}/month`} difference={`${formatSignedCurrency(employeeDifference)}/month`} />
              <OutcomeCard label="Employer contribution" baseline={`${formatCurrency(baselineEmployerContribution)}/month`} experiment={`${formatCurrency(employerContribution)}/month`} difference={`${formatSignedCurrency(employerDifference)}/month`} />
              <OutcomeCard label="Total regular contributions" baseline={`${formatCurrency(totalSavedContribution)}/month`} experiment={`${formatCurrency(totalExperimentContribution)}/month`} difference={`${formatSignedCurrency(regularDifference)}/month`} />
              <OutcomeCard label="Pension when you retire" baseline={formatCurrency(displayedBaselinePension)} experiment={formatCurrency(displayedPension)} difference={formatSignedCurrency(pensionDifference)} />
            </div>
          </details>
        </div>
      )}

      {displayMode === "nominal" && hasChanged && (
        <p className="what-if-money-basis-note">Future-money figures show the estimated pound value at retirement. The contribution amounts above remain the monthly amounts you entered.</p>
      )}
      {saveMessage && <p className="what-if-save-message" role="status">{saveMessage}</p>}
    </section>
  );
}

function ContributionLever({ label, baseline, amount, maximum, markers, ariaLabel, onChange }: {
  label: string;
  baseline: number;
  amount: number;
  maximum: number;
  markers: Array<{ id: string; name: string; markerNumber: number; amount: number }>;
  ariaLabel: string;
  onChange: (amount: number) => void;
}) {
  const difference = amount - baseline;
  return (
    <div className="what-if-contribution-lever">
      <div className="what-if-contribution-lever-heading">
        <span>{label}</span>
        <strong>{formatCurrency(amount)}/month</strong>
        <small>Saved: {formatCurrency(baseline)} · {formatSignedCurrency(difference)}</small>
      </div>
      <AbsoluteContributionSlider baseline={baseline} amount={amount} maximum={maximum} markers={markers} ariaLabel={ariaLabel} onChange={onChange} />
    </div>
  );
}

function AbsoluteContributionSlider({ baseline, amount, maximum, markers, ariaLabel, onChange }: {
  baseline: number;
  amount: number;
  maximum: number;
  markers: Array<{ id: string; name: string; markerNumber: number; amount: number }>;
  ariaLabel: string;
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
          aria-label={ariaLabel}
          aria-valuetext={`${formatCurrency(amount)} per month; saved amount ${formatCurrency(baseline)}`}
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

function createSimpleTitle(regularDifference: number, pensionDifference: number): string {
  if (regularDifference > 0) return "More going in each month gives your pension more to build on";
  if (regularDifference < 0) return "Less going in each month reduces what reaches retirement";
  if (pensionDifference !== 0) return "The contribution change affects your pension at retirement";
  return "Your regular monthly saving is unchanged";
}

function createSimpleExplanation(regularDifference: number, pensionDifference: number, yearsToRetirement: number): string {
  if (regularDifference === 0 && pensionDifference === 0) return "Change either contribution to see how the combined monthly amount affects the pension you could have at retirement.";
  return `${formatCurrency(Math.abs(regularDifference))} ${regularDifference >= 0 ? "more" : "less"} goes into your pension each month. Across the ${yearsToRetirement} years to retirement, your projected pension is ${formatCurrency(Math.abs(pensionDifference))} ${pensionDifference >= 0 ? "higher" : "lower"} than your saved plan.`;
}

function createDetailedExplanation(employeeDifference: number, employerDifference: number, pensionDifference: number, yearsToRetirement: number): string {
  if (employeeDifference === 0 && employerDifference === 0) return "Change either regular contribution to see how the amount entering your pension each month affects the pension you could have at retirement.";
  const regularDifference = employeeDifference + employerDifference;
  const regularText = regularDifference === 0
    ? "Your combined regular monthly contributions are unchanged, but the split between you and your employer is different."
    : `Your combined regular monthly contributions change by ${formatSignedCurrency(regularDifference)}.`;
  return `${regularText} Across the ${yearsToRetirement} years to retirement, your projected pension changes by ${formatSignedCurrency(pensionDifference)}.`;
}

function createReasons(employeeDifference: number, employerDifference: number): string[] {
  if (employeeDifference === 0 && employerDifference === 0) {
    return ["Your personal contribution is unchanged.", "Your employer contribution is unchanged."];
  }
  return [
    employeeDifference === 0
      ? "Your personal contribution is unchanged."
      : employeeDifference > 0
        ? "Higher personal payments add more money throughout the accumulation period."
        : "Lower personal payments reduce the amount invested each month.",
    employerDifference === 0
      ? "Your employer contribution is unchanged."
      : employerDifference > 0
        ? "A higher employer payment increases the regular amount entering the pension."
        : "A lower employer payment reduces the regular pension funding.",
  ];
}

function contributionStatus(difference: number): string {
  if (difference > 0) return "Saving more";
  if (difference < 0) return "Saving less";
  return "Contribution mix changed";
}

function contributionMaximum(baseline: number, amount: number, savedExperimentAmounts: number[]): number {
  return roundUp(Math.max(1_000, baseline + 1_000, amount, ...savedExperimentAmounts), 250);
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

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return " is-negative";
  return "";
}

function toneClassName(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return "is-negative";
  return undefined;
}
