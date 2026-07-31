import { useEffect, useState } from "react";
import { Check, Info, PoundSterling, TrendingUp } from "lucide-react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInputsForm } from "../components/drawdown/DrawdownInputsForm";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { DrawdownRetirementTimeline } from "../components/drawdown/DrawdownRetirementTimeline";
import { DrawdownSustainabilityDashboard } from "../components/drawdown/DrawdownSustainabilityDashboard";
import { useDrawdownProjection } from "../hooks/useDrawdownProjection";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

type ChartView = "balance" | "income";

const MONEY_DISPLAY_STORAGE_KEY = "retirement-planner:drawdown-money-display";

function getInitialMoneyDisplayMode(): MoneyDisplayMode {
  if (typeof window === "undefined") {
    return "today";
  }

  const savedMode = window.localStorage.getItem(MONEY_DISPLAY_STORAGE_KEY);
  return savedMode === "nominal" || savedMode === "today" ? savedMode : "today";
}

export function DrawdownPlannerPage() {
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(getInitialMoneyDisplayMode);
  const [chartView, setChartView] = useState<ChartView>("balance");
  const { inputs, validation, result, updateInput, resetInputs } = useDrawdownProjection();

  useEffect(() => {
    window.localStorage.setItem(MONEY_DISPLAY_STORAGE_KEY, displayMode);
  }, [displayMode]);

  return (
    <main className="planner-page drawdown-dashboard-page">
      <header className="planner-header dashboard-header">
        <div>
          <p className="planner-eyebrow">Retirement income</p>
          <h1>Drawdown Planner</h1>
          <p>Model sustainable retirement income, tax and pension longevity.</p>
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
                <p>Removes the effect of inflation so every figure is shown in today&apos;s purchasing power. This is usually easiest for retirement planning.</p>
                <strong>Future Money</strong>
                <p>Shows the actual pound amounts projected for each future year, including the effect of inflation.</p>
                <small>The underlying projection does not change—only how the results are displayed.</small>
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
              <span className="money-display-card-copy">Buying power in today&apos;s pounds, with inflation removed.</span>
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
              <span className="money-display-card-copy">Actual pound amounts projected in each future year.</span>
              {displayMode === "nominal" && <span className="money-display-selected"><Check size={14} aria-hidden="true" /> Selected</span>}
            </button>
          </div>
          <p className="money-display-guidance"><strong>Planning tip:</strong> Today&apos;s Money makes it easier to compare retirement income with what the same amount buys now.</p>
        </section>
      </header>

      <div className="drawdown-dashboard-shell">
        <aside className="drawdown-dashboard-sidebar">
          <DrawdownInputsForm value={inputs} errors={validation.errors} onChange={updateInput} onReset={resetInputs} />
        </aside>

        <div className="drawdown-dashboard-content">
          <div className="money-display-status" role="status">
            {displayMode === "today" ? <PoundSterling size={16} aria-hidden="true" /> : <TrendingUp size={16} aria-hidden="true" />}
            <span>{displayMode === "today" ? "All figures shown in today’s purchasing power" : "All figures shown in projected future pounds"}</span>
          </div>
          {result ? (
            <>
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

              <details className="panel dashboard-details drawdown-outcome-details">
                <summary>Detailed drawdown outcome <span>View lifetime totals and tax results</span></summary>
                <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
              </details>

              <div className="dashboard-main-grid">
                <section className="panel dashboard-chart-panel">
                  <div className="dashboard-chart-toolbar">
                    <div>
                      <p className="panel-eyebrow">Projection</p>
                      <h2>{chartView === "balance" ? "Pension balance" : "Retirement income"}</h2>
                    </div>
                    <div className="chart-tabs" role="tablist" aria-label="Projection chart">
                      <button type="button" role="tab" aria-selected={chartView === "balance"} className={chartView === "balance" ? "chart-tab chart-tab-active" : "chart-tab"} onClick={() => setChartView("balance")}>Balance</button>
                      <button type="button" role="tab" aria-selected={chartView === "income"} className={chartView === "income" ? "chart-tab chart-tab-active" : "chart-tab"} onClick={() => setChartView("income")}>Income & tax</button>
                    </div>
                  </div>
                  <div className="dashboard-chart-stage">
                    {chartView === "balance" ? (
                      <DrawdownBalanceChart years={result.years} depletionAge={result.depletionAge} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    ) : (
                      <DrawdownIncomeChart years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                    )}
                  </div>
                </section>
                <DrawdownInsights result={result} />
              </div>

              <details className="panel dashboard-details">
                <summary>Projection table <span>View every drawdown year</span></summary>
                <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
              </details>

              <details className="panel dashboard-details">
                <summary>Calculation assumptions <span>Review methodology and inputs</span></summary>
                <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />
              </details>
            </>
          ) : (
            <section className="panel" aria-live="polite">
              <div className="panel-heading"><h2>Drawdown outcome</h2><p>Correct the highlighted assumptions to calculate the projection.</p></div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
