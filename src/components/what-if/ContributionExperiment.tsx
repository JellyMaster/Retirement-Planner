import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

const CONTRIBUTION_CHANGE_LIMIT = 1_000;

interface ContributionExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  baselineEmployeeContribution: number;
  employeeContribution: number;
  baselineEmployerContribution: number;
  employerContribution: number;
  baselineExtraContribution: number;
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
  extraContribution,
  extraContributionAge,
  includeExtraContribution,
  baselineProjectedPension,
  projectedPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onEmployeeContributionChange,
  onEmployerContributionChange,
  onExtraContributionEnabledChange,
  onExtraContributionChange,
  onReset,
  onSave,
}: ContributionExperimentProps) {
  const employeeDifference = employeeContribution - baselineEmployeeContribution;
  const employerDifference = employerContribution - baselineEmployerContribution;
  const selectedExtra = includeExtraContribution ? extraContribution : 0;
  const extraDifference = selectedExtra - baselineExtraContribution;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const hasChanged =
    employeeDifference !== 0 ||
    employerDifference !== 0 ||
    extraDifference !== 0;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const totalSavedContribution =
    baselineEmployeeContribution + baselineEmployerContribution;
  const totalExperimentContribution = employeeContribution + employerContribution;
  const extraMaximum = roundUp(
    Math.max(2_000, baselineExtraContribution * 2, extraContribution),
    250,
  );

  return (
    <section className="what-if-workspace" aria-labelledby="contribution-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="contribution-experiment-title">Save more each month</h2>
          <p>
            Adjust your contribution and the employer contribution around the
            amounts saved in the active plan. Retirement timing and investment
            assumptions remain unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <CentredContributionSlider
          label="Your regular contribution"
          baseline={baselineEmployeeContribution}
          amount={employeeContribution}
          ariaLabel="Experimental monthly employee contribution change"
          onChange={onEmployeeContributionChange}
        />

        <CentredContributionSlider
          label="Employer contribution"
          baseline={baselineEmployerContribution}
          amount={employerContribution}
          ariaLabel="Experimental monthly employer contribution change"
          onChange={onEmployerContributionChange}
        />

        <div className="what-if-control-panel what-if-extra-control">
          <div className="what-if-control-copy">
            <span>Extra contribution from age {extraContributionAge}</span>
            <strong>
              {includeExtraContribution
                ? `${formatCurrency(extraContribution)}/month`
                : "Not included"}
            </strong>
            <small>
              This payment begins at age {extraContributionAge}, not at the current
              age of {currentAge}.
            </small>
          </div>

          <div className="what-if-extra-controls">
            <label className="what-if-toggle-row">
              <span>
                <strong>
                  Include the extra payment from age {extraContributionAge}
                </strong>
                <small>
                  It is added only from age {extraContributionAge} until retirement
                  at age {retirementAge}.
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={includeExtraContribution}
                aria-label={`Include extra contribution from age ${extraContributionAge}`}
                onChange={(event) =>
                  onExtraContributionEnabledChange(event.target.checked)
                }
              />
            </label>

            <div className="what-if-slider-wrap">
              <input
                type="range"
                min={0}
                max={extraMaximum}
                step={25}
                value={extraContribution}
                disabled={!includeExtraContribution}
                aria-label={`Experimental extra monthly contribution from age ${extraContributionAge}`}
                aria-valuetext={`${formatCurrency(extraContribution)} per month from age ${extraContributionAge}`}
                onChange={(event) =>
                  onExtraContributionChange(Number(event.target.value))
                }
              />
              <div className="what-if-slider-labels" aria-hidden="true">
                <span>£0 from age {extraContributionAge}</span>
                <span>
                  Saved · {formatCurrency(baselineExtraContribution)} from age {extraContributionAge}
                </span>
                <span>{formatCurrency(extraMaximum)} from age {extraContributionAge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.concepts.pension} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>
            {createStoryTitle(
              employeeDifference,
              employerDifference,
              extraDifference,
            )}
          </h3>
          <p>
            {createStoryDescription({
              employeeDifference,
              employerDifference,
              selectedExtra,
              includeExtraContribution,
              extraContributionAge,
              pensionDifference,
              yearsToRetirement,
            })}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="contribution-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="contribution-outcomes-title">How saving changes the plan</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard
            label="Regular monthly contributions"
            baseline={formatCurrency(totalSavedContribution)}
            experiment={formatCurrency(totalExperimentContribution)}
            difference={formatSignedCurrency(
              totalExperimentContribution - totalSavedContribution,
            )}
          />
          <OutcomeCard
            label="Projected pension"
            baseline={formatCurrency(baselineProjectedPension)}
            experiment={formatCurrency(projectedPension)}
            difference={formatSignedCurrency(pensionDifference)}
          />
          <OutcomeCard
            label="Illustrated annual income"
            baseline={`${formatCurrency(baselineAnnualIncome)}/year`}
            experiment={`${formatCurrency(annualIncome)}/year`}
            difference={`${formatSignedCurrency(incomeDifference)}/year`}
          />
          <OutcomeCard
            label="Target coverage"
            baseline={`${baselinePreparedness}%`}
            experiment={`${preparedness}%`}
            difference={formatSignedPercentage(preparednessDifference)}
          />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            {[
              ["Projected pension", formatSignedCurrency(pensionDifference)],
              [
                "Annual retirement income",
                `${formatSignedCurrency(incomeDifference)}/year`,
              ],
              ["Target coverage", formatSignedPercentage(preparednessDifference)],
            ].map(([label, value]) => (
              <li key={label}>
                <span>{label}</span>
                <strong className={toneClass(value)}>{value}</strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            {createReasons({
              employeeDifference,
              employerDifference,
              extraDifference,
              extraContributionAge,
              yearsToRetirement,
            }).map((reason) => (
              <li key={reason}>
                <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>
            {hasChanged ? "This experiment is temporary" : "Move a slider to begin"}
          </strong>
          <span>
            {hasChanged
              ? "Save it as a scenario only when the outcome is worth keeping."
              : "Your saved plan has not been changed."}
          </span>
        </div>
        <div className="what-if-toolbar-actions">
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
            onClick={onSave}
          >
            Save as scenario
          </button>
        </div>
      </footer>

      {saveMessage && (
        <p className="what-if-save-message" role="status">
          {saveMessage}
        </p>
      )}
    </section>
  );
}

function CentredContributionSlider({
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
    <div className="what-if-control-panel">
      <div className="what-if-control-copy">
        <span>{label}</span>
        <strong>{formatCurrency(amount)}/month</strong>
        <small>
          Saved plan: {formatCurrency(baseline)}/month · {formatSignedCurrency(difference)}
        </small>
      </div>
      <div className="what-if-slider-wrap">
        <input
          type="range"
          min={-CONTRIBUTION_CHANGE_LIMIT}
          max={CONTRIBUTION_CHANGE_LIMIT}
          step={25}
          value={difference}
          aria-label={ariaLabel}
          aria-valuetext={`${formatSignedCurrency(difference)} from the saved amount; ${formatCurrency(amount)} per month`}
          onChange={(event) =>
            onChange(Math.max(0, baseline + Number(event.target.value)))
          }
        />
        <div className="what-if-slider-labels" aria-hidden="true">
          <span>−£1,000</span>
          <span>Saved plan · {formatCurrency(baseline)}</span>
          <span>+£1,000</span>
        </div>
      </div>
    </div>
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
    <article className="what-if-outcome-card">
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

function createStoryTitle(
  employeeDifference: number,
  employerDifference: number,
  extraDifference: number,
): string {
  if (
    employeeDifference === 0 &&
    employerDifference === 0 &&
    extraDifference === 0
  ) {
    return "The saved contribution plan is unchanged";
  }

  if (
    employeeDifference + employerDifference > 0 ||
    extraDifference > 0
  ) {
    return "Putting more aside could strengthen the retirement outcome";
  }

  return "Reducing contributions gives the pension less money and time to grow";
}

function createStoryDescription({
  employeeDifference,
  employerDifference,
  selectedExtra,
  includeExtraContribution,
  extraContributionAge,
  pensionDifference,
  yearsToRetirement,
}: {
  employeeDifference: number;
  employerDifference: number;
  selectedExtra: number;
  includeExtraContribution: boolean;
  extraContributionAge: number;
  pensionDifference: number;
  yearsToRetirement: number;
}): string {
  if (
    employeeDifference === 0 &&
    employerDifference === 0 &&
    pensionDifference === 0
  ) {
    return "Move either regular-contribution slider or change the scheduled extra payment to see how a different saving pattern affects the plan.";
  }

  const employeeText = `Your monthly payment changes by ${formatSignedCurrency(employeeDifference)}.`;
  const employerText = ` The employer payment changes by ${formatSignedCurrency(employerDifference)}.`;
  const extraText = includeExtraContribution
    ? ` An additional ${formatCurrency(selectedExtra)} a month is added from age ${extraContributionAge}, not from today.`
    : ` The extra payment that would begin at age ${extraContributionAge} is excluded.`;
  const outcomeText = ` Across the ${yearsToRetirement} years to retirement, the projected pension changes by ${formatSignedCurrency(pensionDifference)}.`;

  return `${employeeText}${employerText}${extraText}${outcomeText}`;
}

function createReasons({
  employeeDifference,
  employerDifference,
  extraDifference,
  extraContributionAge,
  yearsToRetirement,
}: {
  employeeDifference: number;
  employerDifference: number;
  extraDifference: number;
  extraContributionAge: number;
  yearsToRetirement: number;
}): string[] {
  if (
    employeeDifference === 0 &&
    employerDifference === 0 &&
    extraDifference === 0
  ) {
    return [
      "The experiment currently matches the saved contribution plan.",
      "Both regular contribution sliders are centred on their saved amounts.",
      "Move a slider to create a temporary alternative.",
    ];
  }

  return [
    employeeDifference >= 0
      ? "Higher personal payments add more money throughout the accumulation period."
      : "Lower personal payments reduce the amount invested each month.",
    employerDifference >= 0
      ? "A higher employer payment increases the regular amount entering the pension."
      : "A lower employer payment reduces the regular pension funding.",
    extraDifference >= 0
      ? `The scheduled extra payment begins only from age ${extraContributionAge}.`
      : `Reducing or removing the payment from age ${extraContributionAge} lowers later contributions across the ${yearsToRetirement}-year saving period.`,
  ];
}

function roundUp(value: number, interval: number): number {
  return Math.ceil(value / interval) * interval;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return " is-negative";
  return "";
}

function toneClass(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return "is-negative";
  return undefined;
}
