import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useMemo } from "react";

import { useScenarios } from "../components/scenarios";
import type { AppIcon } from "../icons";
import { AppIcons } from "../icons";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { formatCurrency, formatPercentage } from "../utils/formatters";

const drawdownEngine = new DrawdownEngine();

type GuidanceTone = "attention" | "opportunity" | "positive" | "neutral";

interface GuidanceItem {
  id: string;
  title: string;
  description: string;
  evidence: string;
  actionLabel: string;
  to: string;
  icon: AppIcon;
  tone: GuidanceTone;
}

export function GuidancePage() {
  const { activeScenario, scenarios } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const pensionProjection = usePensionProjection(activeScenario.inputs);

  const drawdownInputs = useMemo(
    () =>
      createDrawdownInputsFromPlan({
        pensionInputs: activeScenario.inputs,
        projection: pensionProjection.projection,
        retirementGoals,
        drawdown: activeScenario.drawdown,
      }),
    [
      activeScenario.drawdown,
      activeScenario.inputs,
      pensionProjection.projection,
      retirementGoals,
    ],
  );
  const drawdownValidation = useMemo(
    () => validateDrawdownInputs(drawdownInputs),
    [drawdownInputs],
  );
  const drawdownResult = useMemo(
    () =>
      drawdownValidation.isValid
        ? drawdownEngine.calculate(drawdownInputs)
        : null,
    [drawdownInputs, drawdownValidation.isValid],
  );

  const projectedPension = pensionProjection.hasErrors
    ? 0
    : Math.max(0, pensionProjection.projection.finalBalance.real);
  const monthlySaving =
    activeScenario.inputs.monthlyEmployeeContribution +
    activeScenario.inputs.monthlyEmployerContribution;
  const hasChapters = Boolean(activeScenario.drawdown.spendingPhases?.length);

  const attentionItems: GuidanceItem[] = [];
  const opportunityItems: GuidanceItem[] = [];

  if (!drawdownValidation.isValid) {
    attentionItems.push({
      id: "invalid-drawdown",
      title: "Review the retirement-income settings",
      description:
        "One or more saved income settings cannot currently produce a complete retirement illustration.",
      evidence: "The Drawdown projection is waiting for valid plan values.",
      actionLabel: "Review My Plan",
      to: "/plan",
      icon: AppIcons.warning,
      tone: "attention",
    });
  } else if (drawdownResult) {
    const firstShortfallAge =
      drawdownResult.firstNetIncomeShortfallAge ??
      drawdownResult.firstShortfallAge;

    if (firstShortfallAge !== null) {
      attentionItems.push({
        id: "income-shortfall",
        title: "The selected income is not supported throughout",
        description:
          "The illustration shows a point where available retirement income falls below the saved target.",
        evidence: `The first illustrated shortfall begins at age ${firstShortfallAge}.`,
        actionLabel: "Review the income journey",
        to: "/drawdown",
        icon: AppIcons.status.warning,
        tone: "attention",
      });
    }

    if (drawdownResult.depletionAge !== null) {
      attentionItems.push({
        id: "depletion",
        title: "The private pension runs out before the plan ends",
        description:
          "Later retirement income may depend more heavily on State Pension or a lower spending target.",
        evidence: `The pension reaches £0 at age ${drawdownResult.depletionAge}, before age ${drawdownInputs.endAge}.`,
        actionLabel: "Explore the pension balance",
        to: "/drawdown",
        icon: AppIcons.wallet,
        tone: "attention",
      });
    }
  }

  if (!retirementGoals.includeStatePension) {
    attentionItems.push({
      id: "state-pension",
      title: "State Pension is not included",
      description:
        "Leaving it out can overstate the amount that needs to come from the private pension after State Pension age.",
      evidence: "The current retirement-income plan uses private pension income only.",
      actionLabel: "Add State Pension",
      to: "/plan",
      icon: AppIcons.pension,
      tone: "attention",
    });
  }

  if (
    activeScenario.drawdown.withdrawalStrategy === "target-income" &&
    !hasChapters
  ) {
    opportunityItems.push({
      id: "chapters",
      title: "Model how spending may change later",
      description:
        "Active, settled and later-life retirement chapters can be more realistic than one flat income target.",
      evidence: `${formatCurrency(activeScenario.drawdown.desiredAnnualIncome)} is currently used throughout retirement.`,
      actionLabel: "Set retirement chapters",
      to: "/plan",
      icon: AppIcons.calendar,
      tone: "opportunity",
    });
  }

  if (activeScenario.inputs.annualFee >= 0.01) {
    opportunityItems.push({
      id: "fees",
      title: "Test whether lower fees change the outcome",
      description:
        "Annual charges compound over the years before and during retirement.",
      evidence: `The active plan uses an annual fee of ${formatPercentage(activeScenario.inputs.annualFee)}.`,
      actionLabel: "Explore lower fees",
      to: "/what-if",
      icon: AppIcons.fees,
      tone: "opportunity",
    });
  }

  opportunityItems.push({
    id: "sequence-risk",
    title: "See why poor early returns matter",
    description:
      "The order of investment returns can affect retirement even when the long-term average is unchanged.",
    evidence: "Explore compares early, midpoint and late market falls using the same returns.",
    actionLabel: "Open the interactive lesson",
    to: "/explore",
    icon: AppIcons.growth,
    tone: "opportunity",
  });

  if (scenarios.length < 2) {
    opportunityItems.push({
      id: "comparison",
      title: "Create an alternative before making a major change",
      description:
        "A saved alternative lets you compare trade-offs without replacing the active plan.",
      evidence: "Only one saved scenario is currently available.",
      actionLabel: "Create a comparison",
      to: "/compare",
      icon: AppIcons.comparison,
      tone: "opportunity",
    });
  }

  const healthyPlan =
    drawdownResult !== null &&
    drawdownResult.depletionAge === null &&
    drawdownResult.firstShortfallAge === null &&
    drawdownResult.firstNetIncomeShortfallAge === null;

  const primaryItem: GuidanceItem =
    attentionItems[0] ??
    (healthyPlan
      ? {
          id: "healthy-plan",
          title: "Stress-test a plan that currently supports its target",
          description:
            "The deterministic illustration supports the selected income through the planning horizon. The useful next step is to test conditions the straight-line projection cannot show.",
          evidence: `The plan finishes at age ${drawdownInputs.endAge} with ${formatCurrency(drawdownResult?.finalBalance ?? 0)} remaining.`,
          actionLabel: "Explore retirement risk",
          to: "/explore",
          icon: AppIcons.success,
          tone: "positive",
        }
      : opportunityItems[0]);

  const remainingAttention = attentionItems.filter(
    (item) => item.id !== primaryItem.id,
  );
  const remainingOpportunities = opportunityItems.filter(
    (item) => item.id !== primaryItem.id,
  );

  const checks = [
    {
      label: "Pension value",
      value: formatCurrency(activeScenario.inputs.currentPot),
      detail: "Update after receiving a new statement.",
    },
    {
      label: "Monthly saving",
      value: formatCurrency(monthlySaving),
      detail: "Confirm employee and employer contributions.",
    },
    {
      label: "Retirement age",
      value: `Age ${activeScenario.inputs.retirementAge}`,
      detail: "Review when work or lifestyle plans change.",
    },
    {
      label: "Projected pension",
      value: formatCurrency(projectedPension),
      detail: "An illustration based on the saved assumptions.",
    },
    {
      label: "Income target",
      value:
        activeScenario.drawdown.withdrawalStrategy === "target-income"
          ? `${formatCurrency(activeScenario.drawdown.desiredAnnualIncome)}/year`
          : `${formatPercentage(activeScenario.drawdown.withdrawalRate)} of the pension`,
      detail: "Confirm that it still reflects the intended lifestyle.",
    },
    {
      label: "End of plan",
      value: `Age ${activeScenario.drawdown.planningAge}`,
      detail: "Consider whether the longevity horizon remains suitable.",
    },
  ];

  return (
    <main className="planner-page guidance-page">
      <header className="planner-header guidance-header">
        <div>
          <p className="planner-eyebrow">Guidance · {activeScenario.name}</p>
          <h1>Know what to review next</h1>
          <p>
            Prioritised planning prompts based on the active plan. Guidance helps
            you navigate the illustration; it is not regulated financial advice.
          </p>
        </div>
        <div className="guidance-header-summary" aria-label="Guidance summary">
          <span>
            <small>Needs attention</small>
            <strong>{attentionItems.length}</strong>
          </span>
          <span>
            <small>Worth exploring</small>
            <strong>{opportunityItems.length}</strong>
          </span>
          <span>
            <small>Active plan</small>
            <strong>{activeScenario.name}</strong>
          </span>
        </div>
      </header>

      <section className="guidance-primary" aria-labelledby="guidance-primary-title">
        <span className={`guidance-primary-icon is-${primaryItem.tone}`} aria-hidden="true">
          <FontAwesomeIcon icon={primaryItem.icon} fixedWidth />
        </span>
        <div>
          <p className="planner-eyebrow">Your next best step</p>
          <h2 id="guidance-primary-title">{primaryItem.title}</h2>
          <p>{primaryItem.description}</p>
          <strong>{primaryItem.evidence}</strong>
        </div>
        <Link className="primary-button" to={primaryItem.to}>
          {primaryItem.actionLabel}
        </Link>
      </section>

      {remainingAttention.length > 0 && (
        <GuidanceSection
          eyebrow="Needs attention"
          title="Issues that could materially affect the plan"
          description="These items are derived from the saved projection and retirement-income settings."
          items={remainingAttention}
        />
      )}

      <GuidanceSection
        eyebrow="Worth exploring"
        title="Useful ways to improve understanding"
        description="Optional experiments and planning refinements rather than warnings."
        items={remainingOpportunities}
      />

      <section className="guidance-checks" aria-labelledby="guidance-checks-title">
        <div className="guidance-section-heading">
          <div>
            <p className="planner-eyebrow">Keep the plan current</p>
            <h2 id="guidance-checks-title">Review these values periodically</h2>
            <p>
              Guidance is only as useful as the information and assumptions saved
              in the active plan.
            </p>
          </div>
          <Link className="secondary-button" to="/plan">
            Review My Plan
          </Link>
        </div>
        <div className="guidance-check-grid">
          {checks.map((check) => (
            <article key={check.label} className="guidance-check-card">
              <span aria-hidden="true">
                <FontAwesomeIcon icon={AppIcons.check} />
              </span>
              <div>
                <small>{check.label}</small>
                <strong>{check.value}</strong>
                <p>{check.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="guidance-disclaimer">
        Polaris provides deterministic planning illustrations and educational
        guidance. It does not assess suitability, recommend a financial product,
        or replace advice from an authorised professional.
      </p>
    </main>
  );
}

function GuidanceSection({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: GuidanceItem[];
}) {
  const id = `guidance-${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="guidance-section" aria-labelledby={id}>
      <div className="guidance-section-heading">
        <div>
          <p className="planner-eyebrow">{eyebrow}</p>
          <h2 id={id}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="guidance-card-grid">
        {items.map((item) => (
          <GuidanceRecommendationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function GuidanceRecommendationCard({ item }: { item: GuidanceItem }) {
  return (
    <article className={`guidance-card is-${item.tone}`}>
      <span className="guidance-card-icon" aria-hidden="true">
        <FontAwesomeIcon icon={item.icon} fixedWidth />
      </span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <strong>{item.evidence}</strong>
      </div>
      <Link className="guidance-card-action" to={item.to}>
        {item.actionLabel}
      </Link>
    </article>
  );
}
