import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredPensionInputs } from "../hooks/useStoredPensionInputs";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

export function OverviewPage() {
  const inputs = useStoredPensionInputs();
  const scenario = usePensionProjection(inputs);
  const monthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const hasPensionBalance = inputs.currentPot > 0;
  const hasContributions = monthlyContribution > 0;
  const hasProjection = !scenario.hasErrors && scenario.projection.years.length > 0;

  return (
    <main className="planner-page polaris-overview-page">
      <header className="polaris-overview-header">
        <div>
          <p className="planner-eyebrow">Overview</p>
          <h1>Your retirement at a glance</h1>
          <p>
            See the key information currently available for your plan and where
            more detail would improve the projection.
          </p>
        </div>

        <Link className="ui-button ui-button-primary" to="/plan">
          <FontAwesomeIcon icon={AppIcons.navigation.plan} aria-hidden="true" />
          Review my plan
        </Link>
      </header>

      <section className="polaris-overview-status" aria-labelledby="overview-status-title">
        <span className="polaris-overview-status-icon" aria-hidden="true">
          <FontAwesomeIcon
            icon={hasPensionBalance ? AppIcons.status.success : AppIcons.status.information}
          />
        </span>
        <div>
          <p className="planner-eyebrow">Plan status</p>
          <h2 id="overview-status-title">
            {hasPensionBalance ? "Your baseline plan is available" : "Add your pension details"}
          </h2>
          <p>
            {hasPensionBalance
              ? "The figures below are based on the information currently held in My Plan."
              : "Your contribution assumptions are available, but adding your current pension balance will make this overview more useful."}
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

      <section className="polaris-overview-next-step">
        <div>
          <p className="planner-eyebrow">Next step</p>
          <h2>Keep your plan information up to date</h2>
          <p>
            Changes saved in My Plan now update this overview immediately and are
            restored when you return to the application.
          </p>
        </div>

        <Link className="ui-button ui-button-secondary" to="/plan">
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
