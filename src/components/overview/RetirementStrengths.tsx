import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import type { RetirementHealthMetrics } from "../goals/calculateRetirementHealth";
import { Card, CardHeader, StatusBadge } from "../ui";

interface RetirementStrengthsProps {
  inputs: PensionInputs;
  goals: RetirementGoals;
  health: RetirementHealthMetrics;
}

export function RetirementStrengths({
  inputs,
  goals,
  health,
}: RetirementStrengthsProps) {
  const monthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;

  const strengths: string[] = [];

  if (monthlyContribution > 0) {
    strengths.push(
      `You are adding ${formatCurrency(monthlyContribution)} to your pension each month.`,
    );
  }

  if (inputs.annualFee <= 0.0075) {
    strengths.push(
      "Your annual pension fee is within a relatively low range for long-term planning.",
    );
  }

  if (health.annualGap >= 0) {
    strengths.push(
      "Your illustrated annual retirement income currently covers the target you entered.",
    );
  } else if (health.coverage >= 0.85) {
    strengths.push(
      "Your illustrated retirement income is already close to the target you entered.",
    );
  }

  if (inputs.retirementAge - inputs.currentAge >= 10) {
    strengths.push(
      "Your plan still has time for contributions and investment growth to compound.",
    );
  }

  if (goals.includeStatePension) {
    strengths.push(
      "Your retirement-income illustration includes the State Pension amount you entered.",
    );
  }

  const visibleStrengths = strengths.slice(0, 4);

  return (
    <Card
      className="retirement-overview-support-card"
      tone="subtle"
      padding="small"
      aria-labelledby="retirement-strengths-heading"
    >
      <CardHeader
        eyebrow="What is helping"
        title="Strengths in your current plan"
        titleId="retirement-strengths-heading"
        headingLevel={3}
        icon={AppIcons.success}
        badge={
          <StatusBadge tone="success" size="small">
            {visibleStrengths.length} strengths
          </StatusBadge>
        }
      />

      <ul className="retirement-overview-strength-list">
        {visibleStrengths.map((strength) => (
          <li key={strength}>
            <FontAwesomeIcon icon={AppIcons.check} aria-hidden="true" />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
