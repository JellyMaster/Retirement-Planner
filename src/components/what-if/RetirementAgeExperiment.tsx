import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useScenarios } from "../scenarios";
import { AppIcons } from "../../icons";
import "../../styles/what-if-view-modes.css";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

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
  const { activeScenario } = useScenarios();
  const { viewMode, displayMode } = useWhatIfDisplaySettings();
  const ageDifference = retirementAge - baselineRetirementAge;
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
  const displayedBaselineIncome = showingToday
    ? baselineAnnualIncome
    : baselineAnnualIncome * baselineInflationFactor;
  const displayedIncome = showingToday
    ? annualIncome
    : annualIncome * experimentInflationFactor;
  const pensionDifference = displayedPension - displayedBaselinePension;
  const incomeDifference = displayedIncome - displayedBaselineIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const story = createStory({
    activePlanName,
    ageDifference,
    retirementAge,
    currentAge,
    projectedPension: displayedPension,
    pensionDifference,
  });
  const simpleStory = createSimpleStory({
    activePlanName,
    ageDifference,
    retirementAge,
    preparedness,
  });
  const outcomeStatus = createOutcomeStatus(preparedness, hasChanged);
  const savedPlanTiming = createSavedPlanTiming(ageDifference);
  const retirementYears = Math.max(0, planningAge - retirementAge);

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

          {viewMode === "simple" ? (
            <>
              <div className="what-if-simple-outcome-copy">
                <strong>{simpleStory.title}</strong>
                <p>{simpleStory.description}</p>
              </div>

              <div className="what-if-simple-results" aria-label="Simple retirement age outcomes">
                <SimpleResult
                  value={`${formatCurrency(displayedIncome)}/year`}
                  label="Estimated retirement income"
                  note={createIncomeTargetNote(preparedness)}
                  tone={preparedness >= 100 ? "positive" : "negative"}
                />
                <SimpleResult
                  value={formatCurrency(displayedPension)}
                  label="Pension when retirement starts"
                  note={createPensionDifferenceNote(pensionDifference, baselineRetirementAge)}
                  tone={pensionDifference >= 0 ? "positive" : "negative"}
                />
                <SimpleResult
                  value={`${retirementYears} years`}
                  label="How long retirement is planned for"
                  note={createRetirementYearsNote(retirementYearsDifference, baselineRetirementAge)}
                  tone={retirementYearsDifference <= 0 ? "positive" : "neutral"}
                />
              </div>
            </>
          ) : (
            <>
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

              <div className="what-if-key-results" aria-label="Detailed retirement age outcomes">
                <KeyResult
                  label="Pension at retirement"
                  value={formatCurrency(displayedPension)}
                  difference={formatSignedCurrency(pensionDifference)}
                />
                <KeyResult
                  label="Illustrated income"
                  value={`${formatCurrency(displayedIncome)}/year`}
                  difference={`${formatSignedCurrency(incomeDifference)}/year`}
                />
                <KeyResult
                  label="Target coverage"
                  value={`${preparedness}%`}
                  difference={formatSignedPercentage(preparednessDifference)}
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

      {viewMode === "detailed" && (
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
                baseline={formatCurrency(displayedBaselinePension)}
                experiment={formatCurrency(displayedPension)}
                difference={formatSignedCurrency(pensionDifference)}
              />
              <OutcomeCard
                label="Illustrated annual income"
                baseline={`${formatCurrency(displayedBaselineIncome)}/year`}
                experiment={`${formatCurrency(displayedIncome)}/year`}
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
      )}

      {displayMode === "nominal" && retirementAge !== baselineRetirementAge && (
        <p className="what-if-money-basis-note">
          Future-money figures are shown in pounds at each plan&apos;s retirement date, so the comparison also reflects the different amount of inflation before each retirement age.
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

function createSimpleStory({
  activePlanName,
  ageDifference,
  retirementAge,
  preparedness,
}: {
  activePlanName: string;
  ageDifference: number;
  retirementAge: number;
  preparedness: number;
}) {
  if (ageDifference === 0) {
    return {
      title: `${activePlanName} is unchanged`,
      description: "Move the retirement-age slider to see what retiring earlier or later could mean for your income and pension.",
    };
  }

  const years = Math.abs(ageDifference);
  const yearLabel = years === 1 ? "year" : "years";

  if (ageDifference < 0) {
    return {
      title:
        preparedness >= 100
          ? `You could retire ${years} ${yearLabel} earlier and still meet your income target.`
          : `You could retire ${years} ${yearLabel} earlier, but your plan would fall short of your income target.`,
      description: `Retiring at ${retirementAge} gives your pension less time to grow and means it may need to support you for longer.`,
    };
  }

  return {
    title:
      preparedness >= 100
        ? `Retiring ${years} ${yearLabel} later gives your plan more breathing room.`
        : `Retiring ${years} ${yearLabel} later improves your position, but the plan still falls short of your income target.`,
    description: `Retiring at ${retirementAge} gives your pension more time to grow and means it needs to support fewer retirement years.`,
  };
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

function createIncomeTargetNote(preparedness: number): string {
  if (preparedness >= 100) return "Your income target is supported";
  return `Around ${Math.max(0, 100 - preparedness)}% below your income target`;
}

function createPensionDifferenceNote(
  pensionDifference: number,
  baselineRetirementAge: number,
): string {
  if (Math.abs(pensionDifference) < 0.5) return "Same as your saved plan";
  const direction = pensionDifference > 0 ? "more" : "less";
  return `${formatCurrency(Math.abs(pensionDifference))} ${direction} than at age ${baselineRetirementAge}`;
}

function createRetirementYearsNote(
  retirementYearsDifference: number,
  baselineRetirementAge: number,
): string {
  if (retirementYearsDifference === 0) return "Same length as your saved plan";
  const years = Math.abs(retirementYearsDifference);
  const direction = retirementYearsDifference > 0 ? "more" : "fewer";
  return `${years} ${years === 1 ? "year" : "years"} ${direction} than retiring at ${baselineRetirementAge}`;
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
