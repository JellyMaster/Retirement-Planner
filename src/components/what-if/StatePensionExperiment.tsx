import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { useWhatIfDisplaySettings } from "./whatIfDisplaySettings";

interface StatePensionExperimentProps {
  activePlanName: string;
  retirementAge: number;
  planningAge: number;
  baselineIncluded: boolean;
  included: boolean;
  baselineAnnualAmount: number;
  annualAmount: number;
  baselineStartAge: number;
  startAge: number;
  privateAnnualIncome: number;
  targetIncome: number;
  canSave: boolean;
  saveMessage: string | null;
  onIncludedChange: (included: boolean) => void;
  onAnnualAmountChange: (amount: number) => void;
  onStartAgeChange: (age: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function StatePensionExperiment({
  activePlanName,
  retirementAge,
  planningAge,
  baselineIncluded,
  included,
  baselineAnnualAmount,
  annualAmount,
  baselineStartAge,
  startAge,
  privateAnnualIncome,
  targetIncome,
  canSave,
  saveMessage,
  onIncludedChange,
  onAnnualAmountChange,
  onStartAgeChange,
  onReset,
  onSave,
}: StatePensionExperimentProps) {
  const { viewMode } = useWhatIfDisplaySettings();
  const baselineStateIncome = baselineIncluded ? baselineAnnualAmount : 0;
  const stateIncome = included ? annualAmount : 0;
  const baselineTotalIncome = privateAnnualIncome + baselineStateIncome;
  const totalIncome = privateAnnualIncome + stateIncome;
  const baselineCoverage = percentageOfTarget(baselineTotalIncome, targetIncome);
  const coverage = percentageOfTarget(totalIncome, targetIncome);
  const privateGap = Math.max(0, targetIncome - stateIncome);
  const baselinePrivateGap = Math.max(0, targetIncome - baselineStateIncome);
  const incomeDifference = totalIncome - baselineTotalIncome;
  const hasChanged =
    included !== baselineIncluded ||
    annualAmount !== baselineAnnualAmount ||
    startAge !== baselineStartAge;
  const amountMaximum = roundUp(
    Math.max(20_000, baselineAnnualAmount * 2, annualAmount),
    1_000,
  );

  return (
    <section className="what-if-workspace" aria-labelledby="state-pension-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="state-pension-experiment-title">State Pension</h2>
          <p>
            Explore what your retirement could look like with or without State Pension income.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <div className="what-if-control-panel what-if-extra-control">
          <div className="what-if-control-copy">
            <span>Include State Pension</span>
            <strong>{included ? "Included" : "Not included"}</strong>
            <small>Saved plan: {baselineIncluded ? "included" : "not included"}</small>
          </div>
          <label className="what-if-toggle-row">
            <span>
              <strong>Use State Pension in this experiment</strong>
              <small>
                Turn this off to see what the plan looks like without State Pension income.
              </small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={included}
              aria-label="Include State Pension in experiment"
              onChange={(event) => onIncludedChange(event.target.checked)}
            />
          </label>
        </div>

        {included && (
          <>
            <div className="what-if-control-panel">
              <div className="what-if-control-copy">
                <span>Illustrated annual State Pension</span>
                <strong>{formatCurrency(annualAmount)}/year</strong>
                <small>Saved plan: {formatCurrency(baselineAnnualAmount)}/year</small>
              </div>
              <div className="what-if-slider-wrap">
                <input
                  type="range"
                  min={0}
                  max={amountMaximum}
                  step={250}
                  value={annualAmount}
                  aria-label="Experimental annual State Pension amount"
                  aria-valuetext={`${formatCurrency(annualAmount)} per year`}
                  onChange={(event) => onAnnualAmountChange(Number(event.target.value))}
                />
                <div className="what-if-slider-labels" aria-hidden="true">
                  <span>£0</span>
                  <span>Saved · {formatCurrency(baselineAnnualAmount)}</span>
                  <span>{formatCurrency(amountMaximum)}</span>
                </div>
              </div>
            </div>

            <div className="what-if-control-panel">
              <div className="what-if-control-copy">
                <span>State Pension start age</span>
                <strong>Age {startAge}</strong>
                <small>Saved plan: age {baselineStartAge}</small>
              </div>
              <div className="what-if-slider-wrap">
                <input
                  type="range"
                  min={retirementAge}
                  max={planningAge}
                  step={1}
                  value={startAge}
                  aria-label="Experimental State Pension start age"
                  aria-valuetext={`Starts at age ${startAge}`}
                  onChange={(event) => onStartAgeChange(Number(event.target.value))}
                />
                <div className="what-if-slider-labels" aria-hidden="true">
                  <span>Retirement · {retirementAge}</span>
                  <span>Saved · {baselineStartAge}</span>
                  <span>Plan horizon · {planningAge}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.pension} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>{createStoryTitle(included, baselineIncluded, stateIncome - baselineStateIncome)}</h3>
          <p>
            {included
              ? `${formatCurrency(annualAmount)} a year is included from age ${startAge}. Before then, your other retirement income needs to cover your spending.`
              : `Without State Pension in this experiment, your other retirement income would need to cover the full ${formatCurrency(targetIncome)}/year target.`}
          </p>
        </div>
      </article>

      {viewMode === "simple" ? (
        <section className="what-if-outcomes" aria-labelledby="state-pension-simple-title">
          <div className="what-if-section-heading">
            <div>
              <p className="planner-eyebrow">Simple outcome</p>
              <h3 id="state-pension-simple-title">What changes for your retirement income?</h3>
            </div>
          </div>
          <div className="what-if-simple-impact-grid">
            <SimpleCard
              label="State Pension in this experiment"
              value={included ? `${formatCurrency(annualAmount)}/year` : "Not included"}
              note={included ? `Starts at age ${startAge}` : "No State Pension income is counted"}
            />
            <SimpleCard
              label="Estimated income from State Pension age"
              value={`${formatCurrency(totalIncome)}/year`}
              note={`Saved plan: ${formatCurrency(baselineTotalIncome)}/year`}
              tone={toneClassName(incomeDifference)}
            />
            <SimpleCard
              label={incomeDifference >= 0 ? "More income than saved plan" : "Less income than saved plan"}
              value={`${formatCurrency(Math.abs(incomeDifference))}/year`}
              note={incomeDifference === 0 ? "No change" : "Difference from your saved plan"}
              tone={toneClassName(incomeDifference)}
            />
            <SimpleCard
              label="Your income target"
              value={`${formatCurrency(targetIncome)}/year`}
              note={coverage >= 100 ? "Estimated income meets this target" : "Estimated income is below this target"}
              tone={coverage >= 100 ? "positive" : "negative"}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="what-if-outcomes" aria-labelledby="state-pension-outcomes-title">
            <div className="what-if-section-heading">
              <div>
                <p className="planner-eyebrow">Live outcome</p>
                <h3 id="state-pension-outcomes-title">How State Pension changes the income picture</h3>
              </div>
              <span>From State Pension age</span>
            </div>
            <div className="what-if-outcome-grid">
              <OutcomeCard
                label="State Pension income"
                baseline={`${formatCurrency(baselineStateIncome)}/year`}
                experiment={`${formatCurrency(stateIncome)}/year`}
                difference={`${formatSignedCurrency(stateIncome - baselineStateIncome)}/year`}
              />
              <OutcomeCard
                label="Combined illustrated income"
                baseline={`${formatCurrency(baselineTotalIncome)}/year`}
                experiment={`${formatCurrency(totalIncome)}/year`}
                difference={`${formatSignedCurrency(incomeDifference)}/year`}
              />
              <OutcomeCard
                label="Target coverage"
                baseline={`${baselineCoverage}%`}
                experiment={`${coverage}%`}
                difference={formatSignedPercentage(coverage - baselineCoverage)}
              />
              <OutcomeCard
                label="Private income still required"
                baseline={`${formatCurrency(baselinePrivateGap)}/year`}
                experiment={`${formatCurrency(privateGap)}/year`}
                difference={`${formatSignedCurrency(privateGap - baselinePrivateGap)}/year`}
                lowerIsBetter
              />
            </div>
          </section>

          <div className="what-if-explanation-grid">
            <article className="what-if-impact-panel">
              <p className="planner-eyebrow">Biggest effects</p>
              <h3>What moved most</h3>
              <ol>
                <li>
                  <span>Combined annual income</span>
                  <strong className={toneClass(incomeDifference)}>
                    {formatSignedCurrency(incomeDifference)}/year
                  </strong>
                </li>
                <li>
                  <span>Target coverage</span>
                  <strong className={toneClass(coverage - baselineCoverage)}>
                    {formatSignedPercentage(coverage - baselineCoverage)}
                  </strong>
                </li>
                <li>
                  <span>Private income required</span>
                  <strong className={toneClass(-(privateGap - baselinePrivateGap))}>
                    {formatSignedCurrency(privateGap - baselinePrivateGap)}/year
                  </strong>
                </li>
              </ol>
            </article>
            <article className="what-if-why-panel">
              <p className="planner-eyebrow">Why it changes</p>
              <h3>The mechanics behind the result</h3>
              <ul>
                <li>
                  <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                  <span>State Pension adds income; it does not increase the private pension balance.</span>
                </li>
                <li>
                  <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                  <span>The private pension must bridge any years between retirement and State Pension starting.</span>
                </li>
                <li>
                  <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
                  <span>The amount is illustrative and should match the user&apos;s own forecast.</span>
                </li>
              </ul>
            </article>
          </div>
        </>
      )}

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Change a State Pension setting to begin"}</strong>
          <span>
            {hasChanged
              ? "Save this experiment when the income pattern is worth keeping."
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
            Save experiment
          </button>
        </div>
      </footer>
      {saveMessage && <p className="what-if-save-message" role="status">{saveMessage}</p>}
    </section>
  );
}

function SimpleCard({
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
  baseline,
  experiment,
  difference,
  lowerIsBetter = false,
}: {
  label: string;
  baseline: string;
  experiment: string;
  difference: string;
  lowerIsBetter?: boolean;
}) {
  const negative = difference.startsWith("−") || difference.startsWith("-");
  const positive = difference.startsWith("+");
  const good = lowerIsBetter ? negative : positive;
  const bad = lowerIsBetter ? positive : negative;
  return (
    <article className="what-if-outcome-card">
      <span>{label}</span>
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${good ? " is-positive" : bad ? " is-negative" : ""}`}>{difference}</em>
    </article>
  );
}

function percentageOfTarget(income: number, target: number): number {
  return Math.max(0, Math.round((income / Math.max(1, target)) * 100));
}

function createStoryTitle(included: boolean, baselineIncluded: boolean, difference: number): string {
  if (!included) {
    return baselineIncluded
      ? "Without State Pension, more income needs to come from elsewhere"
      : "State Pension remains excluded";
  }
  if (!baselineIncluded) return "Adding State Pension could increase your retirement income";
  if (difference > 0) return "A higher State Pension amount increases projected income";
  if (difference < 0) return "A lower State Pension amount leaves more income to find elsewhere";
  return "The saved State Pension income is unchanged";
}

function roundUp(value: number, interval: number): number {
  return Math.ceil(value / interval) * interval;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function toneClass(value: number): string | undefined {
  if (value > 0.5) return "is-positive";
  if (value < -0.5) return "is-negative";
  return undefined;
}

function toneClassName(value: number): "positive" | "negative" | "neutral" {
  if (value > 0.5) return "positive";
  if (value < -0.5) return "negative";
  return "neutral";
}
