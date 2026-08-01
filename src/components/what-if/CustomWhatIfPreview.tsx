import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import type { RetirementScoreFactor } from "../../engine/models/RetirementScoreBreakdown";
import { calculateWeightedRetirementScore } from "../../engine/retirement-health/calculateWeightedRetirementScore";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { calculateRetirementHealth } from "../goals/calculateRetirementHealth";
import { Button } from "../ui";

interface CustomWhatIfPreviewProps {
  baselineInputs: PensionInputs;
  scenarioInputs: PensionInputs;
  baselineResult: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

interface FactorChange {
  factor: RetirementScoreFactor;
  difference: number;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return formatCurrency(0);
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPoints(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : "−"}${Math.abs(value)} ${Math.abs(value) === 1 ? "point" : "points"}`;
}

export function CustomWhatIfPreview({
  baselineInputs,
  scenarioInputs,
  baselineResult,
  goals,
  onApplyToComparison,
}: CustomWhatIfPreviewProps) {
  const scenarioResult = RetirementProjectionEngine.calculate(scenarioInputs);
  const baselineHealth = calculateRetirementHealth(baselineResult, goals);
  const scenarioHealth = calculateRetirementHealth(scenarioResult, goals);
  const baselineWeighted = calculateWeightedRetirementScore({
    inputs: baselineInputs,
    result: baselineResult,
    goals,
  });
  const scenarioWeighted = calculateWeightedRetirementScore({
    inputs: scenarioInputs,
    result: scenarioResult,
    goals,
  });

  const factorChanges: FactorChange[] = scenarioWeighted.factors
    .map((factor) => {
      const baselineFactor = baselineWeighted.factors.find((item) => item.id === factor.id);
      return {
        factor,
        difference: factor.score - (baselineFactor?.score ?? factor.score),
      };
    })
    .filter((item) => item.difference !== 0)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const improved = factorChanges.filter((item) => item.difference > 0);
  const worsened = factorChanges.filter((item) => item.difference < 0);
  const potDifference = scenarioResult.finalBalance.real - baselineResult.finalBalance.real;
  const incomeDifference = scenarioHealth.estimatedAnnualIncome - baselineHealth.estimatedAnnualIncome;
  const coverageDifference = scenarioHealth.score - baselineHealth.score;
  const weightedDifference = scenarioWeighted.weightedScore - baselineWeighted.weightedScore;

  return (
    <aside className="custom-what-if-preview" aria-live="polite">
      <div className="custom-what-if-preview-heading">
        <div>
          <p className="planner-eyebrow">Live preview</p>
          <h3>Your scenario compared with the current plan</h3>
        </div>
        <span className={weightedDifference >= 0 ? "positive" : "negative"}>
          {formatSignedPoints(weightedDifference)} weighted
        </span>
      </div>

      <div className="custom-what-if-preview-grid">
        <article>
          <span>Projected pot</span>
          <strong>{formatCurrency(scenarioResult.finalBalance.real)}</strong>
          <small className={potDifference >= 0 ? "positive" : "negative"}>
            {formatSignedCurrency(potDifference)}
          </small>
        </article>
        <article>
          <span>Illustrated income</span>
          <strong>{formatCurrency(scenarioHealth.estimatedAnnualIncome)}</strong>
          <small className={incomeDifference >= 0 ? "positive" : "negative"}>
            {formatSignedCurrency(incomeDifference)} a year
          </small>
        </article>
        <article>
          <span>Income coverage</span>
          <strong>{baselineHealth.score} → {scenarioHealth.score}</strong>
          <small className={coverageDifference >= 0 ? "positive" : "negative"}>
            {formatSignedPoints(coverageDifference)}
          </small>
        </article>
        <article>
          <span>Weighted score</span>
          <strong>{baselineWeighted.weightedScore} → {scenarioWeighted.weightedScore}</strong>
          <small className={weightedDifference >= 0 ? "positive" : "negative"}>
            {formatSignedPoints(weightedDifference)}
          </small>
        </article>
      </div>

      <div className="custom-what-if-drivers">
        <div>
          <h4>Improves</h4>
          {improved.length > 0 ? (
            <ul>
              {improved.slice(0, 4).map(({ factor, difference }) => (
                <li key={factor.id}>
                  <span>{factor.label}</span>
                  <strong className="positive">+{difference}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No score factors improve.</p>
          )}
        </div>
        <div>
          <h4>Trade-offs</h4>
          {worsened.length > 0 ? (
            <ul>
              {worsened.slice(0, 4).map(({ factor, difference }) => (
                <li key={factor.id}>
                  <span>{factor.label}</span>
                  <strong className="negative">{difference}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No score factors worsen.</p>
          )}
        </div>
      </div>

      <Button
        variant="compare"
        icon={AppIcons.comparison}
        fullWidth
        onClick={() => onApplyToComparison(scenarioInputs)}
      >
        Apply to comparison
      </Button>
    </aside>
  );
}
