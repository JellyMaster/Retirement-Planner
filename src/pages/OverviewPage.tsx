import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const monthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const hasPensionBalance = inputs.currentPot > 0;
  const hasContributions = monthlyContribution > 0;
  const hasProjection = !scenario.hasErrors && scenario.projection.years.length > 0;
  const preparedness = hasProjection
    ? calculateRetirementHealth(scenario.projection, retirementGoals)
    : null;

  const story = createOverviewStory({
    planName: activeScenario.name,
    retirementAge: inputs.retirementAge,
    yearsToRetirement,
    hasPensionBalance,
    hasProjection,
    preparedness,
  });

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview · {activeScenario.name}</p>
          <h1>Your retirement story</h1>
          <p>
            A high-level view of where the active plan could take you and the
            assumptions currently shaping that outcome.
          </p>
        </div>
        <Link className="ui-button ui-button-secondary ui-button-medium" to="/plan">
          <FontAwesomeIcon icon={AppIcons.navigation.plan} aria-hidden="true" />
          Open My Plan
        </Link>
      </header>

      <section
        className={`polaris-overview-story is-${story.tone}`}
        aria-labelledby="overview-story-title"
      >
        <div className="polaris-overview-story-copy">
          <p className="planner-eyebrow">Your outlook</p>
          <h2 id="overview-story-title">{story.title}</h2>
          <p>{story.description}</p>
        </div>

        {preparedness ? (
          <div className="polaris-overview-story-score">
            <span>Target coverage</span>
            <strong>{preparedness.score}%</strong>
            <small>{formatPreparednessStatus(preparedness.status)}</small>
          </div>
        ) : (
          <span className="polaris-overview-story-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.status.information} />
          </span>
        )}
      </section>

      <section className="polaris-overview-key-facts" aria-label="Key retirement facts">
        <OverviewFact
          label="Retirement timeline"
          value={`Age ${inputs.retirementAge}`}
          detail={`${yearsToRetirement} years from the current plan age`}
        />
        <OverviewFact
          label="Projected pension"
          value={
            hasProjection
              ? formatCurrency(scenario.projection.finalBalance.real)
              : "Unavailable"
          }
          detail="Estimated at retirement in today’s money"
          incomplete={!hasProjection}
        />
        <OverviewFact
          label="Estimated retirement income"
          value={
            preparedness
              ? `${formatCurrency(preparedness.estimatedAnnualIncome)}/year`
              : "Unavailable"
          }
          detail={
            preparedness
              ? `Against a ${formatCurrency(retirementGoals.desiredAnnualIncome)} annual target`
              : "Complete the active plan to estimate income"
          }
          incomplete={!preparedness}
        />
      </section>

      <section className="polaris-overview-main-story" aria-label="Retirement outlook details">
        <article className="polaris-overview-chart-panel">
          <div className="polaris-overview-panel-heading">
            <div>
              <p className="planner-eyebrow">The journey</p>
              <h2>How your pension could grow</h2>
              <p>
                The projection follows the active plan from age {inputs.currentAge} to
                retirement at age {inputs.retirementAge}.
              </p>
            </div>
            <span>Today&apos;s money</span>
          </div>
          <OverviewGrowthChart years={scenario.projection.years} />
        </article>

        <article className="polaris-overview-meaning-panel">
          <div>
            <p className="planner-eyebrow">What this means</p>
            <h2>{createMeaningHeading(preparedness)}</h2>
          </div>

          <div className="polaris-overview-meaning-list">
            <StoryPoint
              icon={AppIcons.concepts.pension}
              title="You have already built"
              description={
                hasPensionBalance
                  ? `${formatCurrency(inputs.currentPot)} in the pension included in this plan.`
                  : "No current pension balance has been added yet."
              }
              incomplete={!hasPensionBalance}
            />
            <StoryPoint
              icon={AppIcons.concepts.income}
              title="You are adding"
              description={
                hasContributions
                  ? `${formatCurrency(monthlyContribution)} each month, including ${formatCurrency(inputs.monthlyEmployerContribution)} from your employer.`
                  : "No regular employee or employer contributions have been added."
              }
              incomplete={!hasContributions}
            />
            <StoryPoint
              icon={AppIcons.concepts.retirement}
              title="Your income picture"
              description={createIncomeDescription(preparedness, retirementGoals)}
              incomplete={!preparedness}
            />
          </div>

          <div className="polaris-overview-state-pension">
            <span>State Pension</span>
            <strong>
              {retirementGoals.includeStatePension
                ? `${formatCurrency(retirementGoals.statePensionAnnualAmount)}/year from age ${retirementGoals.statePensionAge}`
                : "Not included in this plan"}
            </strong>
          </div>

          <small>
            Figures are illustrations based on the active plan and saved retirement
            goals. They are not a guarantee or financial advice.
          </small>
        </article>
      </section>

      <section className="polaris-overview-next-action">
        <div>
          <p className="planner-eyebrow">A useful next move</p>
          <h2>{createNextActionHeading(preparedness, hasProjection)}</h2>
          <p>{createNextActionDescription(preparedness, hasProjection)}</p>
        </div>
        <Link
          className="ui-button ui-button-primary ui-button-medium"
          to={hasProjection ? "/what-if" : "/plan"}
        >
          {hasProjection ? "Explore a What If?" : "Complete My Plan"}
        </Link>
      </section>
    </main>
  );
}

interface OverviewFactProps {
  label: string;
  value: string;
  detail: string;
  incomplete?: boolean;
}

function OverviewFact({ label, value, detail, incomplete = false }: OverviewFactProps) {
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

function createOverviewStory({
  planName,
  retirementAge,
  yearsToRetirement,
  hasPensionBalance,
  hasProjection,
  preparedness,
}: {
  planName: string;
  retirementAge: number;
  yearsToRetirement: number;
  hasPensionBalance: boolean;
  hasProjection: boolean;
  preparedness: RetirementHealthMetrics | null;
}) {
  if (!hasPensionBalance || !hasProjection || !preparedness) {
    return {
      tone: "information",
      title: `${planName} needs a little more information`,
      description:
        "Complete the missing pension details so Polaris can turn the plan into a meaningful retirement outlook.",
    };
  }

  const timeline =
    yearsToRetirement === 0
      ? `at age ${retirementAge}`
      : `in ${yearsToRetirement} years, at age ${retirementAge}`;

  if (preparedness.status === "on-track") {
    return {
      tone: "positive",
      title: `Your plan is currently on track for retirement ${timeline}`,
      description: `The illustrated income meets your saved annual target, based on the assumptions in ${planName}.`,
    };
  }

  if (preparedness.status === "close") {
    return {
      tone: "warning",
      title: `Your plan is close to its income target for retirement ${timeline}`,
      description:
        "The projected outcome covers most of your target, so a relatively focused change may be enough to close the gap.",
    };
  }

  return {
    tone: "attention",
    title: `Your plan may leave an income gap at retirement ${timeline}`,
    description:
      "The current assumptions produce less illustrated annual income than your saved target, making this a useful plan to review or experiment with.",
  };
}

function createMeaningHeading(preparedness: RetirementHealthMetrics | null): string {
  if (!preparedness) return "The story will become clearer once the plan is complete";
  if (preparedness.status === "on-track") return "The main pieces of the plan currently work together";
  if (preparedness.status === "close") return "The plan is within reach of the target";
  return "The income target is the main pressure point";
}

function createIncomeDescription(
  preparedness: RetirementHealthMetrics | null,
  goals: ReturnType<typeof useStoredRetirementGoals>[0],
): string {
  if (!preparedness) return "Complete the active plan to calculate an income illustration.";

  const gap = Math.abs(preparedness.annualGap);
  if (preparedness.annualGap >= 0) {
    return `${formatCurrency(preparedness.estimatedAnnualIncome)} a year is illustrated, around ${formatCurrency(gap)} above the saved target.`;
  }

  return `${formatCurrency(preparedness.estimatedAnnualIncome)} a year is illustrated, around ${formatCurrency(gap)} below the ${formatCurrency(goals.desiredAnnualIncome)} target.`;
}

function createNextActionHeading(
  preparedness: RetirementHealthMetrics | null,
  hasProjection: boolean,
): string {
  if (!hasProjection || !preparedness) return "Complete the plan before exploring alternatives";
  if (preparedness.status === "on-track") return "See how resilient this outcome is to a change";
  if (preparedness.status === "close") return "Test one focused improvement";
  return "Explore which lever could close the income gap";
}

function createNextActionDescription(
  preparedness: RetirementHealthMetrics | null,
  hasProjection: boolean,
): string {
  if (!hasProjection || !preparedness) {
    return "Add or correct the pension information in My Plan so the projection and income story can be calculated.";
  }

  if (preparedness.status === "on-track") {
    return "Use What If? to test an earlier retirement, different contribution level, or less optimistic assumption without changing the saved plan.";
  }

  return "Use What If? to test retirement age, contributions, fees, or other assumptions and see which change has the clearest effect.";
}

function formatPreparednessStatus(
  status: "on-track" | "close" | "needs-attention",
): string {
  switch (status) {
    case "on-track":
      return "On track";
    case "close":
      return "Close to target";
    case "needs-attention":
      return "Needs attention";
  }
}
