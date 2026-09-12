import type { RetirementSpendingOutcome } from "../../../engine/drawdown/createRetirementSpendingOutcome";
import { formatCurrency } from "../../../utils/formatters";
import type { ExperimentId } from "../ExperimentLauncher";
import { setWhatIfViewMode, useWhatIfDisplaySettings } from "../whatIfDisplaySettings";

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
  "extra-saving": "What if I saved more later?",
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
  const includesStatePension = retirementOutcome?.includesStatePension ?? baselineRetirementOutcome?.includesStatePension ?? true;

  if (
    (activeExperiment === "retirement-age" || activeExperiment === "contributions" || activeExperiment === "extra-saving") &&
    baselineRetirementOutcome &&
    retirementOutcome
  ) {
    return (
      <SavedPlanAssessment
        experiment={activeExperiment}
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

  const outcomeVerdict = getOutcomeVerdict(activeExperiment, pensionDifference, incomeDifference);
  const targetIncome = retirementOutcome?.targetNetSpending ?? baselineRetirementOutcome?.targetNetSpending;
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
          <span>Move the experiment control to see how it affects your pension and retirement income.</span>
        </div>
      )}

      {showBaselineMetrics && (
        <div className="what-if-before-after-grid">
          <OutcomeCard
            label="Pension at retirement"
            value={formatCurrency(projectedPension)}
            baseline={formatCurrency(baselineProjectedPension)}
            difference={hasChanged ? formatSignedCurrency(pensionDifference) : null}
            percent={hasChanged ? formatPercentDifference(pensionDifference, baselineProjectedPension) : null}
            tone={toneClass(pensionDifference)}
          />
          <OutcomeCard
            label="Illustrated retirement income"
            value={`${formatCurrency(annualIncome)}/year`}
            baseline={`${formatCurrency(baselineAnnualIncome)}/year`}
            difference={hasChanged ? `${formatSignedCurrency(incomeDifference)}/year` : null}
            percent={hasChanged ? formatPercentDifference(incomeDifference, baselineAnnualIncome) : null}
            tone={toneClass(incomeDifference)}
          />
        </div>
      )}

      {hasChanged && (
        <article className={`what-if-verdict ${targetDifference === null ? outcomeVerdict.className : toneClass(targetDifference)}`}>
          <div><p className="planner-eyebrow">Plan assessment</p><h3>{targetDifference === null ? outcomeVerdict.label : targetVerdict(targetDifference)}</h3></div>
          <p>
            {targetDifference === null
              ? createExplanation(activeExperiment, pensionDifference, incomeDifference)
              : createTargetExplanation(activeExperiment, retirementAge, targetIncome ?? 0, targetDifference)}
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

function SavedPlanAssessment({
  experiment,
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
  experiment: "retirement-age" | "contributions" | "extra-saving";
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
  const firstProblemAge = assessed.savedPlanFirstNetIncomeShortfallAge ?? assessed.savedPlanDepletionAge;
  const targetIncome = assessed.targetNetSpending;
  const planHorizon = planningAge === undefined ? "your planning age" : `age ${planningAge}`;
  const resultValue = supportsTarget
    ? `Yes — to ${planHorizon}`
    : firstProblemAge === null
      ? "No — not for the full plan"
      : `No — shortfall from age ${firstProblemAge}`;
  const resultNote = supportsTarget
    ? `Your saved retirement income lasts through ${planHorizon}`
    : firstProblemAge === null
      ? "Your saved retirement income does not last for the full plan"
      : `Your saved retirement income first falls short at age ${firstProblemAge}`;
  const isRetirementAge = experiment === "retirement-age";
  const isExtraSaving = experiment === "extra-saving";
  const experimentLabel = isExtraSaving ? "future extra-saving" : "saving";

  return (
    <section className={`what-if-insights${detailed ? "" : " what-if-insights-simple"}`} aria-labelledby="decision-summary-title">
      <header className="what-if-insights-header">
        <div>
          <p className="planner-eyebrow">What does this mean for your plan?</p>
          <h2 id="decision-summary-title">
            {isRetirementAge
              ? hasChanged
                ? `Does retiring at ${retirementAge} still support your plan?`
                : "Does your saved retirement age support your plan?"
              : isExtraSaving
                ? hasChanged
                  ? "Does this future extra saving improve your retirement plan?"
                  : "Does your saved future-saving plan support your retirement?"
                : hasChanged
                  ? "Does this saving change improve your retirement plan?"
                  : "Does your saved contribution plan support your retirement?"}
          </h2>
          <p>
            {isRetirementAge
              ? hasChanged
                ? `We've kept the rest of your plan the same and checked whether your saved retirement income still lasts through ${planHorizon}.`
                : baselineRetirementAge === undefined
                  ? `We've kept your saved plan unchanged and checked whether your retirement income lasts through ${planHorizon}.`
                  : `We've kept your saved plan unchanged and checked whether retiring at ${baselineRetirementAge} provides your retirement income through ${planHorizon}.`
              : hasChanged
                ? `We've changed only the ${experimentLabel} choices in this experiment and checked whether your saved retirement income now lasts through ${planHorizon}.`
                : `We've kept your saved plan unchanged and checked whether your retirement income lasts through ${planHorizon}.`}
          </p>
        </div>
      </header>

      {detailed && (
        <PlanConstantsSummary
          incomeGoal={targetIncome}
          planningAge={planningAge}
          statePensionIncluded={statePensionIncluded}
          takingLumpSumCash={baseline.taxFreeCashTaken > 0}
        />
      )}

      <div className="what-if-simple-impact-grid" aria-label="Retirement plan check">
        <SimpleImpactCard
          label="Your retirement income goal"
          value={`${formatCurrency(targetIncome)}/year`}
          note={isRetirementAge ? "Everything else in your plan stays the same" : "Your retirement choices stay the same"}
        />
        <SimpleImpactCard
          label="Does your income plan last?"
          value={resultValue}
          note={resultNote}
          tone={supportsTarget ? "positive" : "negative"}
        />
      </div>

      <article className={`what-if-simple-meaning ${supportsTarget ? "is-positive" : "is-negative"}`}>
        <p className="planner-eyebrow">Plan assessment</p>
        <h3>
          {supportsTarget
            ? isRetirementAge
              ? "Your saved plan still works with this retirement age"
              : isExtraSaving
                ? "Your retirement income plan works with this future saving change"
                : "Your retirement income plan works with this saving change"
            : isRetirementAge
              ? "Your saved plan no longer works through the full planning period"
              : isExtraSaving
                ? "This future saving change is not enough for the full planning period"
                : "This saving change is not enough for the full planning period"}
        </h3>
        <p>
          {supportsTarget
            ? `With the other retirement choices left unchanged, your saved income plan provides your ${formatCurrency(targetIncome)}/year net income goal through ${planHorizon}.`
            : firstProblemAge === null
              ? `With the other retirement choices left unchanged, your saved income plan cannot provide your ${formatCurrency(targetIncome)}/year net income goal through ${planHorizon}.`
              : `Your ${formatCurrency(targetIncome)}/year net income goal is initially met, but the saved income plan first falls short around age ${firstProblemAge}.`}
        </p>
        <small>
          {statePensionIncluded
            ? `State Pension remains included from age ${statePensionAge}; only ${isRetirementAge ? "the retirement-age decision" : isExtraSaving ? "the future extra-saving choices" : "the saving choices"} changed.`
            : `State Pension remains excluded; only ${isRetirementAge ? "the retirement-age decision" : isExtraSaving ? "the future extra-saving choices" : "the saving choices"} changed.`}
        </small>
      </article>

      {detailed ? (
        <RetirementImpactDetails
          baseline={baseline}
          outcome={outcome}
          activeExperiment={experiment}
          retirementAge={retirementAge}
          statePensionAge={statePensionAge}
          statePensionIncluded={statePensionIncluded}
        />
      ) : (
        <button type="button" className="what-if-simple-detail-action" onClick={() => setWhatIfViewMode("detailed")}>
          <span><strong>See the financial details</strong><small>See the unchanged retirement choices and the extra ending-balance check.</small></span>
          <span aria-hidden="true">›</span>
        </button>
      )}
    </section>
  );
}

function PlanConstantsSummary({ incomeGoal, planningAge, statePensionIncluded, takingLumpSumCash }: { incomeGoal: number; planningAge?: number; statePensionIncluded: boolean; takingLumpSumCash: boolean }) {
  return (
    <aside className="what-if-plan-constants" aria-label="What we've kept the same">
      <div className="what-if-plan-constants-heading">
        <strong>What we’ve kept the same</strong>
        <span>Key choices from your saved plan that haven’t changed in this experiment.</span>
      </div>
      <dl>
        <div><dt>Income goal</dt><dd>{formatCurrency(incomeGoal)}/year</dd></div>
        <div><dt>Planning to age</dt><dd>{planningAge ?? "—"}</dd></div>
        <div><dt>State Pension included</dt><dd>{statePensionIncluded ? "Yes" : "No"}</dd></div>
        <div><dt>Taking lump sum cash</dt><dd>{takingLumpSumCash ? "Yes" : "No"}</dd></div>
      </dl>
    </aside>
  );
}

function SimpleImpactCard({ label, value, note, tone = "neutral" }: { label: string; value: string; note: string; tone?: "positive" | "negative" | "neutral" }) {
  return <article className={`what-if-simple-impact-card is-${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function OutcomeCard({ label, value, baseline, difference, percent, tone }: { label: string; value: string; baseline: string; difference: string | null; percent: string | null; tone: string }) {
  return (
    <article className="what-if-before-after-card">
      <span>{label}</span><strong className="what-if-outcome-value">{value}</strong>
      {difference && <em className={tone}>{difference}{percent ? ` (${percent})` : ""}</em>}
      <small>Saved plan: {baseline}</small>
    </article>
  );
}

function RetirementImpactDetails({ baseline, outcome, activeExperiment, retirementAge, statePensionAge, statePensionIncluded }: { baseline: RetirementSpendingOutcome; outcome: RetirementSpendingOutcome; activeExperiment: ExperimentId; retirementAge: number; statePensionAge: number; statePensionIncluded: boolean }) {
  const sustainableDifference = outcome.sustainableNetSpending - baseline.sustainableNetSpending;
  const headroomDifference = outcome.annualHeadroom - baseline.annualHeadroom;
  const endingDifference = outcome.modelledEndingBalance - baseline.modelledEndingBalance;
  const statePensionGap = Math.max(0, statePensionAge - retirementAge);

  return (
    <section className="what-if-details" aria-labelledby="retirement-impact-details-title">
      <h3 id="retirement-impact-details-title">Extra financial checks</h3>
      <p>The plan check above follows the retirement income strategy you actually saved. These extra figures ask a different question: how much could you spend while still keeping the pension balance you chose to leave at your planning age?</p>
      <div className="what-if-details-grid">
        <DetailCard label="Income while keeping your target balance" value={`${formatCurrency(outcome.sustainableNetSpending)}/year`} baseline={`${formatCurrency(baseline.sustainableNetSpending)}/year`} difference={`${formatSignedCurrency(sustainableDifference)}/year`} tone={toneClass(sustainableDifference)} supporting="This is an extra ending-balance check, not the income produced by your saved withdrawal strategy." />
        <DetailCard label="Difference from your income target" value={`${formatSignedCurrency(outcome.annualHeadroom)}/year`} baseline={`${formatSignedCurrency(baseline.annualHeadroom)}/year`} difference={`${formatSignedCurrency(headroomDifference)}/year`} tone={toneClass(headroomDifference)} />
        <DetailCard label="Pension left at your planning age" value={formatCurrency(outcome.modelledEndingBalance)} baseline={formatCurrency(baseline.modelledEndingBalance)} difference={formatSignedCurrency(endingDifference)} tone={toneClass(endingDifference)} supporting={`Your target balance: ${formatCurrency(outcome.targetEndingBalance)}`} />
        <DetailCard label="Retirement living standard" value={livingStandardLabel(outcome.livingStandard)} baseline={livingStandardLabel(baseline.livingStandard)} difference={statusLabel(outcome.status)} tone="" />
        {activeExperiment === "retirement-age" && (
          <DetailCard
            label="State Pension timing"
            value={statePensionIncluded ? `Starts at age ${statePensionAge}` : "Not included"}
            baseline="State Pension assumption"
            difference={!statePensionIncluded ? "Retirement income is modelled without State Pension" : statePensionGap > 0 ? `${statePensionGap} ${statePensionGap === 1 ? "year" : "years"} before State Pension` : "Available from retirement"}
            tone=""
            supporting={statePensionIncluded && statePensionGap > 0 ? "Your private pension needs to bridge this period." : undefined}
          />
        )}
        <DetailCard label="Ending-balance check" value={statusLabel(outcome.status)} baseline={statusLabel(baseline.status)} difference={outcome.status === "shortfall" ? "Your saved spending is above the amount that would keep your target balance" : "Your saved spending is compatible with keeping your target balance"} tone={outcome.status === "shortfall" ? "is-negative" : "is-positive"} supporting="This is a separate check. It does not change the answer above about whether your saved income plan lasts to your planning age." />
      </div>
    </section>
  );
}

function DetailCard({ label, value, baseline, difference, tone, supporting }: { label: string; value: string; baseline: string; difference: string; tone: string; supporting?: string }) {
  return <div className="what-if-detail-card"><span>{label}</span><strong>{value}</strong><em className={tone}>{difference}</em><small>Saved plan: {baseline}</small>{supporting && <small>{supporting}</small>}</div>;
}

function createSummaryContext(experiment: ExperimentId, retirementAge: number, hasChanged: boolean): string {
  if (experiment === "retirement-age") return hasChanged ? `The direct pension impact is shown above. This section checks age ${retirementAge} against the rest of your saved plan.` : "The direct pension position is shown above. This section checks your saved retirement age against the rest of your plan.";
  if (!hasChanged) return "Move an experiment control to compare it with the saved plan.";
  return "See the main effect of this change compared with your saved plan.";
}

function targetVerdict(difference: number): string {
  if (Math.abs(difference) < 0.5) return "Income target met";
  return difference > 0 ? "Above your income target" : "Below your income target";
}

function createTargetExplanation(experiment: ExperimentId, retirementAge: number, targetIncome: number, difference: number): string {
  const amount = `${formatCurrency(Math.abs(difference))}/year`;
  const target = `${formatCurrency(targetIncome)}/year`;
  const position = difference >= 0 ? "above" : "below";
  const prefix = experiment === "retirement-age" ? `With retirement at ${retirementAge}, the modelled sustainable income is` : "This change would leave your illustrated income";
  return `${prefix} ${amount} ${position} your ${target} income target.`;
}

function getOutcomeVerdict(experiment: ExperimentId, pensionDifference: number, incomeDifference: number) {
  const financialDifference = Math.abs(incomeDifference) >= 1 ? incomeDifference : pensionDifference;
  const baselineScale = Math.max(Math.abs(pensionDifference), Math.abs(incomeDifference), 1);
  const isSimilar = Math.abs(financialDifference) < Math.max(50, baselineScale * 0.005);
  if (isSimilar) return { label: "Similar outcome", className: "is-similar" };
  if (experiment === "spending") return financialDifference >= 0 ? { label: "More flexibility", className: "is-positive" } : { label: "More pressure", className: "is-negative" };
  return financialDifference > 0 ? { label: "More flexibility", className: "is-positive" } : { label: "More pressure", className: "is-negative" };
}

function createExplanation(experiment: ExperimentId, pensionDifference: number, incomeDifference: number): string {
  const direction = incomeDifference > 0 ? "increases" : incomeDifference < 0 ? "reduces" : "barely changes";
  const pensionDirection = pensionDifference > 0 ? "larger" : pensionDifference < 0 ? "smaller" : "similar";
  switch (experiment) {
    case "retirement-age": return `Changing retirement age ${direction} the sustainable retirement income and leaves a ${pensionDirection} pension pot at retirement.`;
    case "contributions": return `Changing contributions leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "extra-saving": return `Changing future extra saving leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "spending": return "A higher spending target can improve retirement lifestyle, but it also asks more of the pension.";
    case "fees": return `The fee change leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
    case "returns": return `The return assumption leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income. Returns are an assumption, not a guaranteed outcome.`;
    case "inflation": return `The inflation assumption ${direction} the spending power illustrated by the plan. The comparison is shown in today's-money terms where possible.`;
    case "state-pension": return `The State Pension change ${direction} the income available in retirement and changes how much needs to come from the private pension.`;
    case "market-downturn": return `The market fall leaves a ${pensionDirection} pension pot at retirement and ${direction} the illustrated retirement income.`;
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
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
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
