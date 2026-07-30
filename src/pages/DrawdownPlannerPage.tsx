import { useState } from "react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInputsForm } from "../components/drawdown/DrawdownInputsForm";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { useDrawdownProjection } from "../hooks/useDrawdownProjection";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

export function DrawdownPlannerPage() {
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>("nominal");
  const { inputs, validation, result, updateInput, resetInputs } =
    useDrawdownProjection();

  return (
    <main className="planner-page">
      <header className="planner-header">
        <p className="planner-eyebrow">Retirement income</p>
        <h1>Drawdown Planner</h1>
        <p>
          Estimate how long your pension could support your desired retirement
          income.
        </p>
      </header>

      <section className="panel money-display-panel" aria-labelledby="money-display-heading">
        <div>
          <p className="panel-eyebrow">Presentation only</p>
          <h2 id="money-display-heading">Display values as</h2>
          <p>Switch how projected amounts are presented without changing the underlying tax or drawdown calculation.</p>
        </div>
        <div className="income-target-toggle" role="group" aria-label="Money display basis">
          <button
            type="button"
            className={`income-target-option${displayMode === "nominal" ? " income-target-option-active" : ""}`}
            aria-pressed={displayMode === "nominal"}
            onClick={() => setDisplayMode("nominal")}
          >
            Future money
          </button>
          <button
            type="button"
            className={`income-target-option${displayMode === "today" ? " income-target-option-active" : ""}`}
            aria-pressed={displayMode === "today"}
            onClick={() => setDisplayMode("today")}
          >
            Today&apos;s money
          </button>
        </div>
      </section>

      <div className="planner-grid">
        <DrawdownInputsForm
          value={inputs}
          errors={validation.errors}
          onChange={updateInput}
          onReset={resetInputs}
        />

        {result ? (
          <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
        ) : (
          <section className="panel" aria-live="polite">
            <div className="panel-heading">
              <h2>Drawdown outcome</h2>
              <p>
                Correct the highlighted assumptions to calculate the
                projection.
              </p>
            </div>
          </section>
        )}
      </div>

      <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />

      {result && (
        <>
          <div className="drawdown-charts-grid">
            <DrawdownBalanceChart
              years={result.years}
              depletionAge={result.depletionAge}
              inflationRate={inputs.inflationRate}
              displayMode={displayMode}
            />
            <DrawdownIncomeChart years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
          </div>

          <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
        </>
      )}
    </main>
  );
}
