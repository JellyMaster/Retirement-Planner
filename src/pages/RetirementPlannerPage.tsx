import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

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

export function RetirementPlannerPage() {
  const { activeScenario, updateScenarioInputs } = useScenarios();
  const [inputs, setInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [retirementGoals] = useStoredRetirementGoals();
  const scenario = usePensionProjection(inputs);

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

      <section className="my-plan-snapshot" aria-labelledby="my-plan-snapshot-title">
        <div className="my-plan-snapshot-heading">
          <div>
            <p className="planner-eyebrow">Live plan snapshot</p>
            <h2 id="my-plan-snapshot-title">What the current choices produce</h2>
            <p>
              This is a concise illustration of the active plan, not a separate
              analysis workspace.
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
            <div className="my-plan-snapshot-grid" aria-label="Retirement plan summary">
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

            <div className="my-plan-snapshot-actions">
              <p>
                Use the specialist workspaces when you want to test changes,
                compare saved plans or model retirement withdrawals.
              </p>
              <div>
                <Link className="ui-button ui-button-primary ui-button-medium" to="/what-if">
                  Explore a What If?
                </Link>
                <Link className="ui-button ui-button-secondary ui-button-medium" to="/drawdown">
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
