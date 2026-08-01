import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { AppIcons } from "../../icons";
import { Card, CardHeader, StatusBadge, type StatusBadgeTone } from "../ui";
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

interface Outlook {
  label: string;
  tone: OutlookTone;
  badgeTone: StatusBadgeTone;
}

function getOutlook(score: number): Outlook {
  if (score >= 100) {
    return { label: "Excellent", tone: "excellent", badgeTone: "success" };
  }

  if (score >= 90) {
    return { label: "Good", tone: "good", badgeTone: "success" };
  }

  if (score >= 75) {
    return { label: "Fair", tone: "fair", badgeTone: "warning" };
  }

  return {
    label: "Needs attention",
    tone: "needs-attention",
    badgeTone: "danger",
  };
}

function getNarrative(annualGap: number, score: number): string {
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
    <Card
      className={`retirement-overview retirement-overview-${outlook.tone}`}
      tone="accent"
      padding="large"
      aria-labelledby="retirement-overview-heading"
    >
      <div className="retirement-overview-hero">
        <CardHeader
          className="retirement-overview-header"
          eyebrow="Your retirement outlook"
          title={outlook.label}
          titleId="retirement-overview-heading"
          description={getNarrative(health.annualGap, health.score)}
          icon={AppIcons.health}
          badge={
            <StatusBadge
              tone={outlook.badgeTone}
              icon={health.annualGap >= 0 ? AppIcons.success : AppIcons.warning}
            >
              Based on your current plan
            </StatusBadge>
          }
        />

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
    </Card>
  );
}
