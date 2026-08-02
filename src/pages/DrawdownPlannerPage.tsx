import { useEffect, useMemo, useState } from "react";
import { Check, Info, PoundSterling, TrendingUp } from "lucide-react";

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
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(
    getInitialMoneyDisplayMode,
  );
  const [activeSection, setActiveSection] =
    useState<DrawdownWorkspaceSection>("overview");

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

        <MoneyDisplaySelector value={displayMode} onChange={setDisplayMode} />
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
        <div className="drawdown-guided-section-heading">
          <div>
            <p className="panel-eyebrow">Retirement outcome</p>
            <h2 id="drawdown-results-title">Review the outcome</h2>
          </div>
          <p>Start with the overview, then explore income, tax and balance detail.</p>
        </div>

        <div className="money-display-status" role="status">
          {displayMode === "today" ? (
            <PoundSterling size={16} aria-hidden="true" />
          ) : (
            <TrendingUp size={16} aria-hidden="true" />
          )}
          <span>
            {displayMode === "today"
              ? "Figures shown in today’s purchasing power"
              : "Figures shown in projected future pounds"}
          </span>
        </div>

        <DrawdownWorkspaceNavigation
          value={activeSection}
          onChange={setActiveSection}
        />

        <section className="drawdown-workspace-content" aria-live="polite">
          {result ? (
            <>
              <DrawdownSummaryRibbon
                inputs={inputs}
                result={result}
                displayMode={displayMode}
              />

              {activeSection === "overview" && (
                <div
                  className="drawdown-workspace-section"
                  id="drawdown-overview-section"
                  role="tabpanel"
                  aria-labelledby="drawdown-tab-overview"
                  tabIndex={0}
                >
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Retirement outlook</p>
                      <h2>Can this plan support your retirement?</h2>
                    </div>
                    <p>
                      Review sustainability first, followed by the important
                      milestones and risks across the plan.
                    </p>
                  </div>
                  <DrawdownSustainabilityDashboard
                    inputs={inputs}
                    result={result}
                    inflationRate={inputs.inflationRate}
                    displayMode={displayMode}
                  />
                  <DrawdownRetirementTimeline
                    inputs={inputs}
                    result={result}
                    inflationRate={inputs.inflationRate}
                    displayMode={displayMode}
                  />
                  <DrawdownInsights result={result} />
                </div>
              )}

              {activeSection === "income" && (
                <div
                  className="drawdown-workspace-section"
                  id="drawdown-income-section"
                  role="tabpanel"
                  aria-labelledby="drawdown-tab-income"
                  tabIndex={0}
                >
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Income and tax</p>
                      <h2>How does retirement income change over time?</h2>
                    </div>
                    <p>
                      Review pension withdrawals, State Pension, tax and any
                      modelled income gaps.
                    </p>
                  </div>
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownIncomeChart
                        years={result.years}
                        inflationRate={inputs.inflationRate}
                        displayMode={displayMode}
                      />
                    </div>
                  </section>
                  <DrawdownSummary
                    result={result}
                    inflationRate={inputs.inflationRate}
                    displayMode={displayMode}
                  />
                </div>
              )}

              {activeSection === "balance" && (
                <div
                  className="drawdown-workspace-section"
                  id="drawdown-balance-section"
                  role="tabpanel"
                  aria-labelledby="drawdown-tab-balance"
                  tabIndex={0}
                >
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Pension balance</p>
                      <h2>How does the pension change through retirement?</h2>
                    </div>
                    <p>
                      See the effect of withdrawals, investment growth, fees and
                      any eventual depletion.
                    </p>
                  </div>
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownBalanceChart
                        years={result.years}
                        depletionAge={result.depletionAge}
                        inflationRate={inputs.inflationRate}
                        displayMode={displayMode}
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "details" && (
                <div
                  className="drawdown-workspace-section"
                  id="drawdown-details-section"
                  role="tabpanel"
                  aria-labelledby="drawdown-tab-details"
                  tabIndex={0}
                >
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Year-by-year details</p>
                      <h2>Inspect the full drawdown projection</h2>
                    </div>
                    <p>
                      Trace income, tax, growth, fees and closing balances for
                      every retirement year.
                    </p>
                  </div>
                  <DrawdownProjectionTable
                    years={result.years}
                    inflationRate={inputs.inflationRate}
                    displayMode={displayMode}
                  />
                </div>
              )}

              {activeSection === "assumptions" && (
                <div
                  className="drawdown-workspace-section"
                  id="drawdown-assumptions-section"
                  role="tabpanel"
                  aria-labelledby="drawdown-tab-assumptions"
                  tabIndex={0}
                >
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Calculation basis</p>
                      <h2>Review the assumptions behind the projection</h2>
                    </div>
                    <p>
                      Understand the methodology, money basis and plan values
                      used by the deterministic model.
                    </p>
                  </div>
                  <DrawdownAssumptionsPanel
                    inputs={inputs}
                    displayMode={displayMode}
                  />
                </div>
              )}
            </>
          ) : (
            <section
              className="panel retirement-dashboard-empty-state"
              aria-live="polite"
            >
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

interface MoneyDisplaySelectorProps {
  value: MoneyDisplayMode;
  onChange: (value: MoneyDisplayMode) => void;
}

function MoneyDisplaySelector({ value, onChange }: MoneyDisplaySelectorProps) {
  return (
    <section className="money-display-selector" aria-labelledby="money-display-title">
      <div className="money-display-heading">
        <div>
          <p className="money-display-kicker">Display values as</p>
          <h2 id="money-display-title">Choose your money view</h2>
        </div>
        <details className="money-display-tooltip">
          <summary aria-label="Explain today’s money and future money">
            <Info size={17} aria-hidden="true" />
          </summary>
          <div className="money-display-tooltip-panel">
            <strong>Today&apos;s Money (recommended)</strong>
            <p>
              Removes inflation so every figure is shown in today&apos;s purchasing
              power.
            </p>
            <strong>Future Money</strong>
            <p>Shows projected pound amounts for each future year.</p>
            <small>The projection does not change—only its display basis.</small>
          </div>
        </details>
      </div>

      <div className="money-display-options" role="group" aria-label="Money display basis">
        <button
          type="button"
          className={`money-display-card${
            value === "today" ? " money-display-card-active" : ""
          }`}
          aria-pressed={value === "today"}
          onClick={() => onChange("today")}
        >
          <span className="money-display-card-topline">
            <span className="money-display-icon money-display-icon-today">
              <PoundSterling size={20} aria-hidden="true" />
            </span>
            <span className="money-display-recommended">Recommended</span>
          </span>
          <span className="money-display-card-title">Today&apos;s Money</span>
          <span className="money-display-card-copy">
            Buying power in today&apos;s pounds.
          </span>
          {value === "today" && (
            <span className="money-display-selected">
              <Check size={14} aria-hidden="true" /> Selected
            </span>
          )}
        </button>

        <button
          type="button"
          className={`money-display-card${
            value === "nominal" ? " money-display-card-active" : ""
          }`}
          aria-pressed={value === "nominal"}
          onClick={() => onChange("nominal")}
        >
          <span className="money-display-card-topline">
            <span className="money-display-icon money-display-icon-future">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
          </span>
          <span className="money-display-card-title">Future Money</span>
          <span className="money-display-card-copy">
            Projected pound amounts in each year.
          </span>
          {value === "nominal" && (
            <span className="money-display-selected">
              <Check size={14} aria-hidden="true" /> Selected
            </span>
          )}
        </button>
      </div>
    </section>
  );
}
