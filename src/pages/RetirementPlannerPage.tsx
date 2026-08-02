import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useInRouterContext,
  useSearchParams,
} from "react-router-dom";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { GuidedPensionInputsForm } from "../components/inputs/guided";
import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import { formatCurrency } from "../utils/formatters";

const incomeSectionIds: Record<string, string> = {
  "income-target": "income-target",
  chapters: "retirement-chapters",
  "retirement-chapters": "retirement-chapters",
  "tax-free-cash": "tax-free-cash",
  "state-pension": "state-pension",
};

export function RetirementPlannerPage() {
  return useInRouterContext() ? (
    <RoutedRetirementPlannerPage />
  ) : (
    <RetirementPlannerPageContent searchParams={new URLSearchParams()} />
  );
}

function RoutedRetirementPlannerPage() {
  const [searchParams] = useSearchParams();
  return <RetirementPlannerPageContent searchParams={searchParams} />;
}

function RetirementPlannerPageContent({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const { activeScenario, updateScenarioInputs } = useScenarios();
  const [inputs, setInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [retirementGoals] = useStoredRetirementGoals();
  const scenario = usePensionProjection(inputs);

  useEffect(() => {
    if (searchParams.get("step") !== "income") return;

    const stepFrame = window.requestAnimationFrame(() => {
      const incomeStep = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Retirement income"]',
      );
      incomeStep?.click();
      incomeStep?.focus();

      const requestedSection = incomeSectionIds[searchParams.get("section") ?? ""];
      if (!requestedSection) return;

      window.requestAnimationFrame(() => {
        const tab = document.getElementById(
          `current-drawdown-${requestedSection}-tab`,
        ) as HTMLButtonElement | null;
        tab?.click();
        tab?.focus();
        tab?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      });
    });

    return () => window.cancelAnimationFrame(stepFrame);
  }, [searchParams]);

  const commitInputs = useCallback(
    (nextInputs: PensionInputs) => {
      const committed = { ...nextInputs };
      updateScenarioInputs(activeScenario.id, committed);
      setInputs(committed);

      if (activeScenario.isBaseline) {
        savePensionInputs(committed);
      }
    },
    [activeScenario.id, activeScenario.isBaseline, updateScenarioInputs],
  );

  function resetInputs() {
    commitInputs(createDefaultPensionInputs());
  }

  const monthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const preparedness = scenario.hasErrors
    ? null
    : calculateRetirementHealth(scenario.projection, retirementGoals);
  const planComplete = !scenario.hasErrors;

  return (
    <main className="planner-page my-plan-page">
      <header className="planner-header my-plan-header">
        <div>
          <p className="planner-eyebrow">My Plan · {activeScenario.name}</p>
          <h1>Build your retirement plan</h1>
          <p>
            Keep the assumptions, contributions and retirement-income choices for
            the active plan in one place. Changes are reflected across Polaris.
          </p>
        </div>

        <Link className="ui-button ui-button-secondary ui-button-medium" to="/">
          View overview
        </Link>
      </header>

      <section
        className={`my-plan-context${
          activeScenario.isBaseline ? " is-baseline" : " is-alternative"
        }`}
        aria-label="Plan being edited"
      >
        <div className="my-plan-context-main">
          <span className="my-plan-context-icon" aria-hidden="true">
            <FontAwesomeIcon
              icon={
                activeScenario.isBaseline
                  ? AppIcons.status.success
                  : AppIcons.navigation.compare
              }
            />
          </span>
          <div>
            <p className="planner-eyebrow">
              {activeScenario.isBaseline ? "Main retirement plan" : "Saved scenario"}
            </p>
            <h2>{activeScenario.name}</h2>
            <p>
              {activeScenario.isBaseline
                ? "Edits here update the plan used by Overview and as the baseline for experiments."
                : "Edits apply only to this saved scenario. Your baseline plan remains unchanged."}
            </p>
          </div>
        </div>

        <div
          className={`my-plan-completeness${
            planComplete ? " is-complete" : " needs-attention"
          }`}
          aria-label="Plan completeness"
        >
          <span>Plan details</span>
          <strong>{planComplete ? "Complete" : "Needs attention"}</strong>
          <small>
            {planComplete
              ? "All required sections are usable"
              : "Review the highlighted fields"}
          </small>
          <small>Updated {formatUpdatedDate(activeScenario.updatedAt)}</small>
        </div>
      </section>

      <section
        className="my-plan-editor-region"
        aria-label="Edit retirement plan"
      >
        <GuidedPensionInputsForm
          idPrefix="current"
          value={inputs}
          errors={scenario.errors}
          onChange={commitInputs}
          onReset={resetInputs}
        />
      </section>

      <aside className="my-plan-source-note" aria-label="Where plan changes are used">
        <FontAwesomeIcon icon={AppIcons.status.information} aria-hidden="true" />
        <p>
          Changes to this plan update your Overview, What If?, Drawdown and future
          Guidance results.
        </p>
      </aside>

      <section className="my-plan-snapshot" aria-labelledby="my-plan-snapshot-title">
        <div className="my-plan-snapshot-heading">
          <div>
            <p className="planner-eyebrow">Live plan snapshot</p>
            <h2 id="my-plan-snapshot-title">Your plan at a glance</h2>
            <p>
              Saved choices are shown separately from the outcomes calculated from
              them.
            </p>
          </div>
          <span className="my-plan-snapshot-basis">Today&apos;s money</span>
        </div>

        {scenario.hasErrors ? (
          <div className="my-plan-validation" role="alert">
            <strong>The plan needs attention</strong>
            <p>Correct the highlighted fields above to restore the projection.</p>
          </div>
        ) : (
          <>
            <section className="my-plan-snapshot-group" aria-labelledby="saved-choices-title">
              <div className="my-plan-snapshot-group-heading">
                <p className="planner-eyebrow">Saved plan values</p>
                <h3 id="saved-choices-title">Your saved choices</h3>
              </div>
              <div className="my-plan-snapshot-grid is-saved" aria-label="Saved plan choices">
                <SnapshotMetric
                  label="Time to retirement"
                  value={`${yearsToRetirement} years`}
                  detail={`Retirement at age ${inputs.retirementAge}`}
                />
                <SnapshotMetric
                  label="Monthly contributions"
                  value={formatCurrency(monthlyContribution)}
                  detail={`${formatCurrency(inputs.monthlyEmployeeContribution)} from you and ${formatCurrency(inputs.monthlyEmployerContribution)} from your employer`}
                />
              </div>
            </section>

            <section className="my-plan-snapshot-group" aria-labelledby="illustrated-outcome-title">
              <div className="my-plan-snapshot-group-heading">
                <p className="planner-eyebrow">Calculated from this plan</p>
                <h3 id="illustrated-outcome-title">Illustrated outcome</h3>
              </div>
              <div className="my-plan-snapshot-grid is-outcome" aria-label="Illustrated retirement outcome">
                <SnapshotMetric
                  label="Projected pension"
                  value={formatCurrency(scenario.projection.finalBalance.real)}
                  detail="Illustrated value at retirement"
                />
                <SnapshotMetric
                  label="Estimated annual income"
                  value={
                    preparedness
                      ? `${formatCurrency(preparedness.estimatedAnnualIncome)}/year`
                      : "Unavailable"
                  }
                  detail={
                    preparedness
                      ? `${preparedness.score}% of the saved income target`
                      : "Complete the plan to estimate income"
                  }
                />
              </div>
            </section>

            <div className="my-plan-snapshot-actions">
              <p>
                Use the specialist workspaces when you want to test changes,
                compare saved plans or model retirement withdrawals.
              </p>
              <div>
                <Link
                  className="ui-button ui-button-primary ui-button-medium"
                  to="/what-if?experiment=retirement-age"
                >
                  Explore a What If?
                </Link>
                <Link
                  className="ui-button ui-button-secondary ui-button-medium"
                  to="/drawdown?tab=overview"
                >
                  Review drawdown
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function SnapshotMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="my-plan-snapshot-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatUpdatedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
