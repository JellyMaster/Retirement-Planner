import { useState } from "react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInputsForm } from "../components/drawdown/DrawdownInputsForm";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { useDrawdownProjection } from "../hooks/useDrawdownProjection";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

type ChartView = "balance" | "income";

export function DrawdownPlannerPage() {
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>("nominal");
  const [chartView, setChartView] = useState<ChartView>("balance");
  const { inputs, validation, result, updateInput, resetInputs } = useDrawdownProjection();

  return (
    <main className="planner-page drawdown-dashboard-page">
      <header className="planner-header dashboard-header">
        <div>
          <p className="planner-eyebrow">Retirement income</p>
          <h1>Drawdown Planner</h1>
          <p>Model sustainable retirement income, tax and pension longevity.</p>
        </div>
        <div className="dashboard-display-control" role="group" aria-label="Money display basis">
          <button type="button" className={`income-target-option${displayMode === "nominal" ? " income-target-option-active" : ""}`} aria-pressed={displayMode === "nominal"} onClick={() => setDisplayMode("nominal")}>Future money</button>
          <button type="button" className={`income-target-option${displayMode === "today" ? " income-target-option-active" : ""}`} aria-pressed={displayMode === "today"} onClick={() => setDisplayMode("today")}>Today&apos;s money</button>
        </div>
      </header>

      <div className="drawdown-dashboard-shell">
        <aside className="drawdown-dashboard-sidebar">
          <DrawdownInputsForm value={inputs} errors={validation.errors} onChange={updateInput} onReset={resetInputs} />
        </aside>

        <div className="drawdown-dashboard-content">
          {result ? (
            <>
              <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />

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
