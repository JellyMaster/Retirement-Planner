import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ExperimentId } from "../ExperimentLauncher";
import { AppIcons } from "../../../icons";
import { formatCurrency } from "../../../utils/formatters";

interface ExperimentInsightsProps {
  activeExperiment: ExperimentId;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  currentAge: number;
  retirementAge: number;
  statePensionAge: number;
  extraContributionAge?: number;
  downturnAge?: number;
  hasChanged: boolean;
  onSelectExperiment: (experiment: ExperimentId) => void;
}

const nextExperiment: Record<ExperimentId, ExperimentId> = {
  "retirement-age": "contributions",
  contributions: "spending",
  spending: "fees",
  fees: "returns",
  returns: "inflation",
  inflation: "state-pension",
  "state-pension": "market-downturn",
  "market-downturn": "retirement-age",
};

const experimentQuestion: Record<ExperimentId, string> = {
  "retirement-age": "When could I retire?",
  contributions: "What if I saved more?",
  spending: "Could I spend more?",
  fees: "Would lower fees matter?",
  returns: "How sensitive is the plan to returns?",
  inflation: "What if inflation stays higher?",
  "state-pension": "How much does State Pension help?",
  "market-downturn": "What if markets fall?",
};

export function ExperimentInsights({
  activeExperiment,
  baselineProjectedPension,
  projectedPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  currentAge,
  retirementAge,
  statePensionAge,
  extraContributionAge,
  downturnAge,
  hasChanged,
  onSelectExperiment,
}: ExperimentInsightsProps) {
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const health = getHealth(preparedness);
  const sensitivity = getSensitivity(
    relativeChange(pensionDifference, baselineProjectedPension),
    relativeChange(incomeDifference, baselineAnnualIncome),
    Math.abs(preparednessDifference) / 100,
  );
  const changes = [
    {
      label: "Pension at retirement",
      value: formatSignedCurrency(pensionDifference),
      magnitude: relativeChange(pensionDifference, baselineProjectedPension),
      tone: toneClass(pensionDifference),
    },
    {
      label: "Annual retirement income",
      value: `${formatSignedCurrency(incomeDifference)}/year`,
      magnitude: relativeChange(incomeDifference, baselineAnnualIncome),
      tone: toneClass(incomeDifference),
    },
    {
      label: "Target coverage",
      value: formatSignedPercentage(preparednessDifference),
      magnitude: Math.abs(preparednessDifference) / 100,
      tone: toneClass(preparednessDifference),
    },
  ].sort((left, right) => right.magnitude - left.magnitude);
  const next = nextExperiment[activeExperiment];

  return (
    <section className="what-if-insights" aria-labelledby="decision-summary-title">
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">Decision summary</p>
          <h2 id="decision-summary-title">{experimentQuestion[activeExperiment]}</h2>
          <p>
            {hasChanged
              ? "A consistent view of the most important outcome changes."
              : "Move an experiment control to compare it with the saved plan."}
          </p>
        </div>
        <span className={`what-if-health-badge ${health.className}`}>{health.label}</span>
      </header>

      <div className="what-if-summary-grid">
        <SummaryCard
          label="Projected pension"
          value={formatCurrency(projectedPension)}
          difference={formatSignedCurrency(pensionDifference)}
          tone={toneClass(pensionDifference)}
        />
        <SummaryCard
          label="Annual retirement income"
          value={`${formatCurrency(annualIncome)}/year`}
          difference={`${formatSignedCurrency(incomeDifference)}/year`}
          tone={toneClass(incomeDifference)}
        />
        <SummaryCard
          label="Preparedness"
          value={`${preparedness}%`}
          difference={formatSignedPercentage(preparednessDifference)}
          tone={toneClass(preparednessDifference)}
        />
        <article className="what-if-summary-card what-if-health-card">
          <span>Plan health</span>
          <strong>{health.label}</strong>
          <p>{health.description}</p>
        </article>
      </div>

      <div className="what-if-insight-grid">
        <article className="what-if-shared-panel">
          <p className="planner-eyebrow">What changed?</p>
          <h3>Biggest movements</h3>
          <ol className="what-if-ranked-changes">
            {changes.map((change) => (
              <li key={change.label}>
                <FontAwesomeIcon icon={AppIcons.chartLine} aria-hidden="true" />
                <span>{change.label}</span>
                <strong className={change.tone}>{change.value}</strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="what-if-shared-panel">
          <p className="planner-eyebrow">Sensitivity</p>
          <h3>{sensitivity.label} impact</h3>
          <div
            className="what-if-sensitivity-track"
            role="meter"
            aria-label="Impact of this decision"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={sensitivity.level}
            aria-valuetext={`${sensitivity.label} impact`}
          >
            <span style={{ width: `${sensitivity.level * 20}%` }} />
          </div>
          <p>{sensitivity.description}</p>
        </article>
      </div>

      <ExperimentTimeline
        currentAge={currentAge}
        retirementAge={retirementAge}
        statePensionAge={statePensionAge}
        extraContributionAge={extraContributionAge}
        downturnAge={activeExperiment === "market-downturn" ? downturnAge : undefined}
      />

      <article className="what-if-next-card">
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.lightbulb} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">Recommended next experiment</p>
          <h3>{experimentQuestion[next]}</h3>
          <p>Explore another single lever while keeping this plan as the baseline.</p>
        </div>
        <button
          type="button"
          className="ui-button ui-button-secondary ui-button-medium"
          onClick={() => onSelectExperiment(next)}
        >
          Open experiment
        </button>
      </article>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  difference,
  tone,
}: {
  label: string;
  value: string;
  difference: string;
  tone?: string;
}) {
  return (
    <article className="what-if-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={tone}>{difference}</em>
    </article>
  );
}

function ExperimentTimeline({
  currentAge,
  retirementAge,
  statePensionAge,
  extraContributionAge,
  downturnAge,
}: {
  currentAge: number;
  retirementAge: number;
  statePensionAge: number;
  extraContributionAge?: number;
  downturnAge?: number;
}) {
  const ages = [currentAge, retirementAge, statePensionAge, extraContributionAge, downturnAge]
    .filter((age): age is number => age !== undefined);
  const minimum = Math.min(...ages);
  const maximum = Math.max(...ages, minimum + 1);
  const position = (age: number) => `${((age - minimum) / (maximum - minimum)) * 100}%`;
  const markers = [
    { key: "today", age: currentAge, label: "Today", icon: AppIcons.user },
    extraContributionAge !== undefined
      ? { key: "extra", age: extraContributionAge, label: "Extra saving", icon: AppIcons.plus }
      : null,
    downturnAge !== undefined
      ? { key: "downturn", age: downturnAge, label: "Market fall", icon: AppIcons.warning }
      : null,
    { key: "retirement", age: retirementAge, label: "Retire", icon: AppIcons.retirement },
    { key: "state", age: statePensionAge, label: "State Pension", icon: AppIcons.pension },
  ].filter((marker): marker is NonNullable<typeof marker> => marker !== null);

  return (
    <article className="what-if-timeline-panel">
      <div>
        <p className="planner-eyebrow">Plan timeline</p>
        <h3>When the key events happen</h3>
      </div>
      <div className="what-if-timeline" aria-label="Experiment timeline">
        <div className="what-if-timeline-line" />
        {markers.map((marker) => (
          <div
            key={marker.key}
            className="what-if-timeline-marker"
            style={{ left: position(marker.age) }}
          >
            <span aria-hidden="true"><FontAwesomeIcon icon={marker.icon} /></span>
            <strong>{marker.age}</strong>
            <small>{marker.label}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function getHealth(score: number) {
  if (score >= 100) {
    return {
      label: "On track",
      description: "The illustrated income meets or exceeds the chosen target.",
      className: "is-good",
    };
  }
  if (score >= 85) {
    return {
      label: "Close",
      description: "The plan is near the chosen target, but a modest gap remains.",
      className: "is-close",
    };
  }
  return {
    label: "Needs attention",
    description: "The illustrated income remains below the chosen target.",
    className: "is-warning",
  };
}

function getSensitivity(...changes: number[]) {
  const largest = Math.max(...changes.map(Math.abs));
  if (largest >= 0.25) return { level: 5, label: "Very high", description: "This lever materially changes the retirement outcome." };
  if (largest >= 0.15) return { level: 4, label: "High", description: "This lever has a strong effect on the plan." };
  if (largest >= 0.08) return { level: 3, label: "Moderate", description: "This lever produces a noticeable change." };
  if (largest >= 0.03) return { level: 2, label: "Low", description: "This lever moves the plan, but less than the major decisions." };
  return { level: 1, label: "Very low", description: "This lever has only a small effect under the current assumptions." };
}

function relativeChange(change: number, baseline: number): number {
  return baseline === 0 ? (change === 0 ? 0 : 1) : Math.abs(change / baseline);
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${Math.abs(Math.round(value))}%`;
}

function toneClass(value: number): string | undefined {
  if (value > 0.5) return "is-positive";
  if (value < -0.5) return "is-negative";
  return undefined;
}
