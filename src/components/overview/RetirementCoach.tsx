import { useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import type { RetirementScoreFactor } from "../../engine/models/RetirementScoreBreakdown";
import { calculateWeightedRetirementScore } from "../../engine/retirement-health/calculateWeightedRetirementScore";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { calculateRetirementHealth } from "../goals/calculateRetirementHealth";
import { Button, Card, CardHeader, DashboardGrid, StatusBadge } from "../ui";

interface RetirementCoachProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

interface CoachActionDefinition {
  id: string;
  title: string;
  description: string;
  icon: IconDefinition;
  effort: "Easy win" | "Moderate" | "Strategic";
  buildInputs: (inputs: PensionInputs) => PensionInputs;
  available?: (inputs: PensionInputs) => boolean;
}

interface FactorChange {
  id: string;
  label: string;
  difference: number;
  before: number;
  after: number;
}

interface CoachActionResult extends CoachActionDefinition {
  nextInputs: PensionInputs;
  potDifference: number;
  incomeDifference: number;
  incomeCoverageDifference: number;
  weightedScoreDifference: number;
  resultingWeightedScore: number;
  improvedFactors: FactorChange[];
  worsenedFactors: FactorChange[];
  impactScore: number;
}

const actionDefinitions: CoachActionDefinition[] = [
  {
    id: "save-100",
    title: "Save £100 more each month",
    description: "Increase your employee pension contribution while keeping the rest of your plan unchanged.",
    icon: AppIcons.plus,
    effort: "Easy win",
    buildInputs: (inputs) => ({
      ...inputs,
      monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 100,
    }),
  },
  {
    id: "retire-later",
    title: "Retire one year later",
    description: "Add another year of contributions and potential investment growth before drawing retirement income.",
    icon: AppIcons.clock,
    effort: "Moderate",
    buildInputs: (inputs) => ({
      ...inputs,
      retirementAge: Math.min(100, inputs.retirementAge + 1),
    }),
    available: (inputs) => inputs.retirementAge < 100,
  },
  {
    id: "reduce-fees",
    title: "Reduce annual fees by 0.25%",
    description: "Illustrate the benefit of moving to a lower-cost pension or investment arrangement.",
    icon: AppIcons.fees,
    effort: "Strategic",
    buildInputs: (inputs) => ({
      ...inputs,
      annualFee: Math.max(0, Number((inputs.annualFee - 0.0025).toFixed(10))),
    }),
    available: (inputs) => inputs.annualFee >= 0.0025,
  },
  {
    id: "combined",
    title: "Save £50 more and retire one year later",
    description: "Combine a smaller contribution increase with one additional year of saving and compounding.",
    icon: AppIcons.growth,
    effort: "Strategic",
    buildInputs: (inputs) => ({
      ...inputs,
      retirementAge: Math.min(100, inputs.retirementAge + 1),
      monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 50,
    }),
    available: (inputs) => inputs.retirementAge < 100,
  },
];

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return formatCurrency(0);
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPoints(value: number): string {
  if (Math.abs(value) < 0.01) return "No change";
  const rounded = Number(value.toFixed(1));
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded)} ${Math.abs(rounded) === 1 ? "point" : "points"}`;
}

function getFactorChanges(
  baselineFactors: RetirementScoreFactor[],
  nextFactors: RetirementScoreFactor[],
): { improved: FactorChange[]; worsened: FactorChange[] } {
  const baselineById = new Map(baselineFactors.map((factor) => [factor.id, factor]));

  const changes = nextFactors
    .map((factor) => {
      const baseline = baselineById.get(factor.id);
      const before = baseline?.score ?? factor.score;

      return {
        id: factor.id,
        label: factor.label,
        before,
        after: factor.score,
        difference: Number((factor.score - before).toFixed(1)),
      };
    })
    .filter((change) => Math.abs(change.difference) >= 0.1);

  return {
    improved: changes
      .filter((change) => change.difference > 0)
      .sort((a, b) => b.difference - a.difference),
    worsened: changes
      .filter((change) => change.difference < 0)
      .sort((a, b) => a.difference - b.difference),
  };
}

function ImpactStars({ score }: { score: number }) {
  return (
    <span className="retirement-coach-stars" aria-label={`${score} out of 5 impact`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < score ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function RetirementCoach({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: RetirementCoachProps) {
  const baselineHealth = useMemo(
    () => calculateRetirementHealth(result, goals),
    [result, goals],
  );

  const baselineWeighted = useMemo(
    () => calculateWeightedRetirementScore({ inputs, result, goals }),
    [goals, inputs, result],
  );

  const actions = useMemo<CoachActionResult[]>(() => {
    const calculated = actionDefinitions
      .filter((action) => action.available?.(inputs) ?? true)
      .map((action) => {
        const nextInputs = action.buildInputs(inputs);
        const projection = RetirementProjectionEngine.calculate(nextInputs);
        const health = calculateRetirementHealth(projection, goals);
        const weighted = calculateWeightedRetirementScore({
          inputs: nextInputs,
          result: projection,
          goals,
        });
        const factorChanges = getFactorChanges(
          baselineWeighted.factors,
          weighted.factors,
        );

        return {
          ...action,
          nextInputs,
          potDifference: projection.finalBalance.real - result.finalBalance.real,
          incomeDifference:
            health.estimatedAnnualIncome - baselineHealth.estimatedAnnualIncome,
          incomeCoverageDifference: health.score - baselineHealth.score,
          weightedScoreDifference:
            weighted.weightedScore - baselineWeighted.weightedScore,
          resultingWeightedScore: weighted.weightedScore,
          improvedFactors: factorChanges.improved,
          worsenedFactors: factorChanges.worsened,
          impactScore: 1,
        };
      })
      .filter(
        (action) =>
          action.potDifference > 0 ||
          action.incomeDifference > 0 ||
          action.weightedScoreDifference > 0,
      )
      .sort((a, b) => {
        if (b.weightedScoreDifference !== a.weightedScoreDifference) {
          return b.weightedScoreDifference - a.weightedScoreDifference;
        }
        if (b.incomeCoverageDifference !== a.incomeCoverageDifference) {
          return b.incomeCoverageDifference - a.incomeCoverageDifference;
        }
        return b.potDifference - a.potDifference;
      });

    const largestWeightedGain = Math.max(
      1,
      ...calculated.map((action) => action.weightedScoreDifference),
    );
    const largestPotGain = Math.max(
      1,
      ...calculated.map((action) => action.potDifference),
    );

    return calculated.slice(0, 4).map((action) => {
      const weightedImpact = Math.max(0, action.weightedScoreDifference) / largestWeightedGain;
      const potImpact = Math.max(0, action.potDifference) / largestPotGain;
      const combinedImpact = weightedImpact * 0.7 + potImpact * 0.3;

      return {
        ...action,
        impactScore: Math.max(1, Math.min(5, Math.ceil(combinedImpact * 5))),
      };
    });
  }, [baselineHealth, baselineWeighted, goals, inputs, result]);

  if (actions.length === 0) {
    return (
      <Card className="retirement-coach retirement-coach-complete" tone="success" aria-labelledby="retirement-coach-heading">
        <CardHeader
          eyebrow="Retirement coach"
          title="Your plan is already in a strong position"
          titleId="retirement-coach-heading"
          icon={AppIcons.success}
          description="The standard improvements tested by the coach do not materially strengthen the current illustration. Use What-if Analysis to stress-test less favourable assumptions or explore your own priorities."
          badge={<StatusBadge tone="success">Strong position</StatusBadge>}
        />
      </Card>
    );
  }

  const topAction = actions[0];

  return (
    <Card className="retirement-coach" aria-labelledby="retirement-coach-heading">
      <CardHeader
        eyebrow="Retirement coach"
        title="Recommended actions"
        titleId="retirement-coach-heading"
        icon={AppIcons.recommendations}
        description="These actions are ranked by their effect on your weighted planning score, illustrated income and projected pension value. Your current plan is not changed unless you apply an action to comparison."
        badge={<StatusBadge tone="accent">{actions.length} actions</StatusBadge>}
      />

      <div className="retirement-coach-featured">
        <div>
          <span className="retirement-coach-featured-label">Highest-ranked opportunity</span>
          <h3>{topAction.title}</h3>
          <p>{topAction.description}</p>
        </div>
        <div className="retirement-coach-featured-impact">
          <ImpactStars score={topAction.impactScore} />
          <strong>{formatSignedCurrency(topAction.potDifference)}</strong>
          <span>projected pension impact</span>
        </div>
      </div>

      <DashboardGrid columns={2} className="retirement-coach-grid">
        {actions.map((action, index) => {
          const biggestDriver = action.improvedFactors[0];

          return (
            <Card
              as="article"
              className={`retirement-coach-card${index === 0 ? " retirement-coach-card-featured" : ""}`}
              tone={index === 0 ? "accent" : "subtle"}
              interactive
              key={action.id}
            >
              <div className="retirement-coach-card-heading">
                <span className="retirement-coach-card-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={action.icon} />
                </span>
                <div>
                  <div className="retirement-coach-card-meta">
                    <StatusBadge tone={index === 0 ? "accent" : "neutral"} size="small">
                      {index === 0 ? "Top action" : `Rank ${index + 1}`}
                    </StatusBadge>
                    <StatusBadge tone="info" size="small">{action.effort}</StatusBadge>
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </div>

              <ImpactStars score={action.impactScore} />

              <dl className="retirement-coach-impact-grid">
                <div>
                  <dt>Projected pot</dt>
                  <dd className="positive">{formatSignedCurrency(action.potDifference)}</dd>
                </div>
                <div>
                  <dt>Annual income</dt>
                  <dd className="positive">{formatSignedCurrency(action.incomeDifference)}</dd>
                </div>
                <div>
                  <dt>Income coverage</dt>
                  <dd>{formatSignedPoints(action.incomeCoverageDifference)}</dd>
                </div>
                <div>
                  <dt>Weighted score</dt>
                  <dd className={action.weightedScoreDifference >= 0 ? "positive" : "negative"}>
                    {baselineWeighted.weightedScore} → {action.resultingWeightedScore}
                    <small>{formatSignedPoints(action.weightedScoreDifference)}</small>
                  </dd>
                </div>
              </dl>

              {biggestDriver && (
                <div className="retirement-coach-driver">
                  <span>Biggest positive driver</span>
                  <strong>{biggestDriver.label}</strong>
                  <small>+{biggestDriver.difference} factor points</small>
                </div>
              )}

              <details className="retirement-coach-details">
                <summary>Why this helps</summary>
                <div className="retirement-coach-factor-lists">
                  <div>
                    <h4>Factors improved</h4>
                    {action.improvedFactors.length > 0 ? (
                      <ul>
                        {action.improvedFactors.map((factor) => (
                          <li key={factor.id}>
                            <span>{factor.label}</span>
                            <strong>+{factor.difference}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No weighted factors change materially.</p>
                    )}
                  </div>

                  <div>
                    <h4>Trade-offs</h4>
                    {action.worsenedFactors.length > 0 ? (
                      <ul>
                        {action.worsenedFactors.map((factor) => (
                          <li key={factor.id}>
                            <span>{factor.label}</span>
                            <strong className="negative">{factor.difference}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No weighted factors worsen in this illustration.</p>
                    )}
                  </div>
                </div>
              </details>

              <Button
                variant="compare"
                fullWidth
                onClick={() => onApplyToComparison(action.nextInputs)}
              >
                Apply to comparison
              </Button>
            </Card>
          );
        })}
      </DashboardGrid>

      <p className="retirement-coach-disclaimer">
        Rankings use the application&apos;s illustrative weighted score and current
        assumptions. They are not personalised financial advice, a probability of
        success or a recommendation to buy or change a financial product.
      </p>
    </Card>
  );
}
