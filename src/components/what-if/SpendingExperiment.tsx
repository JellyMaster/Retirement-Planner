import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

const SPENDING_CHANGE_LIMIT = 20_000;

interface SpendingExperimentProps {
  activePlanName: string;
  baselineTargetIncome: number;
  targetIncome: number;
  incomeTargetMode: "gross" | "net";
  illustratedAnnualIncome: number;
  baselineCoverage: number;
  coverage: number;
  canSave: boolean;
  saveMessage: string | null;
  onTargetIncomeChange: (amount: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export function SpendingExperiment({
  activePlanName,
  baselineTargetIncome,
  targetIncome,
  incomeTargetMode,
  illustratedAnnualIncome,
  baselineCoverage,
  coverage,
  canSave,
  saveMessage,
  onTargetIncomeChange,
  onReset,
  onSave,
}: SpendingExperimentProps) {
  const difference = targetIncome - baselineTargetIncome;
  const annualGap = illustratedAnnualIncome - targetIncome;
  const baselineGap = illustratedAnnualIncome - baselineTargetIncome;
  const coverageDifference = coverage - baselineCoverage;
  const hasChanged = difference !== 0;

  return (
    <section className="what-if-workspace" aria-labelledby="spending-experiment-title">
      <header className="what-if-workspace-header">
        <div>
          <p className="planner-eyebrow">Current experiment</p>
          <h2 id="spending-experiment-title">Spend more in retirement</h2>
          <p>
            Test a different annual retirement-income target while keeping the
            pension projection and retirement timing unchanged.
          </p>
        </div>
        <span className="what-if-baseline-pill">Based on {activePlanName}</span>
      </header>

      <div className="what-if-control-panel">
        <div className="what-if-control-copy">
          <span>Target annual retirement income</span>
          <strong>{formatCurrency(targetIncome)}/year</strong>
          <small>
            {incomeTargetMode === "net" ? "Net income target" : "Gross income target"}
            {" · "}{formatSignedCurrency(difference)} from the saved plan
          </small>
        </div>

        <div className="what-if-slider-wrap">
          <input
            type="range"
            min={-SPENDING_CHANGE_LIMIT}
            max={SPENDING_CHANGE_LIMIT}
            step={500}
            value={difference}
            aria-label="Experimental annual retirement income change"
            aria-valuetext={`${formatSignedCurrency(difference)} from the saved target; ${formatCurrency(targetIncome)} per year`}
            onChange={(event) =>
              onTargetIncomeChange(
                Math.max(0, baselineTargetIncome + Number(event.target.value)),
              )
            }
          />
          <div className="what-if-slider-labels" aria-hidden="true">
            <span>−£20,000</span>
            <span>Saved plan · {formatCurrency(baselineTargetIncome)}</span>
            <span>+£20,000</span>
          </div>
        </div>
      </div>

      <article className={`what-if-story-card${hasChanged ? " is-changed" : ""}`}>
        <span className="what-if-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.money} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">What this could mean</p>
          <h3>{createStoryTitle(difference, annualGap)}</h3>
          <p>
            {createStoryDescription({
              difference,
              targetIncome,
              illustratedAnnualIncome,
              annualGap,
            })}
          </p>
        </div>
      </article>

      <section className="what-if-outcomes" aria-labelledby="spending-outcomes-title">
        <div className="what-if-section-heading">
          <div>
            <p className="planner-eyebrow">Live outcome</p>
            <h3 id="spending-outcomes-title">How the lifestyle target changes</h3>
          </div>
          <span>Today&apos;s money</span>
        </div>

        <div className="what-if-outcome-grid">
          <OutcomeCard
            label="Annual income target"
            baseline={`${formatCurrency(baselineTargetIncome)}/year`}
            experiment={`${formatCurrency(targetIncome)}/year`}
            difference={`${formatSignedCurrency(difference)}/year`}
          />
          <OutcomeCard
            label="Illustrated annual income"
            baseline={`${formatCurrency(illustratedAnnualIncome)}/year`}
            experiment={`${formatCurrency(illustratedAnnualIncome)}/year`}
            difference="No change"
          />
          <OutcomeCard
            label="Target coverage"
            baseline={`${baselineCoverage}%`}
            experiment={`${coverage}%`}
            difference={formatSignedPercentage(coverageDifference)}
          />
          <OutcomeCard
            label="Annual surplus or gap"
            baseline={formatGap(baselineGap)}
            experiment={formatGap(annualGap)}
            difference={`${formatSignedCurrency(annualGap - baselineGap)}/year`}
          />
        </div>
      </section>

      <div className="what-if-explanation-grid">
        <article className="what-if-impact-panel">
          <p className="planner-eyebrow">Biggest effects</p>
          <h3>What moved most</h3>
          <ol>
            <li><span>Annual income target</span><strong className={toneClass(formatSignedCurrency(difference))}>{formatSignedCurrency(difference)}/year</strong></li>
            <li><span>Target coverage</span><strong className={toneClass(formatSignedPercentage(coverageDifference))}>{formatSignedPercentage(coverageDifference)}</strong></li>
            <li><span>Annual surplus or gap</span><strong className={annualGap >= 0 ? "is-positive" : "is-negative"}>{formatGap(annualGap)}</strong></li>
          </ol>
        </article>

        <article className="what-if-why-panel">
          <p className="planner-eyebrow">Why it changes</p>
          <h3>The mechanics behind the result</h3>
          <ul>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>The pension projection stays unchanged in this experiment.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>A higher lifestyle target requires the same pension income to cover more spending.</span></li>
            <li><FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" /><span>Coverage falls when the target rises and improves when the target falls.</span></li>
          </ul>
        </article>
      </div>

      <footer className="what-if-toolbar">
        <div>
          <strong>{hasChanged ? "This experiment is temporary" : "Move the slider to begin"}</strong>
          <span>{hasChanged ? "Save it as a scenario only when the lifestyle target is worth keeping." : "Your saved plan has not been changed."}</span>
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
      <em className={`what-if-outcome-difference${toneSuffix(difference)}`}>{difference}</em>
    </article>
  );
}

function createStoryTitle(difference: number, annualGap: number): string {
  if (difference === 0) return "The saved retirement-income target is unchanged";
  if (difference > 0 && annualGap >= 0) return "The plan may support a higher retirement lifestyle";
  if (difference > 0) return "Spending more would widen the projected income gap";
  return "A lower spending target would improve the plan's coverage";
}

function createStoryDescription({ difference, targetIncome, illustratedAnnualIncome, annualGap }: { difference: number; targetIncome: number; illustratedAnnualIncome: number; annualGap: number }): string {
  if (difference === 0) return "Move the slider to test a different annual retirement-income target.";
  const direction = difference > 0 ? "higher" : "lower";
  return `A ${formatCurrency(Math.abs(difference))} ${direction} annual target would set planned retirement spending at ${formatCurrency(targetIncome)}. The current illustration provides ${formatCurrency(illustratedAnnualIncome)} a year, leaving ${annualGap >= 0 ? "a surplus of" : "a gap of"} ${formatCurrency(Math.abs(annualGap))} a year.`;
}

function formatGap(value: number): string {
  return value >= 0 ? `${formatCurrency(value)} surplus` : `${formatCurrency(Math.abs(value))} gap`;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function toneSuffix(value: string): string {
  if (value.startsWith("+")) return " is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return " is-negative";
  return "";
}

function toneClass(value: string): string | undefined {
  if (value.startsWith("+")) return "is-positive";
  if (value.startsWith("−") || value.startsWith("-")) return "is-negative";
  return undefined;
}
