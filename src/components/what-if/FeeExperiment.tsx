import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface FeeExperimentProps {
  activePlanName: string;
  baselineFee: number;
  fee: number;
  yearsToRetirement: number;
  baselineTotalFees: number;
  totalFees: number;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  onFeeChange: (fee: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function FeeExperiment({
  activePlanName,
  baselineFee,
  fee,
  yearsToRetirement,
  baselineTotalFees,
  totalFees,
  baselineProjectedPension,
  projectedPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onFeeChange,
  onReset,
  onSave,
}: FeeExperimentProps) {
  const feeDifference = fee - baselineFee;
  const totalFeeDifference = totalFees - baselineTotalFees;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const hasChanged = Math.abs(feeDifference) > 0.000001;
  const isLower = feeDifference < 0;

  return (
    <section className="what-if-workspace" aria-labelledby="fee-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="fee-experiment-title">Lower pension fees</h2>
          <p>
            Change the annual pension charge while keeping contributions, returns
            and retirement timing unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-control-panel">
        <div className="what-if-control-copy">
          <span>Annual pension charge</span>
          <strong>{formatPercentage(fee)}</strong>
          <small>
            Saved plan: {formatPercentage(baselineFee)} · {formatFeeChange(feeDifference)}
          </small>
        </div>
        <div className="what-if-slider-wrap">
          <input
            type="range"
            min={0}
            max={0.02}
            step={0.0001}
            value={fee}
            aria-label="Experimental annual pension fee"
            aria-valuetext={`${formatPercentage(fee)} annual pension charge`}
            onChange={(event) => onFeeChange(Number(event.target.value))}
          />
          <div className="what-if-slider-labels" aria-hidden="true">
            <span>0%</span>
            <span>Saved · {formatPercentage(baselineFee)}</span>
            <span>2%</span>
          </div>
          <p className="what-if-control-note">
            Fees are deducted each year, so their effect compounds over the
            {` ${yearsToRetirement}`} years to retirement.
          </p>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.settings} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>
            {!hasChanged
              ? "The saved pension charge is unchanged"
              : isLower
                ? "Lower fees leave more of the pension invested"
                : "Higher fees reduce the amount left to compound"}
          </h3>
          <p>
            {!hasChanged
              ? "Move the fee slider to see how annual charges could affect the retirement outcome."
              : `Changing the annual charge to ${formatPercentage(fee)} could change cumulative fees by ${formatSignedCurrency(totalFeeDifference)} and the projected pension by ${formatSignedCurrency(pensionDifference)}.`}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="fee-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="fee-outcomes-title">How charges change the plan</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard
            label="Total fees before retirement"
            baseline={formatCurrency(baselineTotalFees)}
            experiment={formatCurrency(totalFees)}
            difference={formatSignedCurrency(totalFeeDifference)}
            lowerIsBetter
          />
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
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            <li><span>Cumulative pension fees</span><strong className={toneClass(-totalFeeDifference)}>{formatSignedCurrency(totalFeeDifference)}</strong></li>
            <li><span>Projected pension</span><strong className={toneClass(pensionDifference)}>{formatSignedCurrency(pensionDifference)}</strong></li>
            <li><span>Annual retirement income</span><strong className={toneClass(incomeDifference)}>{formatSignedCurrency(incomeDifference)}/year</strong></li>
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Charges are deducted from the pension throughout the saving period.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Money not taken in fees remains invested and can receive future growth.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The experiment changes fees only; the assumed investment return remains fixed.</span></li>
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Move the slider to begin"}</strong>
          <span>{hasChanged ? "Save it as a scenario only when the outcome is worth keeping." : "Your saved plan has not been changed."}</span>
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
  const numericNegative = difference.startsWith("−") || difference.startsWith("-");
  const numericPositive = difference.startsWith("+");
  const positive = lowerIsBetter ? numericNegative : numericPositive;
  const negative = lowerIsBetter ? numericPositive : numericNegative;
  return (
    <article className="what-if-outcome-card">
      <span>{label}</span>
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${positive ? " is-positive" : negative ? " is-negative" : ""}`}>{difference}</em>
    </article>
  );
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatFeeChange(value: number): string {
  if (Math.abs(value) < 0.000001) return "No change";
  const basisPoints = Math.round(Math.abs(value) * 10_000);
  return `${value > 0 ? "+" : "−"}${basisPoints} ${basisPoints === 1 ? "basis point" : "basis points"}`;
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
