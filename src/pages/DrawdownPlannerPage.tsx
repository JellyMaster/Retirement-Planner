import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChart } from "../components/drawdown/DrawdownBalanceChart";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownInputsForm } from "../components/drawdown/DrawdownInputsForm";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { useDrawdownProjection } from "../hooks/useDrawdownProjection";

export function DrawdownPlannerPage() {
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

      <div className="planner-grid">
        <DrawdownInputsForm
          value={inputs}
          errors={validation.errors}
          onChange={updateInput}
          onReset={resetInputs}
        />

        {result ? (
          <DrawdownSummary result={result} />
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

      <DrawdownAssumptionsPanel inputs={inputs} />

      {result && (
        <>
          <div className="drawdown-charts-grid">
            <DrawdownBalanceChart
              years={result.years}
              depletionAge={result.depletionAge}
            />
            <DrawdownIncomeChart years={result.years} />
          </div>

          <DrawdownProjectionTable years={result.years} />
        </>
      )}
    </main>
  );
}
