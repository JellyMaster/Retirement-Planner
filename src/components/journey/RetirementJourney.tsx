import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { AppIcons } from "../../icons";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import {
  RetirementJourneyMilestone,
  type RetirementJourneyMilestoneData,
} from "./RetirementJourneyMilestone";

interface RetirementJourneyProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
}

function createMilestones(
  inputs: PensionInputs,
  result: ProjectionResult,
  goals: RetirementGoals,
): RetirementJourneyMilestoneData[] {
  const totalMonthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const investablePot = Math.max(0, result.finalBalance.real - goals.emergencyReserve);
  const privateIncome = investablePot * 0.04;
  const statePensionAtRetirement =
    goals.includeStatePension && goals.statePensionAge <= inputs.retirementAge
      ? goals.statePensionAnnualAmount
      : 0;

  const milestones: RetirementJourneyMilestoneData[] = [
    {
      id: "today",
      age: inputs.currentAge,
      title: "Your plan today",
      summary: `${formatCurrency(totalMonthlyContribution)} saved each month`,
      value: formatCurrency(inputs.currentPot),
      detail: `You are starting with ${formatCurrency(
        inputs.currentPot,
      )} and contributing ${formatCurrency(
        totalMonthlyContribution,
      )} each month. Your projection assumes ${formatPercentage(
        inputs.annualReturn,
      )} annual growth before a ${formatPercentage(inputs.annualFee)} annual fee.`,
      icon: AppIcons.user,
      tone: "current",
      order: 0,
    },
  ];

  if (
    inputs.extraMonthlyContribution &&
    inputs.extraMonthlyContribution > 0 &&
    inputs.extraContributionAge !== undefined &&
    inputs.extraContributionAge > inputs.currentAge &&
    inputs.extraContributionAge < inputs.retirementAge
  ) {
    milestones.push({
      id: "extra-contributions",
      age: inputs.extraContributionAge,
      title: "Contribution boost",
      summary: `An extra ${formatCurrency(inputs.extraMonthlyContribution)} each month`,
      value: `+${formatCurrency(inputs.extraMonthlyContribution)}/month`,
      detail: `From age ${inputs.extraContributionAge}, your plan adds ${formatCurrency(
        inputs.extraMonthlyContribution,
      )} per month on top of your regular contributions. This extra saving is included in the projected retirement value.`,
      icon: AppIcons.plus,
      tone: "contribution",
      order: 1,
    });
  }

  milestones.push({
    id: "retirement",
    age: inputs.retirementAge,
    title: "Planned retirement",
    summary: `${formatCurrency(result.finalBalance.real)} projected pot`,
    value: formatCurrency(result.finalBalance.real),
    detail: `At age ${inputs.retirementAge}, your pension is projected to be worth ${formatCurrency(
      result.finalBalance.real,
    )} in today's money. After retaining your ${formatCurrency(
      goals.emergencyReserve,
    )} reserve, a 4% private-pension illustration is ${formatCurrency(
      privateIncome,
    )} a year${
      statePensionAtRetirement > 0
        ? `, rising to ${formatCurrency(
            privateIncome + statePensionAtRetirement,
          )} when the State Pension amount entered is included`
        : ""
    }.`,
    icon: AppIcons.retirement,
    tone: "retirement",
    order: 2,
  });

  if (
    goals.includeStatePension &&
    goals.statePensionAge >= inputs.currentAge
  ) {
    milestones.push({
      id: "state-pension",
      age: goals.statePensionAge,
      title: "State Pension starts",
      summary: `${formatCurrency(goals.statePensionAnnualAmount)} a year`,
      value: formatCurrency(goals.statePensionAnnualAmount),
      detail: `Your plan includes ${formatCurrency(
        goals.statePensionAnnualAmount,
      )} of State Pension income from age ${goals.statePensionAge}. This is the amount entered in your retirement goals and is added to the private-pension income illustration.`,
      icon: AppIcons.pension,
      tone: "state-pension",
      order: 3,
    });
  }

  return milestones.sort((left, right) => {
    if (left.age !== right.age) return left.age - right.age;
    return left.order - right.order;
  });
}

export function RetirementJourney({
  inputs,
  result,
  goals,
}: RetirementJourneyProps) {
  const milestones = useMemo(
    () => createMilestones(inputs, result, goals),
    [goals, inputs, result],
  );

  const defaultMilestoneId =
    milestones.find((milestone) => milestone.id === "retirement")?.id ??
    milestones[0]?.id ??
    "";
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(defaultMilestoneId);

  const selectedMilestone =
    milestones.find((milestone) => milestone.id === selectedMilestoneId) ??
    milestones.find((milestone) => milestone.id === defaultMilestoneId) ??
    milestones[0];

  if (!selectedMilestone) return null;

  return (
    <section
      className="retirement-journey"
      aria-labelledby="retirement-journey-heading"
    >
      <div className="retirement-journey-heading">
        <div>
          <p className="planner-eyebrow">Your retirement journey</p>
          <h2 id="retirement-journey-heading">The key moments in your plan</h2>
          <p>
            Follow your plan from today to retirement and see when the assumptions
            that shape your income take effect.
          </p>
        </div>

        <span className="retirement-journey-duration">
          <FontAwesomeIcon icon={AppIcons.clock} aria-hidden="true" />
          {Math.max(0, inputs.retirementAge - inputs.currentAge)} years to retirement
        </span>
      </div>

      <ol className="retirement-journey-track">
        {milestones.map((milestone) => (
          <RetirementJourneyMilestone
            key={milestone.id}
            milestone={milestone}
            isActive={selectedMilestone.id === milestone.id}
            onSelect={setSelectedMilestoneId}
          />
        ))}
      </ol>

      <div
        id="retirement-journey-detail"
        className={`retirement-journey-detail retirement-journey-detail-${selectedMilestone.tone}`}
        aria-live="polite"
      >
        <span className="retirement-journey-detail-icon" aria-hidden="true">
          <FontAwesomeIcon icon={selectedMilestone.icon} />
        </span>

        <div>
          <small>Age {selectedMilestone.age}</small>
          <h3>{selectedMilestone.title}</h3>
          <p>{selectedMilestone.detail}</p>
        </div>

        <strong>{selectedMilestone.value}</strong>
      </div>

      <p className="retirement-journey-disclaimer">
        Values are shown in today's money. The journey reflects the assumptions in
        your current plan and is an illustration rather than a guarantee.
      </p>
    </section>
  );
}
