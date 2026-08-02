import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface ReturnExperimentProps {
  activePlanName: string;
  baselineReturn: number;
  annualReturn: number;
  yearsToRetirement: number;
  baselineGrowth: number;
  growth: number;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  onReturnChange: (annualReturn: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function ReturnExperiment({
  activePlanName,
  baselineReturn,
  annualReturn,
  yearsToRetirement,
  baselineGrowth,
  growth,
  baselineProjectedPension,
  projectedPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onReturnChange,
  onReset,
  onSave,
}: ReturnExperimentProps) {
  const returnDifference = annualReturn - baselineReturn;
  const growthDifference = growth - baselineGrowth;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const hasChanged = Math.abs(returnDifference) > 0.000001;

  return (
    <section className="what-if-workspace" aria-labelledby="return-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="return-experiment-title">Investment returns</h2>
          <p>
            Test a more cautious or optimistic annual growth assumption while
            keeping contributions, fees and retirement timing unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-control-panel">
        <div className="what-if-control-copy">
          <span>Expected annual return</span>
          <strong>{formatPercentage(annualReturn)}</strong>
          <small>
            Saved plan: {formatPercentage(baselineReturn)} · {formatReturnChange(returnDifference)}
          </small>
        </div>
        <div className="what-if-slider-wrap">
          <input
            type="range"
            min={0}
            max={0.12}
            step={0.001}
            value={annualReturn}
            aria-label="Experimental annual investment return"
            aria-valuetext={`${formatPercentage(annualReturn)} expected annual return`}
            onChange={(event) => onReturnChange(Number(event.target.value))}
          />
          <div className="what-if-slider-labels" aria-hidden="true">
            <span>0%</span>
            <span>Saved · {formatPercentage(baselineReturn)}</span>
            <span>12%</span>
          </div>
          <p className="what-if-control-note">
            This is an illustration, not a forecast. Actual returns will vary from
            year to year and may be negative.
          </p>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.growth} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>
            {!hasChanged
              ? "The saved return assumption is unchanged"
              : returnDifference > 0
                ? "A higher assumed return increases the illustrated outcome"
                : "A lower assumed return gives a more cautious illustration"}
          </h3>
          <p>
            {!hasChanged
              ? "Move the return slider to see how sensitive the plan is to its growth assumption."
              : `Using ${formatPercentage(annualReturn)} could change illustrated investment growth by ${formatSignedCurrency(growthDifference)} and the projected pension by ${formatSignedCurrency(pensionDifference)}.`}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="return-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="return-outcomes-title">How the return assumption changes the plan</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard label="Investment growth" baseline={formatCurrency(baselineGrowth)} experiment={formatCurrency(growth)} difference={formatSignedCurrency(growthDifference)} />
          <OutcomeCard label="Projected pension" baseline={formatCurrency(baselineProjectedPension)} experiment={formatCurrency(projectedPension)} difference={formatSignedCurrency(pensionDifference)} />
          <OutcomeCard label="Illustrated annual income" baseline={`${formatCurrency(baselineAnnualIncome)}/year`} experiment={`${formatCurrency(annualIncome)}/year`} difference={`${formatSignedCurrency(incomeDifference)}/year`} />
          <OutcomeCard label="Target coverage" baseline={`${baselinePreparedness}%`} experiment={`${preparedness}%`} difference={formatSignedPercentage(preparednessDifference)} />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            <li><span>Investment growth</span><strong className={toneClass(growthDifference)}>{formatSignedCurrency(growthDifference)}</strong></li>
            <li><span>Projected pension</span><strong className={toneClass(pensionDifference)}>{formatSignedCurrency(pensionDifference)}</strong></li>
            <li><span>Annual retirement income</span><strong className={toneClass(incomeDifference)}>{formatSignedCurrency(incomeDifference)}/year</strong></li>
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Investment returns are applied to the growing pension balance each year.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Compounding makes small annual differences more significant over {yearsToRetirement} years.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The experiment changes the assumed return only; fees and contributions stay fixed.</span></li>
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

function OutcomeCard({ label, baseline, experiment, difference }: { label: string; baseline: string; experiment: string; difference: string }) {
  return (
    <article className="what-if-outcome-card">
      <span>{label}</span>
      <div><small>Saved plan</small><strong>{baseline}</strong></div>
      <FontAwesomeIcon className="what-if-outcome-arrow" icon={AppIcons.chartLine} aria-hidden="true" />
      <div><small>Experiment</small><strong>{experiment}</strong></div>
      <em className={`what-if-outcome-difference${difference.startsWith("+") ? " is-positive" : difference.startsWith("−") || difference.startsWith("-") ? " is-negative" : ""}`}>{difference}</em>
    </article>
  );
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatReturnChange(value: number): string {
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
