import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface RetirementAgeExperimentProps {
  activePlanName: string;
  currentAge: number;
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
  const minAge = Math.max(currentAge + 1, baselineRetirementAge - 10);
  const maxAge = Math.min(100, baselineRetirementAge + 10);

  const story = createRetirementAgeStory({
    activePlanName,
    ageDifference,
    pensionDifference,
    retirementAge,
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
            Move one lever and see how the pension, illustrated income and target
            coverage respond immediately.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-control-panel">
        <div className="what-if-control-copy">
          <span>Retirement age</span>
          <strong>Age {retirementAge}</strong>
          <small>
            Saved plan: age {baselineRetirementAge} · {Math.max(0, retirementAge - currentAge)} years away
          </small>
        </div>

        <div className="what-if-slider-wrap">
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
          <div className="what-if-slider-labels" aria-hidden="true">
            <span>Age {minAge}</span>
            <span>Age {baselineRetirementAge}</span>
            <span>Age {maxAge}</span>
          </div>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.lightbulb} />
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
            difference={formatSignedPoints(preparednessDifference)}
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
                <strong className={impact.value.startsWith("+") ? "is-positive" : impact.value.startsWith("-") ? "is-negative" : undefined}>
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
            {createReasons(ageDifference).map((reason) => (
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
          <strong>{hasChanged ? "This experiment is temporary" : "Move the slider to begin"}</strong>
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
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
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
}: {
  activePlanName: string;
  ageDifference: number;
  pensionDifference: number;
  retirementAge: number;
}) {
  if (ageDifference === 0) {
    return {
      title: `${activePlanName} is unchanged`,
      description:
        "Move the retirement-age slider to see the effect of having more or less time to contribute and invest.",
    };
  }

  const years = Math.abs(ageDifference);
  const timing = ageDifference < 0 ? "earlier" : "later";
  const direction = pensionDifference < 0 ? "reduce" : "increase";

  return {
    title: `Retiring ${years} ${years === 1 ? "year" : "years"} ${timing} means stopping work at age ${retirementAge}`,
    description: `Under the current assumptions, that could ${direction} the projected pension by ${formatCurrency(Math.abs(pensionDifference))}. The change reflects a different contribution period and a different amount of time for investment growth.`,
  };
}

function createReasons(ageDifference: number): string[] {
  if (ageDifference < 0) {
    return [
      "Fewer years of employee and employer contributions enter the pension.",
      "The existing pension has less time to benefit from compound growth.",
      "The retirement-income plan needs to cover more years.",
    ];
  }

  if (ageDifference > 0) {
    return [
      "More employee and employer contributions enter the pension.",
      "The existing pension has longer to benefit from compound growth.",
      "The retirement-income plan needs to cover fewer years.",
    ];
  }

  return [
    "The experiment currently matches the saved retirement age.",
    "No saved plan values have been changed.",
    "Move the slider to create a temporary alternative.",
  ];
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
      value: formatSignedPoints(preparednessDifference),
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

function formatSignedPoints(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value} points`;
}

function formatSignedYears(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value} ${Math.abs(value) === 1 ? "year" : "years"}`;
}
