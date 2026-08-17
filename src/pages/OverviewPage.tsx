import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import {
  calculateRetirementHealth,
  type RetirementHealthMetrics,
} from "../components/goals/calculateRetirementHealth";
import { OverviewGrowthChart } from "../components/overview/OverviewGrowthChart";
import { useScenarios } from "../components/scenarios";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

export function OverviewPage() {
  const { activeScenario } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const inputs = activeScenario.inputs;
  const scenario = usePensionProjection(inputs);
  const hasProjection = !scenario.hasErrors && scenario.projection.years.length > 0;
  const preparedness = hasProjection
    ? calculateRetirementHealth(scenario.projection, retirementGoals)
    : null;
  const planningAge = activeScenario.drawdown?.planningAge ?? 95;
  const nextStep = createNextStep({
    hasProjection,
    preparedness,
    includeStatePension: retirementGoals.includeStatePension,
  });

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview · {activeScenario.name}</p>
          <h1>Your retirement</h1>
          <p>
            See where the active plan could take you, then focus on the next decision
            that matters.
          </p>
        </div>
        <Link className="ui-button ui-button-secondary ui-button-medium" to="/plan">
          <FontAwesomeIcon icon={AppIcons.navigation.plan} aria-hidden="true" />
          Edit My Plan
        </Link>
      </header>

      <section
        className={`polaris-overview-story is-${preparedness?.status ?? "incomplete"}`}
        aria-labelledby="overview-story-title"
      >
        <div className="polaris-overview-story-copy">
          <p className="planner-eyebrow">Your outlook</p>
          <h2 id="overview-story-title">
            {preparedness ? formatPreparednessStatus(preparedness.status) : "Complete your plan"}
          </h2>
          <p>{createOutlookDescription(preparedness)}</p>
          {preparedness && (
            <p className="polaris-overview-story-income">
              <span>Illustrated annual income</span>
              <strong>{formatCurrency(preparedness.estimatedAnnualIncome)}</strong>
              <small>
                {preparedness.annualGap >= 0 ? "above" : "below"} your target by{" "}
                {formatCurrency(Math.abs(preparedness.annualGap))} a year
              </small>
            </p>
          )}
        </div>

        {preparedness ? (
          <div
            className="polaris-overview-story-score"
            style={{ "--overview-score": preparedness.score } as CSSProperties}
          >
            <div
              className="polaris-overview-score-ring"
              role="progressbar"
              aria-label="Retirement target coverage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={preparedness.score}
            >
              <span>
                <strong>{preparedness.score}%</strong>
                <small>coverage</small>
              </span>
            </div>
          </div>
        ) : (
          <span className="polaris-overview-story-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.status.information} />
          </span>
        )}
      </section>

      <section className="polaris-overview-key-facts" aria-label="Key retirement facts">
        <OverviewFact
          label="Retirement age"
          value={`Age ${inputs.retirementAge}`}
          detail={`${Math.max(0, inputs.retirementAge - inputs.currentAge)} years from the current plan age`}
        />
        <OverviewFact
          label="Plan to"
          value={`Age ${planningAge}`}
          detail="Retirement income planning horizon"
        />
        <OverviewFact
          label="Projected pension"
          value={
            hasProjection
              ? formatCurrency(scenario.projection.finalBalance.real)
              : "Unavailable"
          }
          detail="At retirement in today’s money"
          incomplete={!hasProjection}
        />
        <OverviewFact
          label="Retirement income"
          value={
            preparedness
              ? `${formatCurrency(preparedness.estimatedAnnualIncome)}/year`
              : "Unavailable"
          }
          detail={
            preparedness
              ? `Target ${formatCurrency(retirementGoals.desiredAnnualIncome)}/year`
              : "Complete the plan to estimate income"
          }
          incomplete={!preparedness}
        />
      </section>

      <section className="polaris-overview-main-story" aria-label="Retirement journey">
        <article className="polaris-overview-chart-panel">
          <div className="polaris-overview-panel-heading">
            <div>
              <p className="planner-eyebrow">Your journey</p>
              <h2>How your pension could grow</h2>
              <p>
                From age {inputs.currentAge} to retirement at age {inputs.retirementAge}.
              </p>
            </div>
            <span>Today&apos;s money</span>
          </div>
          <OverviewGrowthChart years={scenario.projection.years} />
        </article>

        <article className="polaris-overview-meaning-panel">
          <div>
            <p className="planner-eyebrow">Plan at a glance</p>
            <h2>The choices behind this outlook</h2>
          </div>
          <div className="polaris-overview-meaning-list">
            <StoryPoint
              icon={AppIcons.concepts.pension}
              title="Current pension"
              description={
                inputs.currentPot > 0 ? formatCurrency(inputs.currentPot) : "Not added yet"
              }
              incomplete={inputs.currentPot <= 0}
            />
            <StoryPoint
              icon={AppIcons.concepts.income}
              title="Monthly saving"
              description={formatCurrency(
                inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution,
              )}
              incomplete={
                inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution <= 0
              }
            />
            <StoryPoint
              icon={AppIcons.concepts.retirement}
              title="State Pension"
              description={
                retirementGoals.includeStatePension
                  ? `${formatCurrency(retirementGoals.statePensionAnnualAmount)}/year from age ${retirementGoals.statePensionAge}`
                  : "Not included"
              }
              incomplete={!retirementGoals.includeStatePension}
            />
          </div>
          <Link className="ui-button ui-button-secondary ui-button-medium" to="/plan">
            Review plan details
          </Link>
        </article>
      </section>

      <section className={`polaris-overview-next-action is-${nextStep.tone}`}>
        <div>
          <p className="planner-eyebrow">Worth reviewing</p>
          <h2>{nextStep.title}</h2>
          <p>{nextStep.description}</p>
        </div>
        <Link className="ui-button ui-button-primary ui-button-medium" to={nextStep.to}>
          {nextStep.actionLabel}
        </Link>
      </section>

      <small className="polaris-overview-disclaimer">
        Figures are deterministic planning illustrations based on the active plan. They
        are not a guarantee or financial advice.
      </small>
    </main>
  );
}

function OverviewFact({
  label,
  value,
  detail,
  incomplete = false,
}: {
  label: string;
  value: string;
  detail: string;
  incomplete?: boolean;
}) {
  return (
    <article className={`polaris-overview-fact${incomplete ? " is-incomplete" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function StoryPoint({
  icon,
  title,
  description,
  incomplete = false,
}: {
  icon: (typeof AppIcons.concepts)[keyof typeof AppIcons.concepts];
  title: string;
  description: string;
  incomplete?: boolean;
}) {
  return (
    <div className={`polaris-overview-story-point${incomplete ? " is-incomplete" : ""}`}>
      <span aria-hidden="true">
        <FontAwesomeIcon icon={icon} fixedWidth />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function createOutlookDescription(preparedness: RetirementHealthMetrics | null): string {
  if (!preparedness) {
    return "Add the missing plan details to restore your retirement projection.";
  }
  if (preparedness.status === "on-track") {
    return "The current illustration meets or exceeds the retirement income target you have saved.";
  }
  if (preparedness.status === "close") {
    return "The current illustration is close to the retirement income target you have saved.";
  }
  return "The current illustration is below the retirement income target you have saved.";
}

function formatPreparednessStatus(status: RetirementHealthMetrics["status"]): string {
  if (status === "on-track") return "On track";
  if (status === "close") return "Close to target";
  return "Needs attention";
}

function createNextStep({
  hasProjection,
  preparedness,
  includeStatePension,
}: {
  hasProjection: boolean;
  preparedness: RetirementHealthMetrics | null;
  includeStatePension: boolean;
}): {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
  tone: "attention" | "opportunity" | "positive";
} {
  if (!hasProjection || !preparedness) {
    return {
      title: "Complete the active plan",
      description:
        "Some required information is missing, so the retirement outlook cannot yet be calculated.",
      actionLabel: "Complete My Plan",
      to: "/plan",
      tone: "attention",
    };
  }

  if (!includeStatePension) {
    return {
      title: "State Pension is not included",
      description:
        "Adding it can give a more complete picture of how much income may need to come from your private pension.",
      actionLabel: "Review State Pension",
      to: "/plan?step=income&section=state-pension",
      tone: "attention",
    };
  }

  if (preparedness.status === "behind") {
    return {
      title: "Explore how the income gap could change",
      description: `The illustration is currently ${formatCurrency(
        Math.abs(preparedness.annualGap),
      )} a year below your saved target. Test one change without altering the plan.`,
      actionLabel: "Explore a What If?",
      to: "/what-if?experiment=retirement-age",
      tone: "attention",
    };
  }

  if (preparedness.status === "close") {
    return {
      title: "Test a small change before making a decision",
      description:
        "The current illustration is close to your target. What If? can show which changes make the most meaningful difference.",
      actionLabel: "Explore a What If?",
      to: "/what-if",
      tone: "opportunity",
    };
  }

  return {
    title: "Stress-test an on-track plan",
    description:
      "The current illustration reaches your saved income target. Test retirement timing, saving or market assumptions without changing the plan.",
    actionLabel: "Explore a What If?",
    to: "/what-if",
    tone: "positive",
  };
}
