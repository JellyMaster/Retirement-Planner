import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

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
  includeExtraContributions: boolean;
  extraMonthlyContribution: number;
  baselineExtraMonthlyContribution: number;
  canSave: boolean;
  saveMessage: string | null;
  onRetirementAgeChange: (age: number) => void;
  onExtraContributionEnabledChange: (enabled: boolean) => void;
  onExtraMonthlyContributionChange: (amount: number) => void;
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
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  includeExtraContributions,
  extraMonthlyContribution,
  baselineExtraMonthlyContribution,
  canSave,
  saveMessage,
  onRetirementAgeChange,
  onExtraContributionEnabledChange,
  onExtraMonthlyContributionChange,
  onReset,
  onSave,
}: RetirementAgeExperimentProps) {
  const ageDifference = retirementAge - baselineRetirementAge;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const retirementYearsDifference = baselineRetirementAge - retirementAge;
  const extraContributionDifference =
    (includeExtraContributions ? extraMonthlyContribution : 0) -
    baselineExtraMonthlyContribution;
  const hasChanged =
    ageDifference !== 0 || extraContributionDifference !== 0;
  const minAge = currentAge;
  const maxAge = Math.max(minAge, Math.min(100, statePensionAge + 5));
  const maxExtraContribution = Math.max(
    2_000,
    Math.ceil(
      Math.max(extraMonthlyContribution, baselineExtraMonthlyContribution) / 250,
    ) * 250,
  );

  const story = createRetirementAgeStory({
    activePlanName,
    ageDifference,
    pensionDifference,
    retirementAge,
    currentAge,
    includeExtraContributions,
    extraMonthlyContribution,
    extraContributionDifference,
  });

  return (
    <section
      className="what-if-workspace"
      aria-labelledby="retirement-age-experiment-title"
    >
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="retirement-age-experiment-title">Change retirement age</h2>
          <p>
            Adjust retirement timing and test whether additional contributions
            could change the outcome.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <div className="what-if-control-panel">
          <div className="what-if-control-copy">
            <span>Retirement age</span>
            <strong>Age {retirementAge}</strong>
            <small>
              Saved plan: age {baselineRetirementAge} ·{" "}
              {Math.max(0, retirementAge - currentAge)} years away
            </small>
          </div>

          <div className="what-if-slider-wrap">
            <input
              id="what-if-retirement-age"
              type="range"
              min={minAge}
              max={maxAge}
              step={1}
              value={Math.min(maxAge, Math.max(minAge, retirementAge))}
              aria-label="Experimental retirement age"
              aria-valuetext={`Age ${retirementAge}`}
              onChange={(event) =>
                onRetirementAgeChange(Number(event.target.value))
              }
            />
            <div className="what-if-slider-labels" aria-hidden="true">
              <span>Retire today · age {minAge}</span>
              <span>Saved plan {baselineRetirementAge}</span>
              <span>State Pension + 5 · age {maxAge}</span>
            </div>
            <p className="what-if-control-note">
              Selecting your current age models immediate retirement using the
              pension already built, with no further contribution or growth years.
            </p>
          </div>
        </div>

        <div className="what-if-control-panel what-if-extra-control">
          <div className="what-if-control-copy">
            <span>Extra contributions</span>
            <strong>
              {includeExtraContributions
                ? `${formatCurrency(extraMonthlyContribution)}/month`
                : "Not included"}
            </strong>
            <small>
              Saved plan: {formatCurrency(baselineExtraMonthlyContribution)}/month
            </small>
          </div>

          <div className="what-if-extra-controls">
            <label className="what-if-toggle-row">
              <span>
                <strong>Include extra contributions</strong>
                <small>
                  Compare the experiment with or without an additional monthly
                  payment.
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={includeExtraContributions}
                aria-label="Include extra contributions"
                onChange={(event) =>
                  onExtraContributionEnabledChange(event.target.checked)
                }
              />
            </label>

            <div className="what-if-slider-wrap">
              <input
                id="what-if-extra-contribution"
                type="range"
                min={0}
                max={maxExtraContribution}
                step={25}
                value={extraMonthlyContribution}
                disabled={!includeExtraContributions || retirementAge === currentAge}
                aria-label="Extra monthly contribution"
                aria-valuetext={`${formatCurrency(extraMonthlyContribution)} per month`}
                onChange={(event) =>
                  onExtraMonthlyContributionChange(Number(event.target.value))
                }
              />
              <div className="what-if-slider-labels" aria-hidden="true">
                <span>£0</span>
                <span>
                  Saved · {formatCurrency(baselineExtraMonthlyContribution)}
                </span>
                <span>{formatCurrency(maxExtraContribution)}</span>
              </div>
              {retirementAge === currentAge && (
                <p className="what-if-control-note">
                  Extra contributions have no accumulation period when retiring
                  today, so they do not affect this outcome.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon
            icon={
              retirementAge === currentAge
                ? AppIcons.concepts.retirement
                : extraContributionDifference !== 0
                  ? AppIcons.concepts.pension
                  : AppIcons.clock
            }
            fixedWidth
          />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>{story.title}</h3>
          <p>{story.description}</p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="what-if-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="what-if-outcomes-title">How the plan changes</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
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
          <OutcomeCard
            label="Years planned in retirement"
            baseline={`${Math.max(0, planningAge - baselineRetirementAge)} years`}
            experiment={`${Math.max(0, planningAge - retirementAge)} years`}
            difference={formatSignedYears(retirementYearsDifference)}
          />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            {createImpacts({
              pensionDifference,
              incomeDifference,
              preparednessDifference,
              retirementYearsDifference,
            }).map((impact) => (
              <li key={impact.label}>
                <span>{impact.label}</span>
                <strong
                  className={
                    impact.value.startsWith("+")
                      ? "is-positive"
                      : impact.value.startsWith("-")
                        ? "is-negative"
                        : undefined
                  }
                >
                  {impact.value}
                </strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            {createReasons(
              ageDifference,
              extraContributionDifference,
              retirementAge === currentAge,
            ).map((reason) => (
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
  const tone = difference.startsWith("+")
    ? " is-positive"
    : difference.startsWith("-")
      ? " is-negative"
      : "";

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
      <em className={`what-if-outcome-difference${tone}`}>{difference}</em>
    </article>
  );
}

function createRetirementAgeStory({
  activePlanName,
  ageDifference,
  pensionDifference,
  retirementAge,
  currentAge,
  includeExtraContributions,
  extraMonthlyContribution,
  extraContributionDifference,
}: {
  activePlanName: string;
  ageDifference: number;
  pensionDifference: number;
  retirementAge: number;
  currentAge: number;
  includeExtraContributions: boolean;
  extraMonthlyContribution: number;
  extraContributionDifference: number;
}) {
  if (ageDifference === 0 && extraContributionDifference === 0) {
    return {
      title: `${activePlanName} is unchanged`,
      description:
        "Move either slider to see how retirement timing or additional contributions could alter the outcome.",
    };
  }

  if (retirementAge === currentAge) {
    return {
      title: `Retiring now means stopping work at age ${currentAge}`,
      description: `The illustration uses the ${formatCurrency(Math.max(0, pensionDifference + Math.abs(pensionDifference)))} already available at retirement and assumes no further contribution or investment-growth years.`,
    };
  }

  const years = Math.abs(ageDifference);
  const timing = ageDifference < 0 ? "earlier" : "later";
  const direction = pensionDifference < 0 ? "reduce" : "increase";
  const contributionText = includeExtraContributions
    ? ` The experiment also includes ${formatCurrency(extraMonthlyContribution)} of extra contributions each month.`
    : " The experiment excludes extra monthly contributions.";

  return {
    title:
      ageDifference === 0
        ? "Changing extra contributions alters the same retirement date"
        : `Retiring ${years} ${years === 1 ? "year" : "years"} ${timing} means stopping work at age ${retirementAge}`,
    description: `Under the current assumptions, that could ${direction} the projected pension by ${formatCurrency(Math.abs(pensionDifference))}.${contributionText}`,
  };
}

function createReasons(
  ageDifference: number,
  extraContributionDifference: number,
  immediateRetirement: boolean,
): string[] {
  if (immediateRetirement) {
    return [
      "The current pension becomes the starting retirement fund immediately.",
      "No further employee or employer contributions are added.",
      "There are no additional accumulation years before retirement.",
    ];
  }

  const reasons =
    ageDifference < 0
      ? [
          "Fewer years of employee and employer contributions enter the pension.",
          "The existing pension has less time to benefit from compound growth.",
          "The retirement-income plan needs to cover more years.",
        ]
      : ageDifference > 0
        ? [
            "More employee and employer contributions enter the pension.",
            "The existing pension has longer to benefit from compound growth.",
            "The retirement-income plan needs to cover fewer years.",
          ]
        : ["The planned retirement date remains unchanged."];

  if (extraContributionDifference > 0) {
    reasons.push("Higher extra contributions add more money before retirement.");
  } else if (extraContributionDifference < 0) {
    reasons.push("Lower or removed extra contributions reduce money paid in.");
  }

  return reasons.slice(0, 3);
}

function createImpacts({
  pensionDifference,
  incomeDifference,
  preparednessDifference,
  retirementYearsDifference,
}: {
  pensionDifference: number;
  incomeDifference: number;
  preparednessDifference: number;
  retirementYearsDifference: number;
}) {
  return [
    {
      label: "Projected pension",
      value: formatSignedCurrency(pensionDifference),
      magnitude: Math.abs(pensionDifference),
    },
    {
      label: "Annual retirement income",
      value: `${formatSignedCurrency(incomeDifference)}/year`,
      magnitude: Math.abs(incomeDifference) * 20,
    },
    {
      label: "Target coverage",
      value: formatSignedPercentage(preparednessDifference),
      magnitude: Math.abs(preparednessDifference) * 5_000,
    },
    {
      label: "Years in retirement",
      value: formatSignedYears(retirementYearsDifference),
      magnitude: Math.abs(retirementYearsDifference) * 10_000,
    },
  ]
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 3);
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatSignedYears(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value} ${Math.abs(value) === 1 ? "year" : "years"}`;
}
