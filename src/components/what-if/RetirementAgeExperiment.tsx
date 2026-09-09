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
  canSave: boolean;
  saveMessage: string | null;
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
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onRetirementAgeChange,
  onReset,
  onSave,
}: RetirementAgeExperimentProps) {
  const ageDifference = retirementAge - baselineRetirementAge;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const retirementYearsDifference = baselineRetirementAge - retirementAge;
  const hasChanged = ageDifference !== 0;
  const minAge = currentAge;
  const maxAge = Math.max(currentAge, Math.min(100, statePensionAge + 5));
  const ageRange = Math.max(1, maxAge - minAge);
  const baselinePosition = Math.max(
    0,
    Math.min(100, ((baselineRetirementAge - minAge) / ageRange) * 100),
  );
  const immediateRetirement = retirementAge === currentAge;
  const story = createStory({
    activePlanName,
    ageDifference,
    retirementAge,
    currentAge,
    projectedPension,
    pensionDifference,
  });
  const outcomeStatus = createOutcomeStatus(preparedness, hasChanged);
  const savedPlanTiming = createSavedPlanTiming(ageDifference);

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
        <section className="what-if-change-panel" aria-labelledby="retirement-age-change-title">
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
                onChange={(event) => onRetirementAgeChange(Number(event.target.value))}
              />
              <span
                className="what-if-slider-reference-marker"
                style={{ left: `${baselinePosition}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="what-if-slider-labels what-if-slider-labels-reference" aria-hidden="true">
              <span>Age {minAge}</span>
              <span
                className="what-if-slider-saved-label"
                style={{ left: `${baselinePosition}%` }}
              >
                Saved · {baselineRetirementAge}
              </span>
              <span>Age {maxAge}</span>
            </div>
          </div>

          <p className="what-if-control-note">
            {immediateRetirement
              ? "Retiring now uses the pension already built, with no further contribution or accumulation years."
              : "Changing retirement age affects both how long the pension can grow and how many retirement years it may need to support."}
          </p>
        </section>

        <section className="what-if-result-panel" aria-labelledby="retirement-age-outcome-title" aria-live="polite">
          <div className="what-if-result-heading">
            <div>
              <p className="planner-eyebrow">Outcome</p>
              <h3 id="retirement-age-outcome-title">{hasChanged ? `Retire at ${retirementAge}` : "Your saved retirement age"}</h3>
            </div>
            <span className={`what-if-result-status ${outcomeStatus.tone}`}>{outcomeStatus.label}</span>
          </div>

          <div className={`what-if-result-story${hasChanged ? " is-changed" : ""}`}>
            <span className="what-if-story-icon" aria-hidden="true">
              <FontAwesomeIcon
                icon={immediateRetirement ? AppIcons.concepts.retirement : AppIcons.clock}
                fixedWidth
              />
            </span>
            <div>
              <strong>{story.title}</strong>
              <p>{story.description}</p>
            </div>
          </div>

          <div className="what-if-key-results" aria-label="Key retirement age outcomes">
            <KeyResult
              label="Pension at retirement"
              value={formatCurrency(projectedPension)}
              difference={formatSignedCurrency(pensionDifference)}
            />
            <KeyResult
              label="Illustrated income"
              value={`${formatCurrency(annualIncome)}/year`}
              difference={`${formatSignedCurrency(incomeDifference)}/year`}
            />
            <KeyResult
              label="Target coverage"
              value={`${preparedness}%`}
              difference={formatSignedPercentage(preparednessDifference)}
            />
          </div>

          <div className="what-if-inline-actions">
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-medium"
              disabled={!hasChanged}
              onClick={onReset}
            >
              Reset
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
        </section>
      </div>

      <div className="what-if-detail-disclosures">
        <details className="what-if-detail-card">
          <summary>
            <span>
              <strong>Why did this change?</strong>
              <small>See the mechanics behind the outcome.</small>
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
              <small>Compare the saved plan with this experiment.</small>
            </span>
            <span aria-hidden="true">+</span>
          </summary>
          <div className="what-if-detail-comparison">
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
        </details>
      </div>

      {saveMessage && (
        <p className="what-if-save-message" role="status">
          {saveMessage}
        </p>
      )}
    </section>
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

function createOutcomeStatus(preparedness: number, hasChanged: boolean) {
  if (!hasChanged) {
    return { label: "Saved plan", tone: "is-neutral" };
  }
  if (preparedness >= 100) {
    return { label: "Target supported", tone: "is-positive" };
  }
  if (preparedness >= 85) {
    return { label: "Close to target", tone: "is-caution" };
  }
  return { label: "Below target", tone: "is-negative" };
}

function createStory({
  activePlanName,
  ageDifference,
  retirementAge,
  currentAge,
  projectedPension,
  pensionDifference,
}: {
  activePlanName: string;
  ageDifference: number;
  retirementAge: number;
  currentAge: number;
  projectedPension: number;
  pensionDifference: number;
}) {
  if (ageDifference === 0) {
    return {
      title: `${activePlanName} is unchanged`,
      description:
        "Move the retirement-age slider to see the effect of having more or less time to contribute and invest.",
    };
  }

  if (retirementAge === currentAge) {
    return {
      title: `Retiring now means stopping work at age ${currentAge}`,
      description: `The illustration starts retirement with the ${formatCurrency(projectedPension)} pension already built and assumes no further contribution or investment-growth years.`,
    };
  }

  const years = Math.abs(ageDifference);
  const timing = ageDifference < 0 ? "earlier" : "later";
  const direction = pensionDifference < 0 ? "reduce" : "increase";

  return {
    title: `Retiring ${years} ${years === 1 ? "year" : "years"} ${timing}`,
    description: `Stopping work at age ${retirementAge} could ${direction} the projected pension by ${formatCurrency(Math.abs(pensionDifference))} under the saved assumptions.`,
  };
}

function createSavedPlanTiming(ageDifference: number): string {
  if (ageDifference === 0) return "matches this experiment";

  const years = Math.abs(ageDifference);
  const direction = ageDifference < 0 ? "later" : "earlier";
  return `${years} ${years === 1 ? "year" : "years"} ${direction} than this experiment`;
}

function createReasons(
  ageDifference: number,
  immediateRetirement: boolean,
): string[] {
  if (immediateRetirement) {
    return [
      "The current pension becomes the retirement fund immediately.",
      "No further employee or employer contributions are added.",
      "There are no additional accumulation years before retirement.",
    ];
  }

  if (ageDifference < 0) {
    return [
      "Fewer years of employee and employer contributions enter the pension.",
      "The pension has less time to benefit from compound growth.",
      "The retirement-income plan needs to cover more years.",
    ];
  }

  if (ageDifference > 0) {
    return [
      "More employee and employer contributions enter the pension.",
      "The pension has longer to benefit from compound growth.",
      "The retirement-income plan needs to cover fewer years.",
    ];
  }

  return [
    "The experiment currently matches the saved retirement age.",
    "No saved plan values have been changed.",
    "Move the slider to create a temporary alternative.",
  ];
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

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("-")) return " is-negative";
  return "";
}

function toneClassName(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("-")) return "is-negative";
  return undefined;
}
