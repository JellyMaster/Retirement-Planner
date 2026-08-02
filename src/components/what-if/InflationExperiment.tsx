import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface InflationExperimentProps {
  activePlanName: string;
  baselineInflation: number;
  inflation: number;
  yearsToRetirement: number;
  baselineNominalPension: number;
  nominalPension: number;
  baselineRealPension: number;
  realPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  onInflationChange: (inflation: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function InflationExperiment({
  activePlanName,
  baselineInflation,
  inflation,
  yearsToRetirement,
  baselineNominalPension,
  nominalPension,
  baselineRealPension,
  realPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onInflationChange,
  onReset,
  onSave,
}: InflationExperimentProps) {
  const inflationDifference = inflation - baselineInflation;
  const nominalDifference = nominalPension - baselineNominalPension;
  const realDifference = realPension - baselineRealPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const hasChanged = Math.abs(inflationDifference) > 0.000001;

  return (
    <section className="what-if-workspace" aria-labelledby="inflation-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="inflation-experiment-title">Inflation</h2>
          <p>
            Test how a different long-term inflation assumption changes purchasing
            power while keeping returns, fees, contributions and retirement timing fixed.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-control-panel">
        <div className="what-if-control-copy">
          <span>Expected annual inflation</span>
          <strong>{formatPercentage(inflation)}</strong>
          <small>
            Saved plan: {formatPercentage(baselineInflation)} · {formatRateChange(inflationDifference)}
          </small>
        </div>
        <div className="what-if-slider-wrap">
          <input
            type="range"
            min={0}
            max={0.08}
            step={0.001}
            value={inflation}
            aria-label="Experimental annual inflation"
            aria-valuetext={`${formatPercentage(inflation)} expected annual inflation`}
            onChange={(event) => onInflationChange(Number(event.target.value))}
          />
          <div className="what-if-slider-labels" aria-hidden="true">
            <span>0%</span>
            <span>Saved · {formatPercentage(baselineInflation)}</span>
            <span>8%</span>
          </div>
          <p className="what-if-control-note">
            Inflation is used to translate future pounds into today&apos;s spending power
            over the {yearsToRetirement} years to retirement.
          </p>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.chart} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>
            {!hasChanged
              ? "The saved inflation assumption is unchanged"
              : inflationDifference > 0
                ? "Higher inflation reduces future purchasing power"
                : "Lower inflation preserves more purchasing power"}
          </h3>
          <p>
            {!hasChanged
              ? "Move the inflation slider to see how sensitive the plan is to changes in purchasing power."
              : `Using ${formatPercentage(inflation)} inflation could change the pension value in today’s money by ${formatSignedCurrency(realDifference)}, while the future-pound balance changes by ${formatSignedCurrency(nominalDifference)}.`}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="inflation-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="inflation-outcomes-title">How inflation changes purchasing power</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard label="Pension in future pounds" baseline={formatCurrency(baselineNominalPension)} experiment={formatCurrency(nominalPension)} difference={formatSignedCurrency(nominalDifference)} neutral />
          <OutcomeCard label="Pension in today’s money" baseline={formatCurrency(baselineRealPension)} experiment={formatCurrency(realPension)} difference={formatSignedCurrency(realDifference)} />
          <OutcomeCard label="Illustrated annual income" baseline={`${formatCurrency(baselineAnnualIncome)}/year`} experiment={`${formatCurrency(annualIncome)}/year`} difference={`${formatSignedCurrency(incomeDifference)}/year`} />
          <OutcomeCard label="Target coverage" baseline={`${baselinePreparedness}%`} experiment={`${preparedness}%`} difference={formatSignedPercentage(preparednessDifference)} />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            <li><span>Today&apos;s-money pension</span><strong className={toneClass(realDifference)}>{formatSignedCurrency(realDifference)}</strong></li>
            <li><span>Annual retirement income</span><strong className={toneClass(incomeDifference)}>{formatSignedCurrency(incomeDifference)}/year</strong></li>
            <li><span>Target coverage</span><strong className={toneClass(preparednessDifference)}>{formatSignedPercentage(preparednessDifference)}</strong></li>
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Inflation reduces what each future pound can buy.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The effect compounds across the full period to retirement.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The experiment changes inflation only; nominal returns and pension fees stay fixed.</span></li>
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Move the slider to begin"}</strong>
          <span>{hasChanged ? "Save it as a scenario only when the assumption is worth comparing." : "Your saved plan has not been changed."}</span>
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

function OutcomeCard({ label, baseline, experiment, difference, neutral = false }: { label: string; baseline: string; experiment: string; difference: string; neutral?: boolean }) {
  const tone = neutral ? "" : difference.startsWith("+") ? " is-positive" : difference.startsWith("−") || difference.startsWith("-") ? " is-negative" : "";
  return (
    <article className="what-if-outcome-card">
      <span>{label}</span>
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${tone}`}>{difference}</em>
    </article>
  );
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRateChange(value: number): string {
  if (Math.abs(value) < 0.000001) return "No change";
  return `${value > 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} percentage points`;
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
