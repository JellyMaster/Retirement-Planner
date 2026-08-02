import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface ContributionExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  baselineEmployeeContribution: number;
  employeeContribution: number;
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
  onExtraContributionEnabledChange,
  onExtraContributionChange,
  onReset,
  onSave,
}: ContributionExperimentProps) {
  const regularDifference = employeeContribution - baselineEmployeeContribution;
  const selectedExtra = includeExtraContribution ? extraContribution : 0;
  const extraDifference = selectedExtra - baselineExtraContribution;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const hasChanged = regularDifference !== 0 || extraDifference !== 0;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const regularMaximum = roundUp(
    Math.max(2_000, baselineEmployeeContribution * 2, employeeContribution),
    250,
  );
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
            Adjust personal pension payments while keeping retirement age, employer
            contributions and investment assumptions unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <ContributionSlider
          label="Your regular contribution"
          value={`${formatCurrency(employeeContribution)}/month`}
          detail={`Employer continues to add ${formatCurrency(employerContribution)}/month`}
          minimum={0}
          maximum={regularMaximum}
          valueNumber={employeeContribution}
          savedValue={baselineEmployeeContribution}
          ariaLabel="Experimental monthly employee contribution"
          onChange={onEmployeeContributionChange}
        />

        <div className="what-if-control-panel what-if-extra-control">
          <div className="what-if-control-copy">
            <span>Scheduled extra contribution</span>
            <strong>
              {includeExtraContribution
                ? `${formatCurrency(extraContribution)}/month`
                : "Not included"}
            </strong>
            <small>
              {includeExtraContribution
                ? `Starts at age ${extraContributionAge}`
                : "See the result without a later contribution increase"}
            </small>
          </div>

          <div className="what-if-extra-controls">
            <label className="what-if-toggle-row">
              <span>
                <strong>Include a future extra contribution</strong>
                <small>
                  Compare the plan with or without an additional monthly payment.
                </small>
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
              <input
                type="range"
                min={0}
                max={extraMaximum}
                step={25}
                value={extraContribution}
                disabled={!includeExtraContribution}
                aria-label="Experimental extra monthly contribution"
                aria-valuetext={`${formatCurrency(extraContribution)} per month`}
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

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.concepts.pension} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>{createStoryTitle(regularDifference, extraDifference)}</h3>
          <p>
            {createStoryDescription({
              regularDifference,
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
            <h3 id="contribution-outcomes-title">How saving more changes the plan</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard
            label="Your monthly contribution"
            baseline={formatCurrency(baselineEmployeeContribution)}
            experiment={formatCurrency(employeeContribution)}
            difference={formatSignedCurrency(regularDifference)}
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
              ["Annual retirement income", `${formatSignedCurrency(incomeDifference)}/year`],
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
            {createReasons(regularDifference, extraDifference, yearsToRetirement).map(
              (reason) => (
                <li key={reason}>
                  <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                  <span>{reason}</span>
                </li>
              ),
            )}
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Move a slider to begin"}</strong>
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

function ContributionSlider({
  label,
  value,
  detail,
  minimum,
  maximum,
  valueNumber,
  savedValue,
  ariaLabel,
  onChange,
}: {
  label: string;
  value: string;
  detail: string;
  minimum: number;
  maximum: number;
  valueNumber: number;
  savedValue: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="what-if-control-panel">
      <div className="what-if-control-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <div className="what-if-slider-wrap">
        <input
          type="range"
          min={minimum}
          max={maximum}
          step={25}
          value={valueNumber}
          aria-label={ariaLabel}
          aria-valuetext={`${formatCurrency(valueNumber)} per month`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="what-if-slider-labels" aria-hidden="true">
          <span>{formatCurrency(minimum)}</span>
          <span>Saved · {formatCurrency(savedValue)}</span>
          <span>{formatCurrency(maximum)}</span>
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
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${toneSuffix(difference)}`}>{difference}</em>
    </article>
  );
}

function createStoryTitle(regularDifference: number, extraDifference: number): string {
  if (regularDifference === 0 && extraDifference === 0) return "The saved contribution plan is unchanged";
  if (regularDifference > 0 || extraDifference > 0) return "Putting more aside could strengthen the retirement outcome";
  return "Reducing contributions gives the pension less money and time to grow";
}

function createStoryDescription({
  regularDifference,
  selectedExtra,
  includeExtraContribution,
  extraContributionAge,
  pensionDifference,
  yearsToRetirement,
}: {
  regularDifference: number;
  selectedExtra: number;
  includeExtraContribution: boolean;
  extraContributionAge: number;
  pensionDifference: number;
  yearsToRetirement: number;
}): string {
  if (regularDifference === 0 && pensionDifference === 0) {
    return "Move either contribution control to see how a different saving pattern affects the plan.";
  }

  const regularText = regularDifference === 0
    ? "The regular monthly contribution stays unchanged."
    : `The regular monthly contribution changes by ${formatSignedCurrency(regularDifference)}.`;
  const extraText = includeExtraContribution
    ? ` An additional ${formatCurrency(selectedExtra)} a month begins at age ${extraContributionAge}.`
    : " The scheduled extra contribution is excluded.";
  const outcomeText = ` Across the ${yearsToRetirement} years to retirement, the projected pension changes by ${formatSignedCurrency(pensionDifference)}.`;
  return `${regularText}${extraText}${outcomeText}`;
}

function createReasons(
  regularDifference: number,
  extraDifference: number,
  yearsToRetirement: number,
): string[] {
  if (regularDifference === 0 && extraDifference === 0) {
    return [
      "The experiment currently matches the saved contribution plan.",
      "Employer contributions remain unchanged.",
      "Move a slider to create a temporary alternative.",
    ];
  }

  return [
    regularDifference >= 0
      ? "Higher regular payments add more money throughout the accumulation period."
      : "Lower regular payments reduce the amount invested each month.",
    extraDifference >= 0
      ? "A larger scheduled contribution creates an additional stream of pension saving."
      : "A lower or removed scheduled contribution reduces future payments.",
    `${yearsToRetirement} years remain for changed contributions to receive investment growth.`,
  ];
}

function roundUp(value: number, interval: number): number {
  return Math.ceil(value / interval) * interval;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("-")) return " is-negative";
  return "";
}

function toneClass(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("-")) return "is-negative";
  return undefined;
}
