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
  const outcome = getOutcomeVerdict(activeExperiment, pensionDifference, incomeDifference);
  const targetIncome =
    retirementOutcome?.targetNetSpending ?? baselineRetirementOutcome?.targetNetSpending;
  const targetDifference = targetIncome === undefined ? null : annualIncome - targetIncome;
  const includesStatePension =
    retirementOutcome?.includesStatePension ??
    baselineRetirementOutcome?.includesStatePension ??
    true;
  const isSimpleRetirementAge =
    activeExperiment === "retirement-age" && viewMode === "simple";
  const showBaselineMetrics = hasChanged || viewMode === "detailed";

  if (isSimpleRetirementAge) {
    return (
      <SimpleRetirementAgeSummary
        baselineRetirementAge={baselineRetirementAge}
        retirementAge={retirementAge}
        baselineAnnualIncome={baselineAnnualIncome}
        annualIncome={annualIncome}
        targetIncome={targetIncome ?? 0}
        planningAge={planningAge}
        statePensionAge={statePensionAge}
        statePensionIncluded={includesStatePension}
        hasChanged={hasChanged}
      />
    );
  }

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
            label="Estimated retirement income"
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
            <p className="planner-eyebrow">Overall effect</p>
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

function SimpleRetirementAgeSummary({
  baselineRetirementAge,
  retirementAge,
  baselineAnnualIncome,
  annualIncome,
  targetIncome,
  planningAge,
  statePensionAge,
  statePensionIncluded,
  hasChanged,
}: {
  baselineRetirementAge?: number;
  retirementAge: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  targetIncome: number;
  planningAge?: number;
  statePensionAge: number;
  statePensionIncluded: boolean;
  hasChanged: boolean;
}) {
  const displayedIncome = hasChanged ? annualIncome : baselineAnnualIncome;
  const targetDifference = displayedIncome - targetIncome;
  const ageDifference =
    baselineRetirementAge === undefined
      ? null
      : retirementAge - baselineRetirementAge;
  const statePensionGap = Math.max(0, statePensionAge - retirementAge);
  const targetSupported = targetDifference >= -0.5;

  return (
    <section
      className="what-if-insights what-if-insights-simple"
      aria-labelledby="decision-summary-title"
    >
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">Decision summary</p>
          <h2 id="decision-summary-title">
            {hasChanged
              ? `What happens if I retire at ${retirementAge}?`
              : "When could I retire?"}
          </h2>
          <p>
            {hasChanged
              ? createRetirementAgeComparison(ageDifference, baselineRetirementAge)
              : baselineRetirementAge === undefined
                ? "You are currently looking at your saved retirement plan."
                : `Your saved plan is to retire at age ${baselineRetirementAge}.`}
          </p>
        </div>
      </header>

      {!hasChanged && (
        <div className="what-if-simple-intro" role="status">
          <strong>No change yet</strong>
          <span>Move the retirement age control above to explore retiring earlier or later.</span>
        </div>
      )}

      <div
        className="what-if-simple-impact-grid"
        aria-label="Retirement decision summary"
      >
        <SimpleImpactCard
          label="Estimated retirement income"
          value={`${formatCurrency(displayedIncome)}/year`}
          note={
            hasChanged
              ? `Saved plan: ${formatCurrency(baselineAnnualIncome)}/year`
              : "Based on your saved plan"
          }
        />
        <SimpleImpactCard
          label="Your income target"
          value={`${formatCurrency(targetIncome)}/year`}
          note="The yearly income you said you would like"
        />
        <SimpleImpactCard
          label={targetSupported ? "Above your target" : "Below your target"}
          value={`${formatCurrency(Math.abs(targetDifference))}/year`}
          note={targetSupported ? "More than your target" : "Less than your target"}
          tone={targetSupported ? "positive" : "negative"}
        />
        <SimpleImpactCard
          label={
            !statePensionIncluded
              ? "State Pension"
              : statePensionGap > 0
                ? "Until State Pension"
                : "State Pension"
          }
          value={
            !statePensionIncluded
              ? "Not included"
              : statePensionGap > 0
                ? `${statePensionGap} ${statePensionGap === 1 ? "year" : "years"}`
                : `From age ${statePensionAge}`
          }
          note={
            !statePensionIncluded
              ? "Your retirement income is modelled without State Pension"
              : statePensionGap > 0
                ? `State Pension starts at age ${statePensionAge}`
                : "Included in this retirement plan"
          }
        />
      </div>

      {hasChanged ? (
        <article
          className={`what-if-simple-meaning ${
            targetSupported ? "is-positive" : "is-negative"
          }`}
        >
          <p className="planner-eyebrow">What this means</p>
          <h3>
            {targetSupported
              ? "Your income target is supported"
              : "Your income target would not be met"}
          </h3>
          <p>
            {createSimpleRetirementExplanation(
              retirementAge,
              ageDifference,
              statePensionGap,
              statePensionAge,
              statePensionIncluded,
              targetSupported,
            )}
          </p>
          {planningAge !== undefined && (
            <small>Your plan is modelled through to age {planningAge}.</small>
          )}
        </article>
      ) : planningAge !== undefined ? (
        <p className="what-if-simple-horizon">
          Your plan is modelled through to age {planningAge}.
        </p>
      ) : null}

      <button
        type="button"
        className="what-if-simple-detail-action"
        onClick={() => setWhatIfViewMode("detailed")}
      >
        <span>
          <strong>See the financial details</strong>
          <small>
            View pension balances, sustainable spending, headroom and other assumptions.
          </small>
        </span>
        <span aria-hidden="true">›</span>
      </button>
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
      <h3 id="retirement-impact-details-title">Retirement impact details</h3>
      <p>
        These use the same drawdown assumptions and ending-balance goal as your active plan.
      </p>
      <div className="what-if-details-grid">
        <DetailCard
          label="Sustainable net spending"
          value={`${formatCurrency(outcome.sustainableNetSpending)}/year`}
          baseline={`${formatCurrency(baseline.sustainableNetSpending)}/year`}
          difference={`${formatSignedCurrency(sustainableDifference)}/year`}
          tone={toneClass(sustainableDifference)}
        />
        <DetailCard
          label="Annual headroom"
          value={`${formatSignedCurrency(outcome.annualHeadroom)}/year`}
          baseline={`${formatSignedCurrency(baseline.annualHeadroom)}/year`}
          difference={`${formatSignedCurrency(headroomDifference)}/year`}
          tone={toneClass(headroomDifference)}
        />
        <DetailCard
          label="Ending pension position"
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
          label="Plan sustainability"
          value={statusLabel(outcome.status)}
          baseline={statusLabel(baseline.status)}
          difference={
            outcome.status === "shortfall"
              ? "Target spending is above the sustainable level"
              : "Target spending is within the modelled sustainable level"
          }
          tone={outcome.status === "shortfall" ? "is-negative" : "is-positive"}
          supporting="Based on your current planning horizon and ending-balance goal."
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

function createRetirementAgeComparison(
  ageDifference: number | null,
  baselineRetirementAge?: number,
): string {
  if (ageDifference === null || baselineRetirementAge === undefined) {
    return "You are comparing this retirement age with your saved plan.";
  }
  if (ageDifference === 0) {
    return `Your saved plan is to retire at age ${baselineRetirementAge}.`;
  }
  const years = Math.abs(ageDifference);
  const direction = ageDifference < 0 ? "earlier" : "later";
  return `You are retiring ${years} ${
    years === 1 ? "year" : "years"
  } ${direction} than your saved plan (${baselineRetirementAge}).`;
}

function createSimpleRetirementExplanation(
  retirementAge: number,
  ageDifference: number | null,
  statePensionGap: number,
  statePensionAge: number,
  statePensionIncluded: boolean,
  targetSupported: boolean,
): string {
  const timingExplanation =
    ageDifference === null
      ? `Retiring at ${retirementAge} changes how long your pension has to grow and how long it may need to support you.`
      : ageDifference < 0
        ? `Retiring at ${retirementAge} gives your pension less time to grow and means it needs to support you for longer.`
        : ageDifference > 0
          ? `Retiring at ${retirementAge} gives your pension more time to grow and means it needs to support fewer retirement years.`
          : "This matches your saved retirement age.";
  const pensionExplanation = !statePensionIncluded
    ? " State Pension is not included in this plan, so the retirement-income model does not count it."
    : statePensionGap > 0
      ? ` You would also need to fund ${statePensionGap} ${
          statePensionGap === 1 ? "year" : "years"
        } of retirement before State Pension starts at age ${statePensionAge}.`
      : " State Pension is included from the start of retirement under your current assumptions.";
  const targetExplanation = targetSupported
    ? " Your estimated income remains at or above the amount you said you would like."
    : " Your estimated income falls below the amount you said you would like.";
  return `${timingExplanation}${pensionExplanation}${targetExplanation}`;
}

function createSummaryContext(
  experiment: ExperimentId,
  retirementAge: number,
  hasChanged: boolean,
): string {
  if (!hasChanged) return "Move an experiment control to compare it with the saved plan.";
  if (experiment === "retirement-age") {
    return `Retiring at ${retirementAge} compared with your saved plan.`;
  }
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
      ? `Retiring at ${retirementAge} would leave your illustrated income`
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
      return `Changing retirement age ${direction} the illustrated retirement income and leaves a ${pensionDirection} pension pot at retirement.`;
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
