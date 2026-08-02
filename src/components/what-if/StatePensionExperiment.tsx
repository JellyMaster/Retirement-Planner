import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

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
  const baselineStateIncome = baselineIncluded ? baselineAnnualAmount : 0;
  const stateIncome = included ? annualAmount : 0;
  const baselineTotalIncome = privateAnnualIncome + baselineStateIncome;
  const totalIncome = privateAnnualIncome + stateIncome;
  const baselineCoverage = percentageOfTarget(baselineTotalIncome, targetIncome);
  const coverage = percentageOfTarget(totalIncome, targetIncome);
  const privateGap = Math.max(0, targetIncome - stateIncome);
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
            Explore how including State Pension, changing its illustrated amount,
            or changing its start age affects the retirement-income picture.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <div className="what-if-control-panel what-if-extra-control">
          <div className="what-if-control-copy">
            <span>Include State Pension</span>
            <strong>{included ? "Included" : "Not included"}</strong>
            <small>
              Saved plan: {baselineIncluded ? "included" : "not included"}
            </small>
          </div>
          <label className="what-if-toggle-row">
            <span>
              <strong>Use State Pension in this experiment</strong>
              <small>
                This changes retirement income only; it does not change the private
                pension projection.
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

        <div className="what-if-control-panel">
          <div className="what-if-control-copy">
            <span>Illustrated annual State Pension</span>
            <strong>{included ? `${formatCurrency(annualAmount)}/year` : "Not used"}</strong>
            <small>Saved plan: {formatCurrency(baselineAnnualAmount)}/year</small>
          </div>
          <div className="what-if-slider-wrap">
            <input
              type="range"
              min={0}
              max={amountMaximum}
              step={250}
              value={annualAmount}
              disabled={!included}
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
              disabled={!included}
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
              ? `${formatCurrency(annualAmount)} a year would be added from age ${startAge}. Until then, the private pension must cover the full target on its own.`
              : "The private pension would need to provide the full retirement-income target without State Pension support."}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="state-pension-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="state-pension-outcomes-title">How State Pension changes the income picture</h3>
          </div>
          <span>From State Pension age</span>
        </div>
        <div className="what-if-outcome-grid">
          <OutcomeCard label="State Pension income" baseline={`${formatCurrency(baselineStateIncome)}/year`} experiment={`${formatCurrency(stateIncome)}/year`} difference={`${formatSignedCurrency(stateIncome - baselineStateIncome)}/year`} />
          <OutcomeCard label="Combined illustrated income" baseline={`${formatCurrency(baselineTotalIncome)}/year`} experiment={`${formatCurrency(totalIncome)}/year`} difference={`${formatSignedCurrency(totalIncome - baselineTotalIncome)}/year`} />
          <OutcomeCard label="Target coverage" baseline={`${baselineCoverage}%`} experiment={`${coverage}%`} difference={formatSignedPercentage(coverage - baselineCoverage)} />
          <OutcomeCard label="Private income still required" baseline={`${formatCurrency(Math.max(0, targetIncome - baselineStateIncome))}/year`} experiment={`${formatCurrency(privateGap)}/year`} difference={`${formatSignedCurrency(privateGap - Math.max(0, targetIncome - baselineStateIncome))}/year`} lowerIsBetter />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            <li><span>Combined annual income</span><strong className={toneClass(totalIncome - baselineTotalIncome)}>{formatSignedCurrency(totalIncome - baselineTotalIncome)}/year</strong></li>
            <li><span>Target coverage</span><strong className={toneClass(coverage - baselineCoverage)}>{formatSignedPercentage(coverage - baselineCoverage)}</strong></li>
            <li><span>Private income required</span><strong className={toneClass(-(privateGap - Math.max(0, targetIncome - baselineStateIncome)))}>{formatSignedCurrency(privateGap - Math.max(0, targetIncome - baselineStateIncome))}/year</strong></li>
          </ol>
        </article>
        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>State Pension adds income; it does not increase the private pension balance.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The private pension must bridge any years between retirement and State Pension starting.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The amount is illustrative and should match the user&apos;s own forecast.</span></li>
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Change a State Pension setting to begin"}</strong>
          <span>{hasChanged ? "Save it as a scenario when the income pattern is worth comparing." : "Your saved plan has not been changed."}</span>
        </div>
        <div className="what-if-toolbar-actions">
          <button type="button" className="ui-button ui-button-secondary ui-button-medium" disabled={!hasChanged} onClick={onReset}>Reset experiment</button>
          <button type="button" className="ui-button ui-button-primary ui-button-medium" disabled={!hasChanged || !canSave} onClick={onSave}>Save as scenario</button>
        </div>
      </footer>

      {saveMessage && <p className="what-if-save-message" role="status">{saveMessage}</p>}
    </section>
  );
}

function OutcomeCard({ label, baseline, experiment, difference, lowerIsBetter = false }: { label: string; baseline: string; experiment: string; difference: string; lowerIsBetter?: boolean }) {
  const negative = difference.startsWith("−") || difference.startsWith("-");
  const positive = difference.startsWith("+");
  const good = lowerIsBetter ? negative : positive;
  const bad = lowerIsBetter ? positive : negative;
  return <article className="what-if-outcome-card"><span>{label}</span><div><small>Saved plan</small><strong>{baseline}</strong></div><FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" /><div><small>Experiment</small><strong>{experiment}</strong></div><em className={`what-if-outcome-difference${good ? " is-positive" : bad ? " is-negative" : ""}`}>{difference}</em></article>;
}

function percentageOfTarget(income: number, target: number): number {
  return Math.max(0, Math.round((income / Math.max(1, target)) * 100));
}

function createStoryTitle(included: boolean, baselineIncluded: boolean, difference: number): string {
  if (!included) return baselineIncluded ? "Removing State Pension increases reliance on the private pension" : "State Pension remains excluded";
  if (!baselineIncluded) return "Adding State Pension could improve the retirement-income picture";
  if (difference > 0) return "A higher State Pension amount improves projected income";
  if (difference < 0) return "A lower State Pension amount increases the private-income gap";
  return "The saved State Pension income is unchanged";
}

function roundUp(value: number, interval: number): number { return Math.ceil(value / interval) * interval; }
function formatSignedCurrency(value: number): string { if (Math.abs(value) < 0.5) return "No change"; return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`; }
function formatSignedPercentage(value: number): string { if (value === 0) return "No change"; return `${value > 0 ? "+" : ""}${value}%`; }
function toneClass(value: number): string | undefined { if (value > 0.5) return "is-positive"; if (value < -0.5) return "is-negative"; return undefined; }
