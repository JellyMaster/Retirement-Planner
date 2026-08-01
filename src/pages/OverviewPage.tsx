import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { OverviewGrowthChart } from "../components/overview/OverviewGrowthChart";
import { useScenarios } from "../components/scenarios";
import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

export function OverviewPage() {
  const { activeScenario } = useScenarios();
  const inputs = activeScenario.inputs;
  const scenario = usePensionProjection(inputs);
  const monthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const hasPensionBalance = inputs.currentPot > 0;
  const hasContributions = monthlyContribution > 0;
  const hasProjection = !scenario.hasErrors && scenario.projection.years.length > 0;
  const preparedness = hasProjection
    ? calculateRetirementHealth(scenario.projection, defaultRetirementGoals)
    : null;

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview</p>
          <h1>Your retirement at a glance</h1>
          <p>
            See the key information currently available for your active plan and
            where more detail would improve the projection.
          </p>
        </div>
      </header>

      <section className="polaris-overview-status" aria-labelledby="overview-status-title">
        <span className="polaris-overview-status-icon" aria-hidden="true">
          <FontAwesomeIcon
            icon={hasPensionBalance ? AppIcons.status.success : AppIcons.status.information}
          />
        </span>
        <div>
          <p className="planner-eyebrow">Active plan</p>
          <h2 id="overview-status-title">
            {hasPensionBalance
              ? `${activeScenario.name} is available`
              : `Add pension details to ${activeScenario.name}`}
          </h2>
          <p>
            {hasPensionBalance
              ? `The figures below are based on the inputs saved in ${activeScenario.name}.`
              : "Contribution assumptions are available, but adding a current pension balance will make this overview more useful."}
          </p>
        </div>
      </section>

      <section className="polaris-overview-grid" aria-label="Retirement plan summary">
        <OverviewMetric
          icon={AppIcons.concepts.pension}
          label="Current pension"
          value={hasPensionBalance ? formatCurrency(inputs.currentPot) : "Not added"}
          detail={hasPensionBalance ? "Current pension balance" : "Add this in My Plan"}
          incomplete={!hasPensionBalance}
        />

        <OverviewMetric
          icon={AppIcons.concepts.income}
          label="Monthly saving"
          value={hasContributions ? formatCurrency(monthlyContribution) : "Not added"}
          detail={
            hasContributions
              ? `${formatCurrency(inputs.monthlyEmployeeContribution)} you + ${formatCurrency(inputs.monthlyEmployerContribution)} employer`
              : "Add employee and employer contributions"
          }
          incomplete={!hasContributions}
        />

        <OverviewMetric
          icon={AppIcons.concepts.retirement}
          label="Planned retirement"
          value={`Age ${inputs.retirementAge}`}
          detail={`${yearsToRetirement} years from the current plan age`}
        />

        <OverviewMetric
          icon={AppIcons.concepts.projection}
          label="Projected pension"
          value={hasProjection ? formatCurrency(scenario.projection.finalBalance.real) : "Unavailable"}
          detail={
            hasProjection
              ? "Estimated value at retirement in today's money"
              : "Review the plan inputs to calculate a projection"
          }
          incomplete={!hasProjection}
        />
      </section>

      <section className="polaris-overview-outlook" aria-label="Active plan outlook">
        <article className="polaris-overview-chart-panel">
          <div className="polaris-overview-panel-heading">
            <div>
              <p className="planner-eyebrow">Growth</p>
              <h2>Pension growth over time</h2>
            </div>
            <span>Today&apos;s money</span>
          </div>
          <OverviewGrowthChart years={scenario.projection.years} />
        </article>

        <article
          className={`polaris-overview-preparedness${
            preparedness ? ` is-${preparedness.status}` : " is-unavailable"
          }`}
        >
          <div>
            <p className="planner-eyebrow">Preparedness</p>
            <h2>How prepared is this plan?</h2>
          </div>

          {preparedness ? (
            <>
              <div className="polaris-overview-preparedness-score">
                <strong>{preparedness.score}</strong>
                <span>out of 100</span>
              </div>
              <div
                className="polaris-overview-preparedness-progress"
                role="progressbar"
                aria-label="Retirement preparedness"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={preparedness.score}
              >
                <span style={{ width: `${preparedness.score}%` }} />
              </div>
              <strong className="polaris-overview-preparedness-label">
                {formatPreparednessStatus(preparedness.status)}
              </strong>
              <p>
                The active plan is estimated to provide {formatCurrency(
                  preparedness.estimatedAnnualIncome,
                )} per year against the default income goal.
              </p>
              <small>
                This is an illustrative score using the default retirement goals in
                My Plan, not a guarantee or financial advice.
              </small>
            </>
          ) : (
            <p>Correct the active plan inputs to calculate preparedness.</p>
          )}
        </article>
      </section>

      <section className="polaris-overview-next-step">
        <div>
          <p className="planner-eyebrow">Next step</p>
          <h2>Keep your active plan information up to date</h2>
          <p>
            Changes saved to the active scenario update this overview immediately
            and are restored when you return to the application.
          </p>
        </div>

        <Link className="ui-button ui-button-primary ui-button-medium" to="/plan">
          <FontAwesomeIcon icon={AppIcons.navigation.plan} aria-hidden="true" />
          Open My Plan
        </Link>
      </section>
    </main>
  );
}

interface OverviewMetricProps {
  icon: (typeof AppIcons.concepts)[keyof typeof AppIcons.concepts];
  label: string;
  value: string;
  detail: string;
  incomplete?: boolean;
}

function OverviewMetric({
  icon,
  label,
  value,
  detail,
  incomplete = false,
}: OverviewMetricProps) {
  return (
    <article className={`polaris-overview-metric${incomplete ? " is-incomplete" : ""}`}>
      <span className="polaris-overview-metric-icon" aria-hidden="true">
        <FontAwesomeIcon icon={icon} fixedWidth />
      </span>
      <div className="polaris-overview-metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
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
