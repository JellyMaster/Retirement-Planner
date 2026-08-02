import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface MarketDownturnExperimentProps {
  activePlanName: string;
  currentAge: number;
  retirementAge: number;
  downturnAge: number;
  downturnPercentage: number;
  balanceAtDownturn: number;
  baselineProjectedPension: number;
  projectedPension: number;
  baselineAnnualIncome: number;
  annualIncome: number;
  baselinePreparedness: number;
  preparedness: number;
  canSave: boolean;
  saveMessage: string | null;
  onAgeChange: (age: number) => void;
  onPercentageChange: (percentage: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function MarketDownturnExperiment({
  activePlanName,
  currentAge,
  retirementAge,
  downturnAge,
  downturnPercentage,
  balanceAtDownturn,
  baselineProjectedPension,
  projectedPension,
  baselineAnnualIncome,
  annualIncome,
  baselinePreparedness,
  preparedness,
  canSave,
  saveMessage,
  onAgeChange,
  onPercentageChange,
  onReset,
  onSave,
}: MarketDownturnExperimentProps) {
  const hasChanged = downturnPercentage > 0;
  const immediateLoss = balanceAtDownturn * downturnPercentage;
  const pensionDifference = projectedPension - baselineProjectedPension;
  const incomeDifference = annualIncome - baselineAnnualIncome;
  const preparednessDifference = preparedness - baselinePreparedness;
  const yearsToRecover = Math.max(0, retirementAge - downturnAge);

  return (
    <section className="what-if-workspace" aria-labelledby="market-downturn-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="market-downturn-experiment-title">Market downturn</h2>
          <p>
            Stress-test a one-off market fall while keeping the saved long-term
            return, contributions and retirement age unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-controls-stack">
        <div className="what-if-control-panel">
          <div className="what-if-control-copy">
            <span>One-off market fall</span>
            <strong>{Math.round(downturnPercentage * 100)}%</strong>
            <small>{hasChanged ? `Illustrated fall at age ${downturnAge}` : "No downturn applied"}</small>
          </div>
          <div className="what-if-slider-wrap">
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.05}
              value={downturnPercentage}
              aria-label="Experimental market downturn percentage"
              aria-valuetext={`${Math.round(downturnPercentage * 100)}% market fall`}
              onChange={(event) => onPercentageChange(Number(event.target.value))}
            />
            <div className="what-if-slider-labels" aria-hidden="true">
              <span>No fall</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="what-if-control-panel">
          <div className="what-if-control-copy">
            <span>When the downturn happens</span>
            <strong>Age {downturnAge}</strong>
            <small>{yearsToRecover} years before retirement</small>
          </div>
          <div className="what-if-slider-wrap">
            <input
              type="range"
              min={currentAge}
              max={retirementAge}
              step={1}
              value={downturnAge}
              aria-label="Experimental market downturn age"
              aria-valuetext={`Market fall at age ${downturnAge}`}
              onChange={(event) => onAgeChange(Number(event.target.value))}
            />
            <div className="what-if-slider-labels" aria-hidden="true">
              <span>Today · {currentAge}</span>
              <span>Age {downturnAge}</span>
              <span>Retirement · {retirementAge}</span>
            </div>
            <p className="what-if-control-note">
              A fall closer to retirement leaves less time for later contributions
              and investment growth to rebuild the balance.
            </p>
          </div>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.warning} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>
            {hasChanged
              ? `A ${Math.round(downturnPercentage * 100)}% fall at age ${downturnAge} could leave less time to recover`
              : "The saved plan has no one-off market fall"}
          </h3>
          <p>
            {hasChanged
              ? `The illustrated fall would initially reduce the pension by around ${formatCurrency(immediateLoss)} and could change the retirement balance by ${formatSignedCurrency(pensionDifference)}.`
              : "Choose a fall and its timing to see how the same long-term plan responds to a difficult market year."}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="market-downturn-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="market-downturn-outcomes-title">How the downturn changes the plan</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>
        <div className="what-if-outcome-grid">
          <OutcomeCard label="Initial illustrated loss" baseline="No fall" experiment={hasChanged ? formatCurrency(immediateLoss) : "No fall"} difference={hasChanged ? `−${formatCurrency(immediateLoss)}` : "No change"} />
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
            <li><span>Initial pension fall</span><strong className={hasChanged ? "is-negative" : undefined}>{hasChanged ? `−${formatCurrency(immediateLoss)}` : "No change"}</strong></li>
            <li><span>Retirement balance</span><strong className={toneClass(pensionDifference)}>{formatSignedCurrency(pensionDifference)}</strong></li>
            <li><span>Annual retirement income</span><strong className={toneClass(incomeDifference)}>{formatSignedCurrency(incomeDifference)}/year</strong></li>
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why timing matters</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The fall is applied once; the saved long-term return assumption continues afterwards.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Later downturns have fewer years for recovery before retirement.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>This is a deterministic stress test, not a forecast or probability estimate.</span></li>
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This stress test is temporary" : "Move the slider to begin"}</strong>
          <span>{hasChanged ? "Save it as a scenario only when the stress case is useful to compare." : "Your saved plan has not been changed."}</span>
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
