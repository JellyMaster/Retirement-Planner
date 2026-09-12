import type { RetirementSpendingOutcome } from "../../../engine/drawdown/createRetirementSpendingOutcome";
import { formatCurrency } from "../../../utils/formatters";
import type { ExperimentId } from "../ExperimentLauncher";
import {
  setWhatIfViewMode,
  useWhatIfDisplaySettings,
} from "../whatIfDisplaySettings";

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
  baselineRetirementAge?: number;
  retirementAge: number;
  planningAge?: number;
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
  baselineRetirementAge,
  retirementAge,
  planningAge,
  statePensionAge,
  hasChanged,
}: ExperimentInsightsProps) {
  const { viewMode } = useWhatIfDisplaySettings();
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const includesStatePension =
    retirementOutcome?.includesStatePension ??
    baselineRetirementOutcome?.includesStatePension ??
    true;

  if (
    activeExperiment === "retirement-age" &&
    baselineRetirementOutcome &&
    retirementOutcome
  ) {
    return (
      <RetirementAgePlanAssessment
        baselineRetirementAge={baselineRetirementAge}
        retirementAge={retirementAge}
        planningAge={planningAge}
        statePensionAge={statePensionAge}
        statePensionIncluded={includesStatePension}
        baseline={baselineRetirementOutcome}
        outcome={retirementOutcome}
        hasChanged={hasChanged}
        detailed={viewMode === "detailed"}
      />
    );
  }

  const outcome = getOutcomeVerdict(
    activeExperiment,
    pensionDifference,
    incomeDifference,
  );
  const targetIncome =
    retirementOutcome?.targetNetSpending ?? baselineRetirementOutcome?.targetNetSpending;
  const targetDifference = targetIncome === undefined ? null : annualIncome - targetIncome;
  const showBaselineMetrics = hasChanged || viewMode === "detailed";

  return (
    <section className="what-if-insights" aria-labelledby="decision-summary-title">
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">Decision summary</p>
          <h2 id="decision-summary-title">{experimentQuestion[activeExperiment]}</h2>
          <p>{createSummaryContext(activeExperiment, retirementAge, hasChanged)}</p>
        </div>
      </header>

      {!showBaselineMetrics && (
        <div className="what-if-no-change" role="status">
          <strong>No change yet</strong>
          <span>
            Move the experiment control to see how it affects your pension and retirement income.
          </span>
        </div>
      )}

      {showBaselineMetrics && (
        <div className="what-if-before-after-grid">
          <OutcomeCard
            label="Pension at retirement"
            value={formatCurrency(projectedPension)}
            baseline={formatCurrency(baselineProjectedPension)}
            difference={hasChanged ? formatSignedCurrency(pensionDifference) : null}
            percent={
              hasChanged
                ? formatPercentDifference(pensionDifference, baselineProjectedPension)
                : null
            }
            tone={toneClass(pensionDifference)}
          />
          <OutcomeCard
            label="Illustrated retirement income"
            value={`${formatCurrency(annualIncome)}/year`}
            baseline={`${formatCurrency(baselineAnnualIncome)}/year`}
            difference={hasChanged ? `${formatSignedCurrency(incomeDifference)}/year` : null}
            percent={
              hasChanged
                ? formatPercentDifference(incomeDifference, baselineAnnualIncome)
                : null
            }
            tone={toneClass(incomeDifference)}
          />
        </div>
      )}

      {hasChanged && (
        <article
          className={`what-if-verdict ${
            targetDifference === null ? outcome.className : toneClass(targetDifference)
          }`}
        >
          <div>
            <p className="planner-eyebrow">Plan assessment</p>
            <h3>
              {targetDifference === null
                ? outcome.label
                : targetVerdict(targetDifference)}
            </h3>
          </div>
          <p>
            {targetDifference === null
              ? createExplanation(activeExperiment, pensionDifference, incomeDifference)
              : createTargetExplanation(
                  activeExperiment,
                  retirementAge,
                  targetIncome ?? 0,
                  targetDifference,
                )}
          </p>
        </article>
      )}

      {viewMode === "detailed" && baselineRetirementOutcome && retirementOutcome && (
        <RetirementImpactDetails
          baseline={baselineRetirementOutcome}
          outcome={retirementOutcome}
          activeExperiment={activeExperiment}
          retirementAge={retirementAge}
          statePensionAge={statePensionAge}
          statePensionIncluded={includesStatePension}
        />
      )}
    </section>
  );
}

function RetirementAgePlanAssessment({
  baselineRetirementAge,
  retirementAge,
  planningAge,
  statePensionAge,
  statePensionIncluded,
  baseline,
  outcome,
  hasChanged,
  detailed,
}: {
  baselineRetirementAge?: number;
  retirementAge: number;
  planningAge?: number;
  statePensionAge: number;
  statePensionIncluded: boolean;
  baseline: RetirementSpendingOutcome;
  outcome: RetirementSpendingOutcome;
  hasChanged: boolean;
  detailed: boolean;
}) {
  const assessed = hasChanged ? outcome : baseline;
  const supportsTarget = assessed.savedPlanSupportsTarget;
  const firstProblemAge =
    assessed.savedPlanFirstNetIncomeShortfallAge ?? assessed.savedPlanDepletionAge;
  const targetIncome = assessed.targetNetSpending;
  const planHorizon = planningAge === undefined ? "your planning age" : `age ${planningAge}`;
  const resultValue = supportsTarget
    ? `Supported to ${planHorizon}`
    : firstProblemAge === null
      ? "Not fully supported"
      : `Shortfall from age ${firstProblemAge}`;
  const resultNote = supportsTarget
    ? "The saved income strategy has no modelled shortfall or depletion"
    : firstProblemAge === null
      ? "The changed plan no longer supports all of the saved income assumptions"
      : `The saved income strategy first stops meeting the target at age ${firstProblemAge}`;

  return (
    <section
      className={`what-if-insights${detailed ? "" : " what-if-insights-simple"}`}
      aria-labelledby="decision-summary-title"
    >
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">What does this mean for your plan?</p>
          <h2 id="decision-summary-title">
            {hasChanged
              ? `Does retiring at ${retirementAge} still support your plan?`
              : "Does your saved retirement age support your plan?"}
          </h2>
          <p>
            {hasChanged
              ? `The retirement-age result above is now benchmarked against the other assumptions in your saved plan, with everything else left unchanged.`
              : baselineRetirementAge === undefined
                ? "This benchmarks your saved retirement age against the rest of your saved plan."
                : `This benchmarks retiring at ${baselineRetirementAge} against the rest of your saved plan.`}
          </p>
        </div>
      </header>

      <div
        className="what-if-simple-impact-grid"
        aria-label="Retirement plan benchmark"
      >
        <SimpleImpactCard
          label="Your saved income target"
          value={`${formatCurrency(targetIncome)}/year`}
          note="Everything else in the plan is held equal"
        />
        <SimpleImpactCard
          label="Plan benchmark"
          value={resultValue}
          note={resultNote}
          tone={supportsTarget ? "positive" : "negative"}
        />
      </div>

      <article
        className={`what-if-simple-meaning ${
          supportsTarget ? "is-positive" : "is-negative"
        }`}
      >
        <p className="planner-eyebrow">Plan assessment</p>
        <h3>
          {supportsTarget
            ? "Your saved plan still works with this retirement age"
            : "Your saved plan no longer works through the full planning period"}
        </h3>
        <p>
          {supportsTarget
            ? `With the other assumptions left unchanged, the model continues to provide your ${formatCurrency(targetIncome)}/year net income target through ${planHorizon} without a modelled income shortfall or pension depletion.`
            : firstProblemAge === null
              ? `With the other assumptions left unchanged, the model can no longer provide your ${formatCurrency(targetIncome)}/year net income target through ${planHorizon}.`
              : `With the other assumptions left unchanged, your ${formatCurrency(targetIncome)}/year net income target is initially met, but the model first shows a shortfall around age ${firstProblemAge}.`}
        </p>
        <small>
          {statePensionIncluded
            ? `State Pension remains included from age ${statePensionAge}; only the retirement-age decision has changed.`
            : "State Pension remains excluded; only the retirement-age decision has changed."}
        </small>
      </article>

      {detailed ? (
        <RetirementImpactDetails
          baseline={baseline}
          outcome={outcome}
          activeExperiment="retirement-age"
          retirementAge={retirementAge}
          statePensionAge={statePensionAge}
          statePensionIncluded={statePensionIncluded}
        />
      ) : (
        <button
          type="button"
          className="what-if-simple-detail-action"
          onClick={() => setWhatIfViewMode("detailed")}
        >
          <span>
            <strong>See the financial details</strong>
            <small>
              See State Pension timing and the separate capital-preservation test.
            </small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      )}
    </section>
  );
}

function SimpleImpactCard({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <article className={`what-if-simple-impact-card is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function OutcomeCard({
  label,
  value,
  baseline,
  difference,
  percent,
  tone,
}: {
  label: string;
  value: string;
  baseline: string;
  difference: string | null;
  percent: string | null;
  tone: string;
}) {
  return (
    <article className="what-if-before-after-card">
      <span>{label}</span>
      <strong className="what-if-outcome-value">{value}</strong>
      {difference && (
        <em className={tone}>
          {difference}
          {percent ? ` (${percent})` : ""}
        </em>
      )}
      <small>Saved plan: {baseline}</small>
    </article>
  );
}

function RetirementImpactDetails({
  baseline,
  outcome,
  activeExperiment,
  retirementAge,
  statePensionAge,
  statePensionIncluded,
}: {
  baseline: RetirementSpendingOutcome;
  outcome: RetirementSpendingOutcome;
  activeExperiment: ExperimentId;
  retirementAge: number;
  statePensionAge: number;
  statePensionIncluded: boolean;
}) {
  const sustainableDifference =
    outcome.sustainableNetSpending - baseline.sustainableNetSpending;
  const headroomDifference = outcome.annualHeadroom - baseline.annualHeadroom;
  const endingDifference =
    outcome.modelledEndingBalance - baseline.modelledEndingBalance;
  const statePensionGap = Math.max(0, statePensionAge - retirementAge);

  return (
    <section className="what-if-details" aria-labelledby="retirement-impact-details-title">
      <h3 id="retirement-impact-details-title">Financial details</h3>
      <p>
        The plan benchmark above follows your saved withdrawal strategy. The figures below
        separately test how much could be spent while still meeting your configured
        ending-balance goal.
      </p>
      <div className="what-if-details-grid">
        <DetailCard
          label="Income with ending-balance goal"
          value={`${formatCurrency(outcome.sustainableNetSpending)}/year`}
          baseline={`${formatCurrency(baseline.sustainableNetSpending)}/year`}
          difference={`${formatSignedCurrency(sustainableDifference)}/year`}
          tone={toneClass(sustainableDifference)}
          supporting={`This is a capital-preservation test, not the income produced by your saved withdrawal strategy.`}
        />
        <DetailCard
          label="Headroom against that goal"
          value={`${formatSignedCurrency(outcome.annualHeadroom)}/year`}
          baseline={`${formatSignedCurrency(baseline.annualHeadroom)}/year`}
          difference={`${formatSignedCurrency(headroomDifference)}/year`}
          tone={toneClass(headroomDifference)}
        />
        <DetailCard
          label="Ending balance in preservation test"
          value={formatCurrency(outcome.modelledEndingBalance)}
          baseline={formatCurrency(baseline.modelledEndingBalance)}
          difference={formatSignedCurrency(endingDifference)}
          tone={toneClass(endingDifference)}
          supporting={`Ending-balance goal: ${formatCurrency(outcome.targetEndingBalance)}`}
        />
        <DetailCard
          label="Living Standard supported"
          value={livingStandardLabel(outcome.livingStandard)}
          baseline={livingStandardLabel(baseline.livingStandard)}
          difference={statusLabel(outcome.status)}
          tone=""
        />
        {activeExperiment === "retirement-age" && (
          <DetailCard
            label="State Pension timing"
            value={statePensionIncluded ? `Starts at age ${statePensionAge}` : "Not included"}
            baseline="State Pension assumption"
            difference={
              !statePensionIncluded
                ? "Retirement income is modelled without State Pension"
                : statePensionGap > 0
                  ? `${statePensionGap} ${
                      statePensionGap === 1 ? "year" : "years"
                    } before State Pension`
                  : "Available from retirement"
            }
            tone=""
            supporting={
              statePensionIncluded && statePensionGap > 0
                ? "Your private pension needs to bridge this period."
                : undefined
            }
          />
        )}
        <DetailCard
          label="Capital-preservation result"
          value={statusLabel(outcome.status)}
          baseline={statusLabel(baseline.status)}
          difference={
            outcome.status === "shortfall"
              ? "Saved spending is above the amount compatible with the ending-balance goal"
              : "Saved spending is compatible with the ending-balance goal"
          }
          tone={outcome.status === "shortfall" ? "is-negative" : "is-positive"}
          supporting="This is deliberately separate from whether the saved income strategy lasts to your planning age."
        />
      </div>
    </section>
  );
}

function DetailCard({
  label,
  value,
  baseline,
  difference,
  tone,
  supporting,
}: {
  label: string;
  value: string;
  baseline: string;
  difference: string;
  tone: string;
  supporting?: string;
}) {
  return (
    <div className="what-if-detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={tone}>{difference}</em>
      <small>Saved plan: {baseline}</small>
      {supporting && <small>{supporting}</small>}
    </div>
  );
}

function createSummaryContext(
  experiment: ExperimentId,
  retirementAge: number,
  hasChanged: boolean,
): string {
  if (experiment === "retirement-age") {
    return hasChanged
      ? `The direct pension impact is shown above. This section checks age ${retirementAge} against the rest of your saved plan.`
      : "The direct pension position is shown above. This section checks your saved retirement age against the rest of your plan.";
  }
  if (!hasChanged) return "Move an experiment control to compare it with the saved plan.";
  return "See the main effect of this change compared with your saved plan.";
}

function targetVerdict(difference: number): string {
  if (Math.abs(difference) < 0.5) return "Income target met";
  return difference > 0 ? "Above your income target" : "Below your income target";
}

function createTargetExplanation(
  experiment: ExperimentId,
  retirementAge: number,
  targetIncome: number,
  difference: number,
): string {
  const amount = `${formatCurrency(Math.abs(difference))}/year`;
  const target = `${formatCurrency(targetIncome)}/year`;
  const position = difference >= 0 ? "above" : "below";
  const prefix =
    experiment === "retirement-age"
      ? `With retirement at ${retirementAge}, the modelled sustainable income is`
      : "This change would leave your illustrated income";
  return `${prefix} ${amount} ${position} your ${target} income target.`;
}

function getOutcomeVerdict(
  experiment: ExperimentId,
  pensionDifference: number,
  incomeDifference: number,
) {
  const financialDifference =
    Math.abs(incomeDifference) >= 1 ? incomeDifference : pensionDifference;
  const baselineScale = Math.max(
    Math.abs(pensionDifference),
    Math.abs(incomeDifference),
    1,
  );
  const isSimilar =
    Math.abs(financialDifference) < Math.max(50, baselineScale * 0.005);

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
  const direction =
    incomeDifference > 0
      ? "increases"
      : incomeDifference < 0
        ? "reduces"
        : "barely changes";
  const pensionDirection =
    pensionDifference > 0
      ? "larger"
      : pensionDifference < 0
        ? "smaller"
        : "similar";

  switch (experiment) {
    case "retirement-age":
      return `Changing retirement age ${direction} the sustainable retirement income and leaves a ${pensionDirection} pension pot at retirement.`;
    case "contributions":
      return `Changing contributions leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "spending":
      return "A higher spending target can improve retirement lifestyle, but it also asks more of the pension.";
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

function livingStandardLabel(
  level: RetirementSpendingOutcome["livingStandard"],
): string {
  if (level === null) return "Below Minimum";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "£0";
  const prefix = value > 0 ? "+" : "−";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function formatPercentDifference(value: number, baseline: number): string | null {
  if (Math.abs(baseline) < 0.5 || Math.abs(value) < 0.5) return null;
  const percent = Math.round((value / Math.abs(baseline)) * 100);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

function toneClass(value: number): string {
  if (value > 0.5) return "is-positive";
  if (value < -0.5) return "is-negative";
  return "";
}
