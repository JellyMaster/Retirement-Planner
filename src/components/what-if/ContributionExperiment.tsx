import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useScenarios } from "../scenarios";
import { AppIcons } from "../../icons";
import "../../styles/what-if-view-modes.css";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

const CONTRIBUTION_HEADROOM = 1_000;

interface ContributionExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  baselineEmployeeContribution: number;
  employeeContribution: number;
  baselineEmployerContribution: number;
  employerContribution: number;
  baselineExtraContribution: number;
  baselineExtraContributionAge: number;
  extraContribution: number;
  extraContributionAge: number;
  includeExtraContribution: boolean;
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
  onExtraContributionEnabledChange: (enabled: boolean) => void;
  onExtraContributionChange: (amount: number) => void;
  onExtraContributionAgeChange: (age: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function ContributionExperiment({
  activePlanName,
  currentAge,
  retirementAge,
  baselineEmployeeContribution,
  employeeContribution,
  baselineEmployerContribution,
  employerContribution,
  baselineExtraContribution,
  baselineExtraContributionAge,
  extraContribution,
  extraContributionAge,
  includeExtraContribution,
  baselineProjectedPension,
  projectedPension,
  canSave,
  saveMessage,
  onEmployeeContributionChange,
  onEmployerContributionChange,
  onExtraContributionEnabledChange,
  onExtraContributionChange,
  onExtraContributionAgeChange,
  onReset,
  onSave,
}: ContributionExperimentProps) {
  const { activeScenario } = useScenarios();
  const { viewMode, displayMode } = useWhatIfDisplaySettings();
  const employeeDifference = employeeContribution - baselineEmployeeContribution;
  const employerDifference = employerContribution - baselineEmployerContribution;
  const selectedExtra = includeExtraContribution ? extraContribution : 0;
  const extraDifference = selectedExtra - baselineExtraContribution;
  const extraAgeDifference = includeExtraContribution
    ? extraContributionAge - baselineExtraContributionAge
    : baselineExtraContribution > 0
      ? -1
      : 0;
  const hasChanged =
    employeeDifference !== 0 ||
    employerDifference !== 0 ||
    extraDifference !== 0 ||
    extraAgeDifference !== 0;
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
  const totalSavedContribution =
    baselineEmployeeContribution + baselineEmployerContribution;
  const totalExperimentContribution = employeeContribution + employerContribution;
  const regularDifference = totalExperimentContribution - totalSavedContribution;
  const extraMaximum = roundUp(
    Math.max(2_000, baselineExtraContribution * 2, extraContribution),
    250,
  );
  const latestExtraContributionAge = Math.max(currentAge, retirementAge - 1);
  const saveAlreadyExists = hasChanged && !canSave && saveMessage === null;

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
            <h3 id="contribution-change-title">
              How much goes into your pension each month?
            </h3>
            <p>
              Change what you pay in and what your employer contributes. Everything else stays
              the same.
            </p>
          </div>
          <div className="what-if-contribution-levers">
            <ContributionLever
              label="Your contribution"
              baseline={baselineEmployeeContribution}
              amount={employeeContribution}
              ariaLabel="Experimental monthly employee contribution change"
              onChange={onEmployeeContributionChange}
            />
            <ContributionLever
              label="Employer contribution"
              baseline={baselineEmployerContribution}
              amount={employerContribution}
              ariaLabel="Experimental monthly employer contribution change"
              onChange={onEmployerContributionChange}
            />
          </div>
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

        <section
          className="what-if-result-panel"
          aria-labelledby="contribution-outcome-title"
          aria-live="polite"
        >
          <div className="what-if-result-heading">
            <div>
              <p className="planner-eyebrow">Outcome</p>
              <h3 id="contribution-outcome-title">
                {hasChanged ? "What your saving change could do" : "Your saved contribution plan"}
              </h3>
            </div>
            <span className="what-if-result-status is-neutral">
              {hasChanged
                ? contributionStatus(employeeDifference, employerDifference, extraDifference)
                : "Saved plan"}
            </span>
          </div>

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-results" aria-label="Simple saving outcomes">
                <SimpleResult
                  value={`${formatCurrency(totalExperimentContribution)}/month`}
                  label="Total going into your pension"
                  note={
                    regularDifference === 0
                      ? "Same as your saved plan"
                      : `${formatSignedCurrency(regularDifference)}/month compared with your saved plan`
                  }
                  tone={
                    regularDifference > 0
                      ? "positive"
                      : regularDifference < 0
                        ? "negative"
                        : "neutral"
                  }
                />
                <SimpleResult
                  value={formatCurrency(displayedPension)}
                  label="Pension when you retire"
                  note={
                    hasChanged
                      ? `${formatPlainCurrencyDifference(pensionDifference)} than your saved plan`
                      : `Your pension at age ${retirementAge}`
                  }
                  tone={
                    pensionDifference > 0
                      ? "positive"
                      : pensionDifference < 0
                        ? "negative"
                        : "neutral"
                  }
                />
              </div>
              <div className="what-if-simple-outcome-copy">
                <strong>
                  {hasChanged
                    ? createSimpleTitle(regularDifference, pensionDifference)
                    : `${activePlanName} is unchanged`}
                </strong>
                <p>
                  {createSimpleExplanation(
                    regularDifference,
                    pensionDifference,
                    yearsToRetirement,
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}>
                <span className="what-if-story-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={AppIcons.concepts.pension} fixedWidth />
                </span>
                <div>
                  <strong>What changing your saving does</strong>
                  <p>
                    {createDetailedExplanation(
                      employeeDifference,
                      employerDifference,
                      extraDifference,
                      extraAgeDifference,
                      pensionDifference,
                      yearsToRetirement,
                    )}
                  </p>
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
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-medium"
              disabled={!hasChanged}
              onClick={onReset}
            >
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
              <span>
                <strong>Scheduled future saving</strong>
                <small>Add an extra monthly payment later in the plan.</small>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="what-if-controls-stack">
              <div className="what-if-control-panel what-if-extra-control">
                <div className="what-if-control-copy">
                  <span>Scheduled extra contribution</span>
                  <strong>
                    {includeExtraContribution
                      ? `${formatCurrency(extraContribution)}/month from age ${extraContributionAge}`
                      : "Not included"}
                  </strong>
                  <small>
                    Saved plan:{" "}
                    {baselineExtraContribution > 0
                      ? `${formatCurrency(baselineExtraContribution)}/month from age ${baselineExtraContributionAge}`
                      : "not included"}
                  </small>
                </div>
                <div className="what-if-extra-controls">
                  <label className="what-if-toggle-row">
                    <span>
                      <strong>Include a scheduled extra payment</strong>
                      <small>Choose the monthly amount and when it begins.</small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={includeExtraContribution}
                      aria-label="Include scheduled extra contribution"
                      onChange={(event) =>
                        onExtraContributionEnabledChange(event.target.checked)
                      }
                    />
                  </label>
                  <div className="what-if-slider-wrap">
                    <label htmlFor="what-if-extra-contribution-age">
                      <strong>Start age: {extraContributionAge}</strong>
                    </label>
                    <input
                      id="what-if-extra-contribution-age"
                      type="range"
                      min={currentAge}
                      max={latestExtraContributionAge}
                      step={1}
                      value={extraContributionAge}
                      disabled={!includeExtraContribution}
                      aria-label="Experimental extra contribution start age"
                      aria-valuetext={`Starts at age ${extraContributionAge}`}
                      onChange={(event) =>
                        onExtraContributionAgeChange(Number(event.target.value))
                      }
                    />
                    <div className="what-if-slider-labels" aria-hidden="true">
                      <span>Age {currentAge}</span>
                      <span>Saved · age {baselineExtraContributionAge}</span>
                      <span>Age {latestExtraContributionAge}</span>
                    </div>
                  </div>
                  <div className="what-if-slider-wrap">
                    <label htmlFor="what-if-extra-contribution-amount">
                      <strong>Monthly amount: {formatCurrency(extraContribution)}</strong>
                    </label>
                    <input
                      id="what-if-extra-contribution-amount"
                      type="range"
                      min={0}
                      max={extraMaximum}
                      step={25}
                      value={extraContribution}
                      disabled={!includeExtraContribution}
                      aria-label="Experimental extra monthly contribution"
                      aria-valuetext={`${formatCurrency(extraContribution)} per month from age ${extraContributionAge}`}
                      onChange={(event) =>
                        onExtraContributionChange(Number(event.target.value))
                      }
                    />
                    <div className="what-if-slider-labels" aria-hidden="true">
                      <span>£0</span>
                      <span>Saved · {formatCurrency(baselineExtraContribution)}</span>
                      <span>{formatCurrency(extraMaximum)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </details>
          <details className="what-if-detail-card">
            <summary>
              <span>
                <strong>Why did this change?</strong>
                <small>See what is driving the change in your pension.</small>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <ul className="what-if-detail-list">
              {createReasons({
                employeeDifference,
                employerDifference,
                extraDifference,
                extraAgeDifference,
                extraContributionAge,
                yearsToRetirement,
              }).map((reason) => (
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
                <small>Compare the saving pattern with your saved plan.</small>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="what-if-detail-comparison">
              <OutcomeCard
                label="Your monthly contribution"
                baseline={`${formatCurrency(baselineEmployeeContribution)}/month`}
                experiment={`${formatCurrency(employeeContribution)}/month`}
                difference={`${formatSignedCurrency(employeeDifference)}/month`}
              />
              <OutcomeCard
                label="Employer contribution"
                baseline={`${formatCurrency(baselineEmployerContribution)}/month`}
                experiment={`${formatCurrency(employerContribution)}/month`}
                difference={`${formatSignedCurrency(employerDifference)}/month`}
              />
              <OutcomeCard
                label="Total regular contributions"
                baseline={`${formatCurrency(totalSavedContribution)}/month`}
                experiment={`${formatCurrency(totalExperimentContribution)}/month`}
                difference={`${formatSignedCurrency(regularDifference)}/month`}
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
        <p className="what-if-money-basis-note">
          Future-money figures show the estimated pound value at retirement. The saving amounts
          above remain the monthly amounts you entered.
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

function ContributionLever({
  label,
  baseline,
  amount,
  ariaLabel,
  onChange,
}: {
  label: string;
  baseline: number;
  amount: number;
  ariaLabel: string;
  onChange: (amount: number) => void;
}) {
  const difference = amount - baseline;

  return (
    <div className="what-if-contribution-lever">
      <div className="what-if-contribution-lever-heading">
        <span>{label}</span>
        <strong>{formatCurrency(amount)}/month</strong>
        <small>
          Saved: {formatCurrency(baseline)} · {formatSignedCurrency(difference)}
        </small>
      </div>
      <AbsoluteContributionSlider
        baseline={baseline}
        amount={amount}
        ariaLabel={ariaLabel}
        onChange={onChange}
      />
    </div>
  );
}

function AbsoluteContributionSlider({
  baseline,
  amount,
  ariaLabel,
  onChange,
}: {
  baseline: number;
  amount: number;
  ariaLabel: string;
  onChange: (amount: number) => void;
}) {
  const maximum = roundUp(Math.max(baseline + CONTRIBUTION_HEADROOM, amount), 100);
  const savedPosition = maximum <= 0 ? 0 : Math.min(100, (baseline / maximum) * 100);

  return (
    <div className="what-if-slider-wrap what-if-slider-wrap-primary what-if-absolute-contribution-slider">
      <div className="what-if-absolute-slider-track-wrap">
        <input
          type="range"
          min={0}
          max={maximum}
          step={25}
          value={amount}
          aria-label={ariaLabel}
          aria-valuetext={`${formatCurrency(amount)} per month; saved plan ${formatCurrency(baseline)} per month`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span
          className="what-if-saved-contribution-marker"
          style={{ left: `${savedPosition}%` }}
          title={`Saved plan · ${formatCurrency(baseline)}/month`}
          aria-hidden="true"
        />
      </div>
      <div className="what-if-slider-labels what-if-contribution-slider-labels" aria-hidden="true">
        <span>£0</span>
        <span className="what-if-contribution-saved-label" style={{ left: `${savedPosition}%` }}>
          Saved · {formatCurrency(baseline)}
        </span>
        <span>{formatCurrency(maximum)}</span>
      </div>
    </div>
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

function createSimpleTitle(regularDifference: number, pensionDifference: number): string {
  if (regularDifference > 0) {
    return "More going in each month gives your pension more to build on";
  }
  if (regularDifference < 0) {
    return "Less going in each month reduces what reaches retirement";
  }
  if (pensionDifference !== 0) {
    return "The wider saving changes affect your pension at retirement";
  }
  return "Your regular monthly saving is unchanged";
}

function createSimpleExplanation(
  regularDifference: number,
  pensionDifference: number,
  yearsToRetirement: number,
): string {
  if (regularDifference === 0 && pensionDifference === 0) {
    return "Change either contribution to see how the combined monthly amount affects the pension you could have at retirement.";
  }
  return `${formatCurrency(Math.abs(regularDifference))} ${regularDifference >= 0 ? "more" : "less"} goes into your pension each month. Across the ${yearsToRetirement} years to retirement, your projected pension is ${formatCurrency(Math.abs(pensionDifference))} ${pensionDifference >= 0 ? "higher" : "lower"} than your saved plan.`;
}

function createDetailedExplanation(
  employeeDifference: number,
  employerDifference: number,
  extraDifference: number,
  extraAgeDifference: number,
  pensionDifference: number,
  yearsToRetirement: number,
): string {
  if (
    employeeDifference === 0 &&
    employerDifference === 0 &&
    extraDifference === 0 &&
    extraAgeDifference === 0
  ) {
    return "Change either regular contribution, or use the scheduled-saving options below, to see how the saving pattern affects your pension.";
  }
  const regularDifference = employeeDifference + employerDifference;
  const regularText =
    regularDifference === 0
      ? "Your combined regular monthly contributions are unchanged."
      : `Your combined regular monthly contributions change by ${formatSignedCurrency(regularDifference)}.`;
  const extraText =
    extraDifference === 0 && extraAgeDifference === 0
      ? ""
      : " Your scheduled future contribution also changes.";
  return `${regularText}${extraText} Across the ${yearsToRetirement} years to retirement, your projected pension changes by ${formatSignedCurrency(pensionDifference)}.`;
}

function createReasons({
  employeeDifference,
  employerDifference,
  extraDifference,
  extraAgeDifference,
  extraContributionAge,
  yearsToRetirement,
}: {
  employeeDifference: number;
  employerDifference: number;
  extraDifference: number;
  extraAgeDifference: number;
  extraContributionAge: number;
  yearsToRetirement: number;
}): string[] {
  if (
    employeeDifference === 0 &&
    employerDifference === 0 &&
    extraDifference === 0 &&
    extraAgeDifference === 0
  ) {
    return [
      "Your personal contribution is unchanged.",
      "Your employer contribution is unchanged.",
      "Your scheduled future contribution is unchanged.",
    ];
  }
  return [
    employeeDifference >= 0
      ? "Higher personal payments add more money throughout the accumulation period."
      : "Lower personal payments reduce the amount invested each month.",
    employerDifference >= 0
      ? "A higher employer payment increases the regular amount entering the pension."
      : "A lower employer payment reduces the regular pension funding.",
    extraAgeDifference < 0
      ? `Starting the extra payment at age ${extraContributionAge} gives it more years to compound.`
      : extraAgeDifference > 0
        ? `Starting the extra payment at age ${extraContributionAge} shortens the period over which it is invested.`
        : extraDifference >= 0
          ? `The scheduled extra payment begins from age ${extraContributionAge}.`
          : `Reducing or removing the scheduled payment lowers later contributions across the ${yearsToRetirement}-year saving period.`,
  ];
}

function contributionStatus(
  employeeDifference: number,
  employerDifference: number,
  extraDifference: number,
): string {
  const difference = employeeDifference + employerDifference + extraDifference;
  if (difference > 0) return "Saving more";
  if (difference < 0) return "Saving less";
  return "Timing changed";
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
