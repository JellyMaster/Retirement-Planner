import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useInRouterContext,
  useSearchParams,
} from "react-router-dom";

import { EssentialAdvancedPensionInputsForm } from "../components/inputs/guided";
import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import "../styles/my-plan-dev-panel.css";

const advancedIncomeSectionLabels: Record<string, string> = {
  chapters: "Will your spending change during retirement?",
  "retirement-chapters": "Will your spending change during retirement?",
  "tax-free-cash": "What income and cash should the plan include?",
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
  const scenario = usePensionProjection(inputs);

  useEffect(() => {
    if (searchParams.get("step") !== "income") return;

    const stepFrame = window.requestAnimationFrame(() => {
      const requestedSection = searchParams.get("section") ?? "";
      const advancedSectionLabel = advancedIncomeSectionLabels[requestedSection];

      if (advancedSectionLabel) {
        const strategy = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Retirement strategy"]',
        );
        strategy?.click();
        strategy?.focus();

        window.requestAnimationFrame(() => {
          const strategyButtons = Array.from(
            document.querySelectorAll<HTMLButtonElement>(
              ".retirement-strategy-card-toggle",
            ),
          );
          const target = strategyButtons.find((button) =>
            button.textContent?.includes(advancedSectionLabel),
          );
          target?.click();
          target?.focus();
          target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        });
        return;
      }

      const retirementIncome = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Retirement income"]',
      );
      retirementIncome?.click();
      retirementIncome?.focus();

      window.requestAnimationFrame(() => {
        const targetId =
          requestedSection === "state-pension"
            ? "current-essential-income-statePension"
            : requestedSection === "income-target"
              ? "current-essential-income-desiredAnnualIncome"
              : null;
        const target = targetId ? document.getElementById(targetId) : null;
        target?.focus();
        target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
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

  const planComplete = !scenario.hasErrors;

  return (
    <main className="planner-page my-plan-page">
      <header className="planner-header my-plan-header">
        <div>
          <p className="planner-eyebrow">My Plan · {activeScenario.name}</p>
          <h1>Build your retirement plan</h1>
          <p>
            Start with the essentials, then fine-tune advanced assumptions only when
            you need them.
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
                ? "Edits here update the plan used across the retirement planner."
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
              ? "Essential plan information is usable"
              : "Review the highlighted fields"}
          </small>
          <small>Updated {formatUpdatedDate(activeScenario.updatedAt)}</small>
        </div>
      </section>

      <section className="my-plan-editor-region" aria-label="Edit retirement plan">
        <EssentialAdvancedPensionInputsForm
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
          Changes here update your Overview, What If? and Drawdown results automatically.
        </p>
      </aside>

      {import.meta.env.DEV && (
        <PlanJsonDevPanel
          scenario={{
            ...activeScenario,
            inputs,
            drawdown: activeScenario.drawdown ?? null,
          }}
        />
      )}
    </main>
  );
}

function PlanJsonDevPanel({ scenario }: { scenario: unknown }) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const json = JSON.stringify(scenario, null, 2);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("Copied plan JSON to clipboard.");
    } catch {
      setCopyStatus("Could not copy automatically. Select the JSON below and copy it manually.");
    }
  }

  return (
    <details className="my-plan-dev-panel">
      <summary>
        <span className="my-plan-dev-panel-summary-copy">
          <strong>Developer · Plan JSON</strong>
          <small>Current active plan snapshot for debugging and calculation audits.</small>
        </span>
        <span className="my-plan-dev-badge">Dev only</span>
      </summary>

      <div className="my-plan-dev-panel-body">
        <div className="my-plan-dev-panel-toolbar">
          <p>
            This is the exact plan configuration currently being edited, including inputs
            and drawdown settings.
          </p>
          <button
            type="button"
            className="ui-button ui-button-secondary ui-button-small"
            onClick={copyJson}
          >
            Copy JSON
          </button>
        </div>

        <pre className="my-plan-dev-json" aria-label="Current plan JSON">
          <code>{json}</code>
        </pre>

        {copyStatus && (
          <p className="my-plan-dev-copy-status" role="status">
            {copyStatus}
          </p>
        )}
      </div>
    </details>
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
