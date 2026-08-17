import type { RetirementSpendingOutcome } from "../../../engine/drawdown/createRetirementSpendingOutcome";
import { formatCurrency } from "../../../utils/formatters";
import type { ExperimentId } from "../ExperimentLauncher";

interface ExperimentInsightsProps {
  activeExperiment: ExperimentId;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  baselineRetirementOutcome?: RetirementSpendingOutcome | null;
  retirementOutcome?: RetirementSpendingOutcome | null;
  currentAge: number;
  retirementAge: number;
  statePensionAge: number;
  extraContributionAge?: number;
  downturnAge?: number;
  hasChanged: boolean;
  onSelectExperiment: (experiment: ExperimentId) => void;
}

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
  baselineRetirementOutcome,
  retirementOutcome,
  hasChanged,
}: ExperimentInsightsProps) {
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const outcome = getOutcomeVerdict(activeExperiment, pensionDifference, incomeDifference);

  return (
    <section className="what-if-insights" aria-labelledby="decision-summary-title">
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">Decision summary</p>
          <h2 id="decision-summary-title">{experimentQuestion[activeExperiment]}</h2>
          <p>
            {hasChanged
              ? "See the main effect of this change compared with your saved plan."
              : "Move an experiment control to compare it with the saved plan."}
          </p>
        </div>
      </header>

      <div className="what-if-before-after-grid">
        <BeforeAfterCard
          label="Pension at retirement"
          before={formatCurrency(baselineProjectedPension)}
          after={formatCurrency(projectedPension)}
          difference={formatSignedCurrency(pensionDifference)}
          tone={toneClass(pensionDifference)}
        />
        <BeforeAfterCard
          label="Estimated retirement income"
          before={`${formatCurrency(baselineAnnualIncome)}/year`}
          after={`${formatCurrency(annualIncome)}/year`}
          difference={`${formatSignedCurrency(incomeDifference)}/year`}
          tone={toneClass(incomeDifference)}
        />
      </div>

      <article className={`what-if-verdict ${outcome.className}`}>
        <div>
          <p className="planner-eyebrow">Overall effect</p>
          <h3>{hasChanged ? outcome.label : "Your saved plan"}</h3>
        </div>
        <p>
          {hasChanged
            ? createExplanation(activeExperiment, pensionDifference, incomeDifference)
            : "The figures above are your baseline. Change one control to see the effect."}
        </p>
      </article>

      {baselineRetirementOutcome && retirementOutcome && (
        <RetirementImpactDetails
          baseline={baselineRetirementOutcome}
          outcome={retirementOutcome}
        />
      )}
    </section>
  );
}

function BeforeAfterCard({
  label,
  before,
  after,
  difference,
  tone,
}: {
  label: string;
  before: string;
  after: string;
  difference: string;
  tone: string;
}) {
  return (
    <article className="what-if-before-after-card">
      <span>{label}</span>
      <div className="what-if-before-after-values">
        <div>
          <small>Saved plan</small>
          <strong>{before}</strong>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <small>What if</small>
          <strong>{after}</strong>
        </div>
      </div>
      <em className={tone}>{difference}</em>
    </article>
  );
}

function RetirementImpactDetails({
  baseline,
  outcome,
}: {
  baseline: RetirementSpendingOutcome;
  outcome: RetirementSpendingOutcome;
}) {
  const sustainableDifference = outcome.sustainableNetSpending - baseline.sustainableNetSpending;
  const headroomDifference = outcome.annualHeadroom - baseline.annualHeadroom;

  return (
    <details className="what-if-details">
      <summary>See retirement impact details</summary>
      <p>
        These use the same drawdown assumptions and ending-balance goal as your active plan.
      </p>
      <div className="what-if-details-grid">
        <DetailCard
          label="Sustainable net spending"
          before={`${formatCurrency(baseline.sustainableNetSpending)}/year`}
          after={`${formatCurrency(outcome.sustainableNetSpending)}/year`}
          difference={`${formatSignedCurrency(sustainableDifference)}/year`}
          tone={toneClass(sustainableDifference)}
        />
        <DetailCard
          label="Annual headroom"
          before={formatSignedCurrency(baseline.annualHeadroom)}
          after={formatSignedCurrency(outcome.annualHeadroom)}
          difference={formatSignedCurrency(headroomDifference)}
          tone={toneClass(headroomDifference)}
        />
        <DetailCard
          label="Ending pot"
          before={formatCurrency(baseline.modelledEndingBalance)}
          after={formatCurrency(outcome.modelledEndingBalance)}
          difference={`Target ${formatCurrency(outcome.targetEndingBalance)}`}
          tone=""
        />
        <DetailCard
          label="Living Standard supported"
          before={livingStandardLabel(baseline.livingStandard)}
          after={livingStandardLabel(outcome.livingStandard)}
          difference={`${statusLabel(baseline.status)} → ${statusLabel(outcome.status)}`}
          tone=""
        />
      </div>
    </details>
  );
}

function DetailCard({
  label,
  before,
  after,
  difference,
  tone,
}: {
  label: string;
  before: string;
  after: string;
  difference: string;
  tone: string;
}) {
  return (
    <div className="what-if-detail-card">
      <span>{label}</span>
      <small>{before} → {after}</small>
      <strong className={tone}>{difference}</strong>
    </div>
  );
}

function getOutcomeVerdict(
  experiment: ExperimentId,
  pensionDifference: number,
  incomeDifference: number,
) {
  const financialDifference = Math.abs(incomeDifference) >= 1 ? incomeDifference : pensionDifference;
  const baselineScale = Math.max(Math.abs(pensionDifference), Math.abs(incomeDifference), 1);
  const isSimilar = Math.abs(financialDifference) < Math.max(50, baselineScale * 0.005);

  if (isSimilar) {
    return { label: "Similar outcome", className: "is-similar" };
  }

  if (experiment === "spending") {
    return financialDifference >= 0
      ? { label: "More flexibility", className: "is-positive" }
      : { label: "More pressure", className: "is-negative" };
  }

  return financialDifference > 0
    ? { label: "More flexibility", className: "is-positive" }
    : { label: "More pressure", className: "is-negative" };
}

function createExplanation(
  experiment: ExperimentId,
  pensionDifference: number,
  incomeDifference: number,
): string {
  const direction = incomeDifference > 0 ? "increases" : incomeDifference < 0 ? "reduces" : "barely changes";
  const pensionDirection = pensionDifference > 0 ? "larger" : pensionDifference < 0 ? "smaller" : "similar";

  switch (experiment) {
    case "retirement-age":
      return `Changing retirement age ${direction} the illustrated retirement income and leaves a ${pensionDirection} pension pot at retirement.`;
    case "contributions":
      return `Changing contributions leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "spending":
      return "A higher spending target can improve retirement lifestyle, but it also asks more of the pension. Open the details below to see the effect on sustainable spending and headroom.";
    case "fees":
      return `The fee change leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "returns":
      return `The return assumption leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income. Returns are an assumption, not a guaranteed outcome.`;
    case "inflation":
      return `The inflation assumption ${direction} the spending power illustrated by the plan. The comparison is shown in today's-money terms where possible.`;
    case "state-pension":
      return `The State Pension change ${direction} the income available in retirement and changes how much needs to come from the private pension.`;
    case "market-downturn":
      return `The market fall leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
  }
}

function statusLabel(status: RetirementSpendingOutcome["status"]): string {
  if (status === "comfortable") return "Comfortable";
  if (status === "tight") return "Tight";
  return "Shortfall";
}

function livingStandardLabel(level: RetirementSpendingOutcome["livingStandard"]): string {
  if (level === null) return "Below Minimum";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "£0";
  const prefix = value > 0 ? "+" : "−";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function toneClass(value: number): string {
  if (value > 0.5) return "is-positive";
  if (value < -0.5) return "is-negative";
  return "";
}
