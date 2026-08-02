import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { SequenceReturnsLesson } from "../components/explore/SequenceReturnsLesson";
import { useScenarios } from "../components/scenarios";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons, type AppIcon } from "../icons";
import { formatCurrency, formatPercentage } from "../utils/formatters";

interface ExploreCard {
  title: string;
  description: string;
  insight?: string;
  icon: AppIcon;
  actionLabel?: string;
  to?: string;
}

export function ExplorePage() {
  const { activeScenario } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const projection = usePensionProjection(activeScenario.inputs);
  const inputs = activeScenario.inputs;
  const drawdown = activeScenario.drawdown;
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const projectedPension = projection.hasErrors
    ? 0
    : Math.max(0, projection.projection.finalBalance.real);
  const monthlySaving =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const desiredIncome =
    drawdown?.desiredAnnualIncome ?? retirementGoals.desiredAnnualIncome;
  const retirementLength = Math.max(
    10,
    (drawdown?.planningAge ?? 95) - inputs.retirementAge,
  );

  const personalisedInsights: ExploreCard[] = [
    {
      title: "Why retirement timing matters",
      description:
        "See how one earlier or later retirement year changes both saving time and the number of years the pension must support.",
      insight: `${yearsToRetirement} years remain until retirement at age ${inputs.retirementAge}.`,
      icon: AppIcons.retirement,
      actionLabel: "Explore retirement age",
      to: "/what-if",
    },
    {
      title: "What your monthly saving could build",
      description:
        "Contributions and investment growth work together. Explore which part of the projected pension comes from saving more.",
      insight: `${formatCurrency(monthlySaving)} is currently added each month.`,
      icon: AppIcons.pension,
      actionLabel: "Explore saving more",
      to: "/what-if",
    },
    {
      title: "Why pension fees compound",
      description:
        "A small annual charge is applied repeatedly, so its long-term cost can be larger than the percentage initially suggests.",
      insight: `The active plan uses an annual fee of ${formatPercentage(inputs.annualFee)}.`,
      icon: AppIcons.fees,
      actionLabel: "Explore lower fees",
      to: "/what-if",
    },
    {
      title: "How State Pension supports income",
      description:
        "State Pension can reduce the amount needed from the private pension once it begins.",
      insight: retirementGoals.includeStatePension
        ? `${formatCurrency(retirementGoals.statePensionAnnualAmount)} a year from age ${retirementGoals.statePensionAge}.`
        : "State Pension is not currently included in the plan.",
      icon: AppIcons.pension,
      actionLabel: "Explore State Pension",
      to: "/what-if",
    },
  ];

  const riskDemonstrations: ExploreCard[] = [
    {
      title: "Retiring during a downturn",
      description:
        "Stress-test a one-off market fall and see how its timing changes the projected retirement outcome.",
      insight: `The active plan currently projects ${formatCurrency(projectedPension)} at retirement.`,
      icon: AppIcons.warning,
      actionLabel: "Open market downturn",
      to: "/what-if",
    },
    {
      title: "Higher inflation",
      description:
        "Explore how rising prices affect future spending power and the income required to maintain the same lifestyle.",
      insight: `The active plan assumes ${formatPercentage(inputs.inflation)} annual inflation.`,
      icon: AppIcons.money,
      actionLabel: "Explore inflation",
      to: "/what-if",
    },
    {
      title: "Living longer than planned",
      description:
        "Understand why the end age matters and how extra retirement years can place pressure on withdrawals.",
      insight: `The income plan currently runs to age ${drawdown?.planningAge ?? 95}.`,
      icon: AppIcons.health,
      actionLabel: "Review Drawdown",
      to: "/drawdown",
    },
  ];

  return (
    <main className="planner-page explore-page">
      <header className="planner-header explore-header">
        <div>
          <p className="planner-eyebrow">Explore · {activeScenario.name}</p>
          <h1>Understand the decisions behind your retirement</h1>
          <p>
            Learn through your own plan. Start with a personalised insight, see
            how risk can change the story, or review one retirement essential at
            a time.
          </p>
        </div>
        <div className="explore-header-summary" aria-label="Active plan summary">
          <span><small>Retirement</small><strong>Age {inputs.retirementAge}</strong></span>
          <span><small>Projected pension</small><strong>{formatCurrency(projectedPension)}</strong></span>
          <span><small>Income target</small><strong>{formatCurrency(desiredIncome)}/year</strong></span>
        </div>
      </header>

      <ExploreSection
        eyebrow="Based on your active plan"
        title="Topics worth understanding now"
        description="Each explanation begins with a value already saved in your plan and leads into a relevant experiment."
        cards={personalisedInsights}
      />

      <section className="explore-section" aria-labelledby="explore-sequence-title">
        <div className="explore-section-heading">
          <div>
            <p className="planner-eyebrow">Featured demonstration</p>
            <h2 id="explore-sequence-title">See sequence-of-returns risk using your plan</h2>
            <p>
              Isolate the effect of return order with two journeys that receive
              the same annual returns and the same average return.
            </p>
          </div>
        </div>
        <SequenceReturnsLesson
          startingBalance={projectedPension}
          annualWithdrawal={desiredIncome}
          retirementAge={inputs.retirementAge}
          durationYears={retirementLength}
          normalReturn={Math.max(-0.25, inputs.annualReturn - inputs.annualFee)}
        />
      </section>

      <ExploreSection
        eyebrow="More ways to see the risk"
        title="Demonstrate what averages can hide"
        description="Use existing stress tests and retirement views to explore other risks around the active plan."
        cards={riskDemonstrations}
      />

      <section className="explore-section" aria-labelledby="explore-essentials-title">
        <div className="explore-section-heading">
          <div>
            <p className="planner-eyebrow">Retirement essentials</p>
            <h2 id="explore-essentials-title">Learn one concept at a time</h2>
            <p>Open a short explanation without leaving the page.</p>
          </div>
        </div>
        <div className="explore-essential-grid">
          <Essential
            title="Tax-free cash"
            icon={AppIcons.money}
            summary="Why taking cash reduces the pension left to provide income."
          >
            Tax-free cash no longer remains invested to support later retirement
            income. Polaris therefore shows both the cash selected and the pension
            remaining for drawdown.
          </Essential>
          <Essential
            title="Gross versus net income"
            icon={AppIcons.concepts.income}
            summary="The difference between income before tax and money available to spend."
          >
            A gross target describes total taxable income. A net target describes
            the spendable amount after modelled income tax, so the pension may need
            to provide more than the target shown.
          </Essential>
          <Essential
            title="Withdrawal rates"
            icon={AppIcons.fees}
            summary="Why a percentage approach changes as the pension balance changes."
          >
            A percentage withdrawal takes a share of the remaining pension each
            year. Income can therefore rise or fall with the balance, unlike a
            fixed target-income strategy.
          </Essential>
          <Essential
            title="Planning assumptions"
            icon={AppIcons.settings}
            summary="How returns, inflation and fees shape a deterministic illustration."
          >
            Assumptions are not forecasts. They provide a consistent basis for
            comparing decisions, while stress tests show how different conditions
            could change the result.
          </Essential>
        </div>
      </section>

      <section className="explore-next-step" aria-labelledby="explore-next-step-title">
        <div>
          <p className="planner-eyebrow">Continue the journey</p>
          <h2 id="explore-next-step-title">Turn understanding into a decision</h2>
          <p>
            Experiment in What If?, compare saved alternatives, or review how the
            active plan provides income through retirement.
          </p>
        </div>
        <div>
          <Link className="primary-button" to="/what-if">Open What If?</Link>
          <Link className="secondary-button" to="/drawdown">Review Drawdown</Link>
        </div>
      </section>
    </main>
  );
}

function ExploreSection({
  eyebrow,
  title,
  description,
  cards,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: ExploreCard[];
}) {
  const sectionId = `explore-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section className="explore-section" aria-labelledby={sectionId}>
      <div className="explore-section-heading">
        <div>
          <p className="planner-eyebrow">{eyebrow}</p>
          <h2 id={sectionId}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="explore-card-grid">
        {cards.map((card) => (
          <article key={card.title} className="explore-card">
            <span className="explore-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={card.icon} fixedWidth />
            </span>
            <div className="explore-card-copy">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.insight && <strong>{card.insight}</strong>}
            </div>
            {card.to && card.actionLabel && (
              <Link to={card.to} className="explore-card-action">
                {card.actionLabel}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Essential({
  title,
  icon,
  summary,
  children,
}: {
  title: string;
  icon: AppIcon;
  summary: string;
  children: string;
}) {
  return (
    <details className="explore-essential-card">
      <summary>
        <span className="explore-essential-icon" aria-hidden="true">
          <FontAwesomeIcon icon={icon} fixedWidth />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{summary}</small>
        </span>
        <span className="explore-essential-expand" aria-hidden="true">+</span>
      </summary>
      <p>{children}</p>
    </details>
  );
}
