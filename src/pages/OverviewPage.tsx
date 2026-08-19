import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { OverviewGrowthChart } from "../components/overview/OverviewGrowthChart";
import { useScenarios } from "../components/scenarios";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import type { DrawdownResult } from "../engine/drawdown/models/DrawdownResult";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

const drawdownEngine = new DrawdownEngine();

type FundingStatusTone = "success" | "attention" | "urgent" | "incomplete";
type JourneyBadgeTone = "enabled" | "disabled" | "neutral" | "changed";

export function OverviewPage() {
  const { activeScenario } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const inputs = activeScenario.inputs;
  const scenario = usePensionProjection(inputs);
  const hasProjection = !scenario.hasErrors && scenario.projection.years.length > 0;
  const drawdownInputs = createDrawdownInputsFromPlan({
    pensionInputs: inputs,
    projection: scenario.projection,
    retirementGoals,
    drawdown: activeScenario.drawdown,
  });
  const drawdownValidation = validateDrawdownInputs(drawdownInputs);
  const hasUsableProjection =
    hasProjection &&
    scenario.projection.finalBalance.real > 0 &&
    drawdownValidation.isValid;
  const drawdownResult = hasUsableProjection
    ? drawdownEngine.calculate(drawdownInputs)
    : null;
  const retirementSummary = createRetirementSummary(drawdownResult, drawdownInputs.endAge);
  const nextStep = createNextStep({
    hasProjection: hasUsableProjection,
    drawdownResult,
    includeStatePension: drawdownInputs.annualStatePension > 0,
  });
  const hasTieredSpending = Boolean(activeScenario.drawdown?.spendingPhases?.length);
  const taxFreeCashChoice = createTaxFreeCashChoice(
    activeScenario.drawdown?.taxFreeCashMode,
    drawdownResult?.taxFreeCashTaken ?? 0,
  );
  const spendingPlanValue = `${hasTieredSpending ? "Tiered" : "Standard"} · ${
    drawdownInputs.withdrawalStrategy === "percentage"
      ? "Percentage based"
      : "£ target based"
  }`;

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview · {activeScenario.name}</p>
          <h1>Your retirement</h1>
          <p>
            See where the active plan could take you and whether the retirement strategy
            is currently funded through the full planning horizon.
          </p>
        </div>
        <Link className="ui-button ui-button-secondary ui-button-medium" to="/plan">
          <FontAwesomeIcon icon={AppIcons.navigation.plan} aria-hidden="true" />
          Edit My Plan
        </Link>
      </header>

      <section
        className={`polaris-overview-story is-${retirementSummary.tone}`}
        aria-labelledby="overview-story-title"
      >
        <div className="polaris-overview-story-copy">
          <p className="planner-eyebrow">Plan funding status</p>
          <h2 id="overview-story-title">{retirementSummary.title}</h2>
          <p>{retirementSummary.description}</p>
          {drawdownResult && (
            <p className="polaris-overview-story-income">
              <span>Average modelled retirement income</span>
              <strong>{formatCurrency(retirementSummary.averageIncome)}</strong>
              <small>
                {formatCurrency(retirementSummary.lowestIncome)} to{" "}
                {formatCurrency(retirementSummary.highestIncome)} a year across the plan
              </small>
            </p>
          )}
        </div>

        <span className="polaris-overview-story-icon" aria-hidden="true">
          <FontAwesomeIcon icon={fundingStatusIcon(retirementSummary.tone)} />
        </span>
      </section>

      <section className="polaris-overview-key-facts" aria-label="Key retirement facts">
        <OverviewFact
          label="Retirement age"
          value={`Age ${inputs.retirementAge}`}
          detail={`${Math.max(0, inputs.retirementAge - inputs.currentAge)} years from the current plan age`}
        />
        <OverviewFact
          label="Plan to"
          value={`Age ${drawdownInputs.endAge}`}
          detail="Retirement income planning horizon"
        />
        <OverviewFact
          label="Projected pension"
          value={
            hasUsableProjection
              ? formatCurrency(scenario.projection.finalBalance.real)
              : "Unavailable"
          }
          detail={
            hasUsableProjection
              ? "At retirement in today’s money"
              : "Complete the plan to project a retirement pension"
          }
          incomplete={!hasUsableProjection}
        />
        <OverviewFact
          label="Retirement income"
          value={
            drawdownResult
              ? `${formatCurrency(retirementSummary.averageIncome)}/year`
              : "Unavailable"
          }
          detail={drawdownResult ? "Average across retirement" : "Complete the plan to estimate income"}
          incomplete={!drawdownResult}
        />
      </section>

      <section className="polaris-overview-main-story" aria-label="Retirement journey">
        <article className="polaris-overview-chart-panel">
          <div className="polaris-overview-panel-heading">
            <div>
              <p className="planner-eyebrow">Your journey</p>
              <h2>Your pension through retirement</h2>
              <p>
                From age {inputs.currentAge} through to the plan at age {drawdownInputs.endAge},
                with key pension milestones marked as they are reached.
              </p>
            </div>
            <span>Today&apos;s money</span>
          </div>
          <OverviewGrowthChart
            currentAge={inputs.currentAge}
            currentPot={inputs.currentPot}
            retirementAge={inputs.retirementAge}
            planningAge={drawdownInputs.endAge}
            projectionYears={scenario.projection.years}
            drawdownYears={drawdownResult?.years}
          />
        </article>

        <article className="polaris-overview-meaning-panel polaris-overview-journey-summary">
          <div>
            <p className="planner-eyebrow">Retirement journey</p>
            <h2>Plan choices at a glance</h2>
          </div>

          <div className="polaris-overview-journey-badges" aria-label="Retirement plan choices">
            <JourneyBadge
              label="State Pension"
              value={drawdownInputs.annualStatePension > 0 ? "Included" : "Not included"}
              tone={drawdownInputs.annualStatePension > 0 ? "enabled" : "disabled"}
            />
            <JourneyBadge
              label="Tax-free cash"
              value={taxFreeCashChoice.value}
              tone={taxFreeCashChoice.tone}
            />
            <JourneyBadge
              label="Spending plan"
              value={spendingPlanValue}
              tone={hasTieredSpending ? "changed" : "neutral"}
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

function JourneyBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: JourneyBadgeTone;
}) {
  return (
    <div className={`polaris-overview-journey-badge is-${tone}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function createTaxFreeCashChoice(
  mode: "maximum" | "custom" | undefined,
  taxFreeCashTaken: number,
): { value: string; tone: JourneyBadgeTone } {
  if (mode === "custom") {
    return taxFreeCashTaken > 0
      ? { value: "Custom amount", tone: "changed" }
      : { value: "Not included", tone: "disabled" };
  }

  return { value: "Maximum", tone: "enabled" };
}

function createRetirementSummary(result: DrawdownResult | null, planningAge: number) {
  if (!result || result.years.length === 0) {
    return {
      title: "Complete your plan",
      description: "Add the missing plan details to restore your retirement projection.",
      tone: "incomplete" as const,
      averageIncome: 0,
      highestIncome: 0,
      lowestIncome: 0,
    };
  }

  const incomes = result.years.map((year) => year.netIncome);
  const averageIncome = result.totalNetIncome / result.years.length;
  const highestIncome = Math.max(...incomes);
  const lowestIncome = Math.min(...incomes);

  if (result.depletionAge !== null) {
    return {
      title: "Needs Urgent Attention",
      description: `The pension is modelled to run out at age ${result.depletionAge}, before the plan reaches age ${planningAge}.`,
      tone: "urgent" as const,
      averageIncome,
      highestIncome,
      lowestIncome,
    };
  }

  if (result.firstNetIncomeShortfallAge !== null) {
    return {
      title: "Needs Attention",
      description: `The plan develops a modelled income shortfall from age ${result.firstNetIncomeShortfallAge}. Review the retirement strategy before relying on this outcome.`,
      tone: "attention" as const,
      averageIncome,
      highestIncome,
      lowestIncome,
    };
  }

  return {
    title: "Successfully Funded",
    description: `The current retirement strategy is modelled without an income shortfall through to age ${planningAge}.`,
    tone: "success" as const,
    averageIncome,
    highestIncome,
    lowestIncome,
  };
}

function fundingStatusIcon(tone: FundingStatusTone) {
  if (tone === "urgent") return AppIcons.status.danger;
  if (tone === "attention") return AppIcons.status.warning;
  if (tone === "incomplete") return AppIcons.status.information;
  return AppIcons.status.success;
}

function createNextStep({
  hasProjection,
  drawdownResult,
  includeStatePension,
}: {
  hasProjection: boolean;
  drawdownResult: DrawdownResult | null;
  includeStatePension: boolean;
}): {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
  tone: "attention" | "opportunity" | "positive";
} {
  if (!hasProjection || !drawdownResult) {
    return {
      title: "Complete the active plan",
      description:
        "Some required information is missing, so the retirement outlook cannot yet be calculated.",
      actionLabel: "Complete My Plan",
      to: "/plan",
      tone: "attention",
    };
  }

  if (drawdownResult.depletionAge !== null || drawdownResult.firstNetIncomeShortfallAge !== null) {
    return {
      title: "Review the retirement spending strategy",
      description:
        "The current retirement journey contains a modelled shortfall. Review the strategy or test a change before making a decision.",
      actionLabel: "Review Drawdown",
      to: "/drawdown",
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
      tone: "opportunity",
    };
  }

  return {
    title: "Explore how resilient this retirement journey is",
    description:
      "The saved strategy is modelled across the full retirement horizon. Test one change without altering the active plan.",
    actionLabel: "Explore a What If?",
    to: "/what-if",
    tone: "positive",
  };
}
