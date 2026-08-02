import { useEffect, useMemo, useState } from "react";
import { Info, PoundSterling, TrendingUp } from "lucide-react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownChoiceSummary } from "../components/drawdown/DrawdownChoiceSummary";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownPlanContext } from "../components/drawdown/DrawdownPlanContext";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownRetirementTimeline } from "../components/drawdown/DrawdownRetirementTimeline";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { DrawdownSummaryRibbon } from "../components/drawdown/DrawdownSummaryRibbon";
import { DrawdownSustainabilityDashboard } from "../components/drawdown/DrawdownSustainabilityDashboard";
import {
  DrawdownWorkspaceNavigation,
  type DrawdownWorkspaceSection,
} from "../components/drawdown/DrawdownWorkspaceNavigation";
import { ScenarioEditModal, useScenarios } from "../components/scenarios";
import type { ScenarioDrawdownPreferences } from "../domain/scenarios";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

const MONEY_DISPLAY_STORAGE_KEY = "retirement-planner:drawdown-money-display";
const drawdownEngine = new DrawdownEngine();

function getInitialMoneyDisplayMode(): MoneyDisplayMode {
  if (typeof window === "undefined") return "today";

  const savedMode = window.localStorage.getItem(MONEY_DISPLAY_STORAGE_KEY);
  return savedMode === "nominal" || savedMode === "today" ? savedMode : "today";
}

export function DrawdownPlannerPage() {
  const { activeScenario, updateScenarioPlan } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(
    getInitialMoneyDisplayMode,
  );
  const [activeSection, setActiveSection] =
    useState<DrawdownWorkspaceSection>("overview");

  const pensionProjection = usePensionProjection(activeScenario.inputs);
  const inputs = useMemo(
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
  const validation = useMemo(() => validateDrawdownInputs(inputs), [inputs]);
  const result = useMemo(
    () => (validation.isValid ? drawdownEngine.calculate(inputs) : null),
    [inputs, validation.isValid],
  );

  useEffect(() => {
    window.localStorage.setItem(MONEY_DISPLAY_STORAGE_KEY, displayMode);
  }, [displayMode]);

  function saveActivePlan(
    nextInputs: PensionInputs,
    drawdown: ScenarioDrawdownPreferences,
  ) {
    updateScenarioPlan(activeScenario.id, nextInputs, drawdown);
    setIsEditingPlan(false);
  }

  return (
    <main className="planner-page drawdown-dashboard-page drawdown-workspace-page drawdown-guided-page">
      <header className="planner-header dashboard-header drawdown-workspace-header">
        <div>
          <p className="planner-eyebrow">Retirement income</p>
          <h1>Drawdown Planner</h1>
          <p>
            Review whether the active plan can provide the retirement income you
            selected in My Plan.
          </p>
        </div>
      </header>

      <DrawdownPlanContext
        activePlanName={activeScenario.name}
        value={inputs}
        onEdit={() => setIsEditingPlan(true)}
      />

      <DrawdownChoiceSummary
        value={inputs}
        onEdit={() => setIsEditingPlan(true)}
      />

      <section className="drawdown-results-workspace" aria-labelledby="drawdown-results-title">
        <div className="drawdown-guided-section-heading drawdown-outcome-heading">
          <div>
            <p className="panel-eyebrow">Retirement outcome</p>
            <h2 id="drawdown-results-title">Review the outcome</h2>
            <p>Move between the views below to explore the complete projection.</p>
          </div>
          <CompactMoneyDisplaySelector
            value={displayMode}
            onChange={setDisplayMode}
          />
        </div>

        <div className="drawdown-outcome-toolbar">
          <DrawdownWorkspaceNavigation
            value={activeSection}
            onChange={setActiveSection}
          />
          <div className="money-display-status" role="status">
            {displayMode === "today" ? (
              <PoundSterling size={16} aria-hidden="true" />
            ) : (
              <TrendingUp size={16} aria-hidden="true" />
            )}
            <span>
              {displayMode === "today"
                ? "Today’s purchasing power"
                : "Projected future pounds"}
            </span>
          </div>
        </div>

        <section className="drawdown-workspace-content" aria-live="polite">
          {result ? (
            <>
              <DrawdownSummaryRibbon
                inputs={inputs}
                result={result}
                displayMode={displayMode}
              />

              {activeSection === "overview" && (
                <div className="drawdown-workspace-section" id="drawdown-overview-section" role="tabpanel" aria-labelledby="drawdown-tab-overview" tabIndex={0}>
                  <SectionHeading eyebrow="Retirement outlook" title="Can this plan support your retirement?" description="Review sustainability first, followed by the important milestones and risks across the plan." />
                  <DrawdownSustainabilityDashboard inputs={inputs} result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                  <DrawdownRetirementTimeline inputs={inputs} result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                  <DrawdownInsights result={result} />
                </div>
              )}

              {activeSection === "income" && (
                <div className="drawdown-workspace-section" id="drawdown-income-section" role="tabpanel" aria-labelledby="drawdown-tab-income" tabIndex={0}>
                  <SectionHeading eyebrow="Income and tax" title="How does retirement income change over time?" description="Review pension withdrawals, State Pension, tax and any modelled income gaps." />
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownIncomeChart years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    </div>
                  </section>
                  <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}

              {activeSection === "balance" && (
                <div className="drawdown-workspace-section" id="drawdown-balance-section" role="tabpanel" aria-labelledby="drawdown-tab-balance" tabIndex={0}>
                  <SectionHeading eyebrow="Pension balance" title="How does the pension change through retirement?" description="See the effect of withdrawals, investment growth, fees and any eventual depletion." />
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownBalanceChart years={result.years} depletionAge={result.depletionAge} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "details" && (
                <div className="drawdown-workspace-section" id="drawdown-details-section" role="tabpanel" aria-labelledby="drawdown-tab-details" tabIndex={0}>
                  <SectionHeading eyebrow="Year-by-year details" title="Inspect the full drawdown projection" description="Trace income, tax, growth, fees and closing balances for every retirement year." />
                  <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}

              {activeSection === "assumptions" && (
                <div className="drawdown-workspace-section" id="drawdown-assumptions-section" role="tabpanel" aria-labelledby="drawdown-tab-assumptions" tabIndex={0}>
                  <SectionHeading eyebrow="Calculation basis" title="Review the assumptions behind the projection" description="Understand the methodology, money basis and plan values used by the deterministic model." />
                  <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />
                </div>
              )}
            </>
          ) : (
            <section className="panel retirement-dashboard-empty-state" aria-live="polite">
              <h2>Review the retirement-income settings</h2>
              <p>Edit the active plan to correct the saved drawdown choices.</p>
            </section>
          )}
        </section>
      </section>

      {isEditingPlan && (
        <ScenarioEditModal
          scenario={activeScenario}
          onClose={() => setIsEditingPlan(false)}
          onSave={saveActivePlan}
        />
      )}
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="drawdown-section-heading">
      <div>
        <p className="panel-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

interface MoneyDisplaySelectorProps {
  value: MoneyDisplayMode;
  onChange: (value: MoneyDisplayMode) => void;
}

function CompactMoneyDisplaySelector({
  value,
  onChange,
}: MoneyDisplaySelectorProps) {
  return (
    <div className="money-display-compact">
      <div className="money-display-compact-heading">
        <span>Display values as</span>
        <details className="money-display-tooltip">
          <summary aria-label="Explain today’s money and future money">
            <Info size={16} aria-hidden="true" />
          </summary>
          <div className="money-display-tooltip-panel">
            <strong>Today&apos;s money</strong>
            <p>Removes inflation so figures use today&apos;s purchasing power.</p>
            <strong>Future money</strong>
            <p>Shows the projected pound amount in each future year.</p>
          </div>
        </details>
      </div>
      <div className="money-display-compact-options" role="group" aria-label="Money display basis">
        <button
          type="button"
          aria-pressed={value === "today"}
          className={value === "today" ? "is-active" : undefined}
          onClick={() => onChange("today")}
        >
          <PoundSterling size={15} aria-hidden="true" />
          Today’s money
        </button>
        <button
          type="button"
          aria-pressed={value === "nominal"}
          className={value === "nominal" ? "is-active" : undefined}
          onClick={() => onChange("nominal")}
        >
          <TrendingUp size={15} aria-hidden="true" />
          Future money
        </button>
      </div>
    </div>
  );
}
