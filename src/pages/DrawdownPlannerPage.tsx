import { useEffect, useMemo, useState } from "react";
import { Check, Info, PoundSterling, TrendingUp } from "lucide-react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInputsForm } from "../components/drawdown/DrawdownInputsForm";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownRetirementTimeline } from "../components/drawdown/DrawdownRetirementTimeline";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { DrawdownSummaryRibbon } from "../components/drawdown/DrawdownSummaryRibbon";
import { DrawdownSustainabilityDashboard } from "../components/drawdown/DrawdownSustainabilityDashboard";
import {
  DrawdownWorkspaceNavigation,
  type DrawdownWorkspaceSection,
} from "../components/drawdown/DrawdownWorkspaceNavigation";
import { useScenarios } from "../components/scenarios";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import { useDrawdownProjection } from "../hooks/useDrawdownProjection";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

const MONEY_DISPLAY_STORAGE_KEY = "retirement-planner:drawdown-money-display";

function getInitialMoneyDisplayMode(): MoneyDisplayMode {
  if (typeof window === "undefined") {
    return "today";
  }

  const savedMode = window.localStorage.getItem(MONEY_DISPLAY_STORAGE_KEY);
  return savedMode === "nominal" || savedMode === "today" ? savedMode : "today";
}

export function DrawdownPlannerPage() {
  const { activeScenario } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const pensionProjection = usePensionProjection(activeScenario.inputs);
  const initialDrawdownInputs = useMemo(
    () =>
      createDrawdownInputsFromPlan({
        pensionInputs: activeScenario.inputs,
        projection: pensionProjection.projection,
        retirementGoals,
      }),
    [activeScenario.inputs, pensionProjection.projection, retirementGoals],
  );
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(getInitialMoneyDisplayMode);
  const [activeSection, setActiveSection] = useState<DrawdownWorkspaceSection>("overview");
  const { inputs, validation, result, updateInput, resetInputs } =
    useDrawdownProjection(initialDrawdownInputs);

  useEffect(() => {
    window.localStorage.setItem(MONEY_DISPLAY_STORAGE_KEY, displayMode);
  }, [displayMode]);

  return (
    <main className="planner-page drawdown-dashboard-page drawdown-workspace-page">
      <header className="planner-header dashboard-header drawdown-workspace-header">
        <div>
          <p className="planner-eyebrow">Retirement income</p>
          <h1>Drawdown Planner</h1>
          <p>Understand how long your pension may last, how much income it can support and where risks could emerge.</p>
          <p className="drawdown-active-plan-source">
            Starting assumptions are based on <strong>{activeScenario.name}</strong> and your saved retirement goals.
          </p>
        </div>

        <section className="money-display-selector" aria-labelledby="money-display-title">
          <div className="money-display-heading">
            <div>
              <p className="money-display-kicker">Display values as</p>
              <h2 id="money-display-title">Choose your money view</h2>
            </div>
            <details className="money-display-tooltip">
              <summary aria-label="Explain today’s money and future money"><Info size={17} aria-hidden="true" /></summary>
              <div className="money-display-tooltip-panel">
                <strong>Today&apos;s Money (recommended)</strong>
                <p>Removes the effect of inflation so every figure is shown in today&apos;s purchasing power.</p>
                <strong>Future Money</strong>
                <p>Shows the projected pound amounts for each future year, including inflation.</p>
                <small>The projection does not change—only the way results are displayed.</small>
              </div>
            </details>
          </div>

          <div className="money-display-options" role="group" aria-label="Money display basis">
            <button
              type="button"
              className={`money-display-card${displayMode === "today" ? " money-display-card-active" : ""}`}
              aria-pressed={displayMode === "today"}
              onClick={() => setDisplayMode("today")}
            >
              <span className="money-display-card-topline">
                <span className="money-display-icon money-display-icon-today"><PoundSterling size={20} aria-hidden="true" /></span>
                <span className="money-display-recommended">Recommended</span>
              </span>
              <span className="money-display-card-title">Today&apos;s Money</span>
              <span className="money-display-card-copy">Buying power in today&apos;s pounds.</span>
              {displayMode === "today" && <span className="money-display-selected"><Check size={14} aria-hidden="true" /> Selected</span>}
            </button>

            <button
              type="button"
              className={`money-display-card${displayMode === "nominal" ? " money-display-card-active" : ""}`}
              aria-pressed={displayMode === "nominal"}
              onClick={() => setDisplayMode("nominal")}
            >
              <span className="money-display-card-topline">
                <span className="money-display-icon money-display-icon-future"><TrendingUp size={20} aria-hidden="true" /></span>
              </span>
              <span className="money-display-card-title">Future Money</span>
              <span className="money-display-card-copy">Projected pound amounts in each year.</span>
              {displayMode === "nominal" && <span className="money-display-selected"><Check size={14} aria-hidden="true" /> Selected</span>}
            </button>
          </div>
        </section>
      </header>

      <div className="drawdown-workspace-shell">
        <aside className="drawdown-workspace-sidebar">
          <div className="drawdown-setup-card">
            <div className="drawdown-setup-heading">
              <p className="panel-eyebrow">Your retirement plan</p>
              <h2>Income setup</h2>
              <p>Adjust the assumptions and the workspace will update immediately.</p>
            </div>
            <DrawdownInputsForm value={inputs} errors={validation.errors} onChange={updateInput} onReset={resetInputs} />
          </div>

          <DrawdownWorkspaceNavigation value={activeSection} onChange={setActiveSection} />
        </aside>

        <section className="drawdown-workspace-content" aria-live="polite">
          <div className="money-display-status" role="status">
            {displayMode === "today" ? <PoundSterling size={16} aria-hidden="true" /> : <TrendingUp size={16} aria-hidden="true" />}
            <span>{displayMode === "today" ? "Figures shown in today’s purchasing power" : "Figures shown in projected future pounds"}</span>
          </div>

          {result ? (
            <>
              <DrawdownSummaryRibbon inputs={inputs} result={result} displayMode={displayMode} />

              {activeSection === "overview" && (
                <div className="drawdown-workspace-section" id="drawdown-overview-section">
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Retirement outlook</p>
                      <h2>Can this plan support your retirement?</h2>
                    </div>
                    <p>Start with sustainability, then review the important events and risks across the plan.</p>
                  </div>
                  <DrawdownSustainabilityDashboard inputs={inputs} result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                  <DrawdownRetirementTimeline inputs={inputs} result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                  <DrawdownInsights result={result} />
                </div>
              )}

              {activeSection === "income" && (
                <div className="drawdown-workspace-section" id="drawdown-income-section">
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Income and tax</p>
                      <h2>How does retirement income change over time?</h2>
                    </div>
                    <p>Review pension withdrawals, State Pension, tax and any modelled income gaps.</p>
                  </div>
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownIncomeChart years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    </div>
                  </section>
                  <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}

              {activeSection === "balance" && (
                <div className="drawdown-workspace-section" id="drawdown-balance-section">
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Pension balance</p>
                      <h2>How does the pension change through retirement?</h2>
                    </div>
                    <p>See the effect of withdrawals, investment growth, fees and any eventual depletion.</p>
                  </div>
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownBalanceChart years={result.years} depletionAge={result.depletionAge} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "details" && (
                <div className="drawdown-workspace-section" id="drawdown-details-section">
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Year-by-year details</p>
                      <h2>Inspect the full drawdown projection</h2>
                    </div>
                    <p>Use the detailed table to trace income, tax, growth, fees and closing balances.</p>
                  </div>
                  <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}

              {activeSection === "assumptions" && (
                <div className="drawdown-workspace-section" id="drawdown-assumptions-section">
                  <div className="drawdown-section-heading">
                    <div>
                      <p className="panel-eyebrow">Calculation basis</p>
                      <h2>Review the assumptions behind the projection</h2>
                    </div>
                    <p>Understand the methodology, money basis and inputs used by the deterministic model.</p>
                  </div>
                  <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />
                </div>
              )}
            </>
          ) : (
            <section className="panel retirement-dashboard-empty-state" aria-live="polite">
              <h2>Complete the highlighted assumptions</h2>
              <p>Correct the input errors to calculate your drawdown projection.</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
