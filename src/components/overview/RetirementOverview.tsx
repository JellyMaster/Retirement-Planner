import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { calculateRetirementHealth } from "../goals/calculateRetirementHealth";
import { RetirementConfidenceRing } from "./RetirementConfidenceRing";
import { RetirementKpiGrid } from "./RetirementKpiGrid";
import { RetirementOpportunities } from "./RetirementOpportunities";
import { RetirementStrengths } from "./RetirementStrengths";

interface RetirementOverviewProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

type OutlookTone = "excellent" | "good" | "fair" | "needs-attention";

function getOutlook(score: number): { label: string; tone: OutlookTone } {
  if (score >= 100) return { label: "Excellent", tone: "excellent" };
  if (score >= 90) return { label: "Good", tone: "good" };
  if (score >= 75) return { label: "Fair", tone: "fair" };
  return { label: "Needs attention", tone: "needs-attention" };
}

function getNarrative(
  annualGap: number,
  score: number,
): string {
  if (annualGap >= 0) {
    return "Your current illustration covers the retirement-income target you entered. Explore the opportunities below to test how resilient that position could be.";
  }

  if (score >= 85) {
    return "Your current illustration is close to the retirement-income target you entered. A modest change to contributions or retirement timing may close the remaining gap.";
  }

  return "Your current illustration falls below the retirement-income target you entered. The opportunities below show practical changes you can preview without altering your plan.";
}

export function RetirementOverview({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: RetirementOverviewProps) {
  const health = calculateRetirementHealth(result, goals);
  const outlook = getOutlook(health.score);
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);

  return (
    <section
      className={`retirement-overview retirement-overview-${outlook.tone}`}
      aria-labelledby="retirement-overview-heading"
    >
      <div className="retirement-overview-hero">
        <div className="retirement-overview-hero-copy">
          <p className="planner-eyebrow">Your retirement outlook</p>
          <div className="retirement-overview-title-row">
            <h2 id="retirement-overview-heading">{outlook.label}</h2>
            <span className="retirement-overview-status">Based on your current plan</span>
          </div>
          <p>{getNarrative(health.annualGap, health.score)}</p>
        </div>

        <RetirementConfidenceRing score={health.score} label={outlook.label} />
      </div>

      <RetirementKpiGrid
        projectedPot={result.finalBalance.real}
        estimatedIncome={health.estimatedAnnualIncome}
        annualGap={health.annualGap}
        retirementAge={inputs.retirementAge}
        yearsToRetirement={yearsToRetirement}
      />

      <div className="retirement-overview-support-grid">
        <RetirementStrengths inputs={inputs} goals={goals} health={health} />
        <RetirementOpportunities
          inputs={inputs}
          result={result}
          goals={goals}
          onApplyToComparison={onApplyToComparison}
        />
      </div>

      <p className="retirement-overview-disclaimer">
        The income figure uses the existing 4% illustration and the State Pension amount entered in your retirement goals. It is not a guarantee or regulated financial advice.
      </p>
    </section>
  );
}
