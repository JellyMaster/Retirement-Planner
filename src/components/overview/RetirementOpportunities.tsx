import { useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { calculateRetirementHealth } from "../goals/calculateRetirementHealth";

interface RetirementOpportunitiesProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

interface OpportunityDefinition {
  id: string;
  title: string;
  description: string;
  icon: IconDefinition;
  buildInputs: (inputs: PensionInputs) => PensionInputs;
  available?: (inputs: PensionInputs) => boolean;
}

interface OpportunityResult extends OpportunityDefinition {
  nextInputs: PensionInputs;
  potGain: number;
  incomeGain: number;
  scoreGain: number;
}

const opportunityDefinitions: OpportunityDefinition[] = [
  {
    id: "save-more",
    title: "Save £100 more each month",
    description: "Increase your own pension contribution while keeping the same retirement age.",
    icon: AppIcons.plus,
    buildInputs: (inputs) => ({
      ...inputs,
      monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 100,
    }),
  },
  {
    id: "retire-later",
    title: "Retire one year later",
    description: "Allow one more year for contributions and potential investment growth.",
    icon: AppIcons.clock,
    buildInputs: (inputs) => ({
      ...inputs,
      retirementAge: Math.min(100, inputs.retirementAge + 1),
    }),
    available: (inputs) => inputs.retirementAge < 100,
  },
  {
    id: "lower-fee",
    title: "Reduce fees by 0.25%",
    description: "Preview the long-term effect of moving to a lower-cost pension arrangement.",
    icon: AppIcons.fees,
    buildInputs: (inputs) => ({
      ...inputs,
      annualFee: Math.max(0, Number((inputs.annualFee - 0.0025).toFixed(10))),
    }),
    available: (inputs) => inputs.annualFee >= 0.0025,
  },
];

export function RetirementOpportunities({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: RetirementOpportunitiesProps) {
  const opportunities = useMemo<OpportunityResult[]>(() => {
    const baselineHealth = calculateRetirementHealth(result, goals);

    return opportunityDefinitions
      .filter((opportunity) => opportunity.available?.(inputs) ?? true)
      .map((opportunity) => {
        const nextInputs = opportunity.buildInputs(inputs);
        const nextProjection = RetirementProjectionEngine.calculate(nextInputs);
        const nextHealth = calculateRetirementHealth(nextProjection, goals);

        return {
          ...opportunity,
          nextInputs,
          potGain: nextProjection.finalBalance.real - result.finalBalance.real,
          incomeGain: nextHealth.estimatedAnnualIncome - baselineHealth.estimatedAnnualIncome,
          scoreGain: nextHealth.score - baselineHealth.score,
        };
      })
      .filter((opportunity) => opportunity.potGain > 0 || opportunity.incomeGain > 0)
      .sort((a, b) => b.incomeGain - a.incomeGain)
      .slice(0, 2);
  }, [goals, inputs, result]);

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <section className="retirement-overview-support-card" aria-labelledby="retirement-opportunities-heading">
      <div className="retirement-overview-section-heading">
        <span aria-hidden="true"><FontAwesomeIcon icon={AppIcons.recommendations} /></span>
        <div>
          <p className="planner-eyebrow">Biggest opportunities</p>
          <h3 id="retirement-opportunities-heading">Changes worth exploring</h3>
        </div>
      </div>

      <div className="retirement-overview-opportunity-list">
        {opportunities.map((opportunity) => (
          <article key={opportunity.id}>
            <span className="retirement-overview-opportunity-icon" aria-hidden="true">
              <FontAwesomeIcon icon={opportunity.icon} />
            </span>
            <div className="retirement-overview-opportunity-copy">
              <h4>{opportunity.title}</h4>
              <p>{opportunity.description}</p>
              <div className="retirement-overview-opportunity-impact">
                <strong>+{formatCurrency(Math.max(0, opportunity.potGain))}</strong>
                <span>projected pot</span>
                {opportunity.incomeGain > 0 && (
                  <small>+{formatCurrency(opportunity.incomeGain)} illustrated annual income</small>
                )}
                {opportunity.scoreGain > 0 && (
                  <small>+{opportunity.scoreGain} readiness {opportunity.scoreGain === 1 ? "point" : "points"}</small>
                )}
              </div>
            </div>
            <button type="button" onClick={() => onApplyToComparison(opportunity.nextInputs)}>
              Preview
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
