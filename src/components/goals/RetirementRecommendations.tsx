import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { formatCurrency } from "../../utils/formatters";
import {
    calculateRetirementHealth,
} from "./calculateRetirementHealth";
interface RetirementRecommendationsProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: "Easy win" | "Moderate" | "Combined";
  nextInputs: PensionInputs;
  score: number;
  scoreGain: number;
  potGain: number;
  incomeGain: number;
  targetCovered: boolean;
}

function projectRecommendation(
  id: string,
  title: string,
  description: string,
  effort: Recommendation["effort"],
  nextInputs: PensionInputs,
  baseline: ReturnType<typeof calculateRetirementHealth>,
  baselineResult: ProjectionResult,
  goals: RetirementGoals,
): Recommendation {
  const projection = RetirementProjectionEngine.calculate(nextInputs);
  const health = calculateRetirementHealth(projection, goals);

  return {
    id,
    title,
    description,
    effort,
    nextInputs,
    score: health.score,
    scoreGain: health.score - baseline.score,
    potGain: projection.finalBalance.real - baselineResult.finalBalance.real,
    incomeGain: health.estimatedAnnualIncome - baseline.estimatedAnnualIncome,
    targetCovered: health.score >= 100,
  };
}

export function RetirementRecommendations({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: RetirementRecommendationsProps) {
  const baseline = useMemo(() => calculateRetirementHealth(result, goals), [result, goals]);

  const recommendations = useMemo(() => {
    const candidates: Recommendation[] = [];
    const contributionSteps = [50, 100, 200];

    for (const amount of contributionSteps) {
      candidates.push(projectRecommendation(
        `contribution-${amount}`,
        `Add ${formatCurrency(amount)} a month`,
        `Increase your employee pension contribution while keeping your planned retirement age of ${inputs.retirementAge}.`,
        amount <= 100 ? "Easy win" : "Moderate",
        { ...inputs, monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + amount },
        baseline,
        result,
        goals,
      ));
    }

    if (inputs.retirementAge < 79) {
      candidates.push(projectRecommendation(
        "delay-one-year",
        "Retire one year later",
        `Continue contributions and investment growth until age ${inputs.retirementAge + 1}.`,
        "Moderate",
        { ...inputs, retirementAge: inputs.retirementAge + 1 },
        baseline,
        result,
        goals,
      ));
    }

    if (inputs.retirementAge < 78) {
      candidates.push(projectRecommendation(
        "delay-two-years",
        "Retire two years later",
        `Extend the accumulation period to age ${inputs.retirementAge + 2}.`,
        "Moderate",
        { ...inputs, retirementAge: inputs.retirementAge + 2 },
        baseline,
        result,
        goals,
      ));
    }

    if (inputs.retirementAge < 79) {
      candidates.push(projectRecommendation(
        "combined-balanced",
        `Add ${formatCurrency(50)} a month and retire one year later`,
        "A balanced combination that spreads the improvement across saving more and allowing one extra year of growth.",
        "Combined",
        {
          ...inputs,
          retirementAge: inputs.retirementAge + 1,
          monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 50,
        },
        baseline,
        result,
        goals,
      ));
    }

    return candidates
      .filter((candidate) => candidate.scoreGain > 0 || candidate.potGain > 0)
      .sort((a, b) => {
        if (a.targetCovered !== b.targetCovered) return a.targetCovered ? -1 : 1;
        if (b.scoreGain !== a.scoreGain) return b.scoreGain - a.scoreGain;
        return b.incomeGain - a.incomeGain;
      })
      .slice(0, 4);
  }, [baseline, goals, inputs, result]);

  if (baseline.score >= 100) {
    return (
      <section className="retirement-recommendations retirement-recommendations-complete" aria-labelledby="retirement-recommendations-heading">
        <div className="retirement-recommendations-heading">
          <div>
            <p className="planner-eyebrow">Smart recommendations</p>
            <h2 id="retirement-recommendations-heading">Your target is covered</h2>
          </div>
          <span className="retirement-recommendations-complete-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.success} /></span>
        </div>
        <p>Your current illustration already meets the income target. You can still use scenario comparison to test earlier retirement, a larger reserve, or a higher income goal.</p>
      </section>
    );
  }

  return (
    <section className="retirement-recommendations" aria-labelledby="retirement-recommendations-heading">
      <div className="retirement-recommendations-heading">
        <div>
          <p className="planner-eyebrow">Smart recommendations</p>
          <h2 id="retirement-recommendations-heading">Ways to improve your plan</h2>
          <p>These illustrations are ranked by their improvement to your current retirement target.</p>
        </div>
        <div className="retirement-recommendations-baseline" aria-label={`Current readiness score ${baseline.score} out of 100`}>
          <span>Current score</span>
          <strong>{baseline.score}<small>/100</small></strong>
        </div>
      </div>

      <div className="retirement-recommendations-grid">
        {recommendations.map((recommendation, index) => (
          <article className="retirement-recommendation-card" key={recommendation.id}>
            <div className="retirement-recommendation-card-header">
              <span className={`retirement-recommendation-effort retirement-recommendation-effort-${recommendation.effort.toLowerCase().replace(" ", "-")}`}>
                {recommendation.effort}
              </span>
              {index === 0 && <span className="retirement-recommendation-best">Best impact</span>}
            </div>

            <h3>{recommendation.title}</h3>
            <p>{recommendation.description}</p>

            <dl className="retirement-recommendation-impact">
              <div>
                <dt>Readiness</dt>
                <dd>{baseline.score} → {recommendation.score}<small>+{recommendation.scoreGain} points</small></dd>
              </div>
              <div>
                <dt>Projected pot</dt>
                <dd>+{formatCurrency(Math.max(0, recommendation.potGain))}</dd>
              </div>
              <div>
                <dt>Annual income</dt>
                <dd>+{formatCurrency(Math.max(0, recommendation.incomeGain))}</dd>
              </div>
            </dl>

            {recommendation.targetCovered && (
              <p className="retirement-recommendation-target-covered"><span aria-hidden="true"><FontAwesomeIcon icon={AppIcons.check} /></span> Illustrated target covered</p>
            )}

            <button type="button" onClick={() => onApplyToComparison(recommendation.nextInputs)}>
              Apply to Comparison Plan
            </button>
          </article>
        ))}
      </div>

      <p className="retirement-recommendations-disclaimer">Recommendations use the same projection assumptions and 4% income illustration as the health dashboard. They are planning examples, not personalised financial advice.</p>
    </section>
  );
}
