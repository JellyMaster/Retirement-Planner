import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { OverviewGrowthChart } from "../components/overview/OverviewGrowthChart";
import { useScenarios } from "../components/scenarios";
import { defaultPensionInputs } from "../config/defaultPensionInputs";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import type { DrawdownResult } from "../engine/drawdown/models/DrawdownResult";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { formatCurrency, formatPercentage } from "../utils/formatters";

const drawdownEngine = new DrawdownEngine();

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
  const drawdownResult =
    hasProjection && drawdownValidation.isValid
      ? drawdownEngine.calculate(drawdownInputs)
      : null;
  const retirementSummary = createRetirementSummary(drawdownResult, drawdownInputs.endAge);
  const nextStep = createNextStep({
    hasProjection,
    drawdownResult,
    includeStatePension: drawdownInputs.annualStatePension > 0,
  });
  const spendingPattern = createSpendingPatternSummary(activeScenario.drawdown?.spendingPhases);
  const assumptionsChanged =
    inputs.annualReturn !== defaultPensionInputs.annualReturn ||
    inputs.annualFee !== defaultPensionInputs.annualFee ||
    inputs.inflation !== defaultPensionInputs.inflation;
  const futureSavingChanged =
    inputs.annualContributionIncrease > 0 ||
    (inputs.extraMonthlyContribution ?? 0) > 0;

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview · {activeScenario.name}</p>
          <h1>Your retirement</h1>
          <p>
            See how the active plan is expected to work from today through retirement.
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
          <p className="planner-eyebrow">Plan health</p>
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
          <FontAwesomeIcon
            icon={
              retirementSummary.tone === "needs-attention"
                ? AppIcons.status.warning
                : retirementSummary.tone === "incomplete"
                  ? AppIcons.status.information
                  : AppIcons.status.success
            }
          />
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
            drawdownResult
              ? `${formatCurrency(retirementSummary.averageIncome)}/year`
              : "Unavailable"
          }
          detail={
            drawdownResult
              ? `${drawdownInputs.withdrawalStrategy === "percentage" ? "Percentage drawdown" : spendingPattern === "Level spending" ? "Target spending" : "Custom spending plan"} · average across retirement`
              : "Complete the plan to estimate income"
          }
          incomplete={!drawdownResult}
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
            <p className="planner-eyebrow">Retirement journey</p>
            <h2>How this plan is set to work</h2>
          </div>
          <div className="polaris-overview-meaning-list">
            <StoryPoint
              icon={AppIcons.concepts.income}
              title="Income strategy"
              description={createIncomeStrategySummary(drawdownInputs.withdrawalStrategy, drawdownInputs.withdrawalRate, drawdownInputs.desiredAnnualIncome, spendingPattern)}
            />
            <StoryPoint
              icon={AppIcons.concepts.pension}
              title="Tax-free cash"
              description={
                drawdownResult && drawdownResult.taxFreeCashTaken > 0
                  ? `${formatCurrency(drawdownResult.taxFreeCashTaken)} at retirement`
                  : "Not taken"
              }
            />
            <StoryPoint
              icon={AppIcons.concepts.retirement}
              title="State Pension"
              description={
                drawdownInputs.annualStatePension > 0
                  ? `${formatCurrency(drawdownInputs.annualStatePension)}/year from age ${drawdownInputs.statePensionAge}`
                  : "Not included"
              }
              incomplete={drawdownInputs.annualStatePension <= 0}
            />
            <StoryPoint
              icon={AppIcons.concepts.income}
              title="Spending pattern"
              description={spendingPattern}
            />
            {(futureSavingChanged || assumptionsChanged) && (
              <StoryPoint
                icon={AppIcons.concepts.pension}
                title="Advanced plan changes"
                description={[
                  futureSavingChanged ? "Future saving changes active" : null,
                  assumptionsChanged ? "Investment assumptions changed" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            )}
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
      title: `Pension runs out at age ${result.depletionAge}`,
      description: `The current retirement strategy does not maintain a pension balance through the full plan to age ${planningAge}.`,
      tone: "needs-attention" as const,
      averageIncome,
      highestIncome,
      lowestIncome,
    };
  }

  if (result.firstNetIncomeShortfallAge !== null) {
    return {
      title: `Income shortfall from age ${result.firstNetIncomeShortfallAge}`,
      description: `The pension remains invested, but the current strategy cannot provide all of the planned spend through to age ${planningAge}.`,
      tone: "needs-attention" as const,
      averageIncome,
      highestIncome,
      lowestIncome,
    };
  }

  return {
    title: `Plan modelled through age ${planningAge}`,
    description:
      result.withdrawalStrategy === "percentage"
        ? `The plan follows the saved percentage-withdrawal strategy while the pension balance changes over retirement.`
        : "The modelled pension supports the saved retirement spending pattern across the full planning horizon.",
    tone: "on-track" as const,
    averageIncome,
    highestIncome,
    lowestIncome,
  };
}

function createIncomeStrategySummary(
  strategy: "target-income" | "percentage",
  withdrawalRate: number,
  desiredAnnualIncome: number,
  spendingPattern: string,
): string {
  if (strategy === "percentage") {
    return `${formatPercentage(withdrawalRate)} of the remaining pension each year`;
  }
  if (spendingPattern !== "Level spending") {
    return "Custom spending targets by retirement phase";
  }
  return `${formatCurrency(desiredAnnualIncome)}/year target spending`;
}

function createSpendingPatternSummary(
  phases:
    | Array<{ startAge: number; annualIncome: number; label?: string; withdrawalRate?: number }>
    | undefined,
): string {
  if (!phases?.length) return "Level spending";

  return phases
    .slice()
    .sort((left, right) => left.startAge - right.startAge)
    .map((phase) => `${phase.label ?? `Age ${phase.startAge}`} from ${phase.startAge}`)
    .join(" · ");
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
