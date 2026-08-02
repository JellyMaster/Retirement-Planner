import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import {
  calculateRetirementHealth,
  type RetirementHealthMetrics,
} from "../components/goals/calculateRetirementHealth";
import { OverviewGrowthChart } from "../components/overview/OverviewGrowthChart";
import { useScenarios } from "../components/scenarios";
import type { ProjectionResult } from "../engine/models/ProjectionResult";
import type { RetirementGoals } from "../engine/models/RetirementGoals";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

const MILESTONE_INTERVAL = 50_000;

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
  const planningAge = activeScenario.drawdown?.planningAge ?? 95;
  const milestone = hasProjection
    ? createNextMilestone(inputs.currentPot, scenario.projection)
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
            <strong className="polaris-overview-score-label">
              {formatPreparednessStatus(preparedness.status)}
            </strong>
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

      <RetirementTimeline
        currentAge={inputs.currentAge}
        retirementAge={inputs.retirementAge}
        planningAge={planningAge}
        goals={retirementGoals}
      />

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

      <section className="polaris-overview-progress-row" aria-label="Plan progress and insight">
        <MilestoneCard milestone={milestone} />
        <InsightCard
          projection={scenario.projection}
          employerContribution={inputs.monthlyEmployerContribution}
          hasProjection={hasProjection}
        />
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

function RetirementTimeline({
  currentAge,
  retirementAge,
  planningAge,
  goals,
}: {
  currentAge: number;
  retirementAge: number;
  planningAge: number;
  goals: RetirementGoals;
}) {
  const events = [
    { age: currentAge, label: "Today", detail: "Your plan starts here" },
    ...(goals.includeStatePension
      ? [
          {
            age: goals.statePensionAge,
            label: "State Pension",
            detail: `${formatCurrency(goals.statePensionAnnualAmount)} a year begins`,
          },
        ]
      : []),
    {
      age: retirementAge,
      label: "Retirement",
      detail: "Regular pension contributions stop",
    },
    {
      age: Math.max(planningAge, retirementAge + 1),
      label: "Plan horizon",
      detail: "Income projection is modelled to this age",
    },
  ].sort((left, right) => left.age - right.age);

  return (
    <section className="polaris-overview-timeline" aria-labelledby="overview-timeline-title">
      <div className="polaris-overview-section-heading">
        <div>
          <p className="planner-eyebrow">Your timeline</p>
          <h2 id="overview-timeline-title">The key moments in this plan</h2>
        </div>
        <p>See when income sources and retirement milestones enter the story.</p>
      </div>
      <ol>
        {events.map((event, index) => (
          <li key={`${event.label}-${event.age}`}>
            <span className="polaris-overview-timeline-marker" aria-hidden="true">
              {index + 1}
            </span>
            <span className="polaris-overview-timeline-age">Age {event.age}</span>
            <strong>{event.label}</strong>
            <small>{event.detail}</small>
          </li>
        ))}
      </ol>
    </section>
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

interface Milestone {
  target: number;
  age: number;
  yearsAway: number;
  progress: number;
}

function MilestoneCard({ milestone }: { milestone: Milestone | null }) {
  return (
    <article className="polaris-overview-milestone">
      <p className="planner-eyebrow">Your next milestone</p>
      {milestone ? (
        <>
          <h2>{formatCurrency(milestone.target)} pension</h2>
          <p>
            The current projection first reaches this level around age {milestone.age},
            approximately {milestone.yearsAway} {milestone.yearsAway === 1 ? "year" : "years"} away.
          </p>
          <div
            className="polaris-overview-milestone-progress"
            role="progressbar"
            aria-label={`Progress towards ${formatCurrency(milestone.target)}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={milestone.progress}
          >
            <span style={{ width: `${milestone.progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <h2>Complete the projection</h2>
          <p>A future pension milestone will appear when the plan has valid growth data.</p>
        </>
      )}
    </article>
  );
}

function InsightCard({
  projection,
  employerContribution,
  hasProjection,
}: {
  projection: ProjectionResult;
  employerContribution: number;
  hasProjection: boolean;
}) {
  const growth = projection.totalInvestmentGrowth.real;
  const finalBalance = projection.finalBalance.real;
  const growthShare = finalBalance > 0 ? Math.round((growth / finalBalance) * 100) : 0;

  return (
    <article className="polaris-overview-insight">
      <p className="planner-eyebrow">Did you know?</p>
      {hasProjection && growth > 0 ? (
        <>
          <h2>Investment growth does a meaningful share of the work</h2>
          <p>
            Around {growthShare}% of the projected retirement pension comes from
            illustrated investment growth rather than the money paid in.
          </p>
        </>
      ) : employerContribution > 0 ? (
        <>
          <h2>Your employer is building the plan with you</h2>
          <p>
            Employer contributions add {formatCurrency(employerContribution * 12)}
            each year before any investment growth is applied.
          </p>
        </>
      ) : (
        <>
          <h2>Small details can materially change the story</h2>
          <p>Add contributions and valid assumptions to reveal the main drivers of this plan.</p>
        </>
      )}
    </article>
  );
}

function createNextMilestone(
  currentPot: number,
  projection: ProjectionResult,
): Milestone | null {
  const safeCurrentPot = Math.max(0, currentPot);
  const target =
    Math.floor(safeCurrentPot / MILESTONE_INTERVAL) * MILESTONE_INTERVAL +
    MILESTONE_INTERVAL;
  const matchingYear = projection.years.find(
    (year) => year.closingBalance.real >= target,
  );

  if (!matchingYear) return null;

  const previousTarget = Math.max(0, target - MILESTONE_INTERVAL);
  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((safeCurrentPot - previousTarget) / (target - previousTarget)) * 100,
      ),
    ),
  );

  return {
    target,
    age: matchingYear.age,
    yearsAway: Math.max(0, matchingYear.age - projection.years[0].age + 1),
    progress,
  };
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
  goals: RetirementGoals,
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
