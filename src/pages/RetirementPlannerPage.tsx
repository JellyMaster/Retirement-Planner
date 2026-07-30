import { useMemo, useState } from "react";

import { RetirementComparisonDashboard } from "../components/comparison/RetirementComparisonDashboard";
import { PensionInputsForm } from "../components/inputs/PensionInputsForm";
import { ContributionGrowthChart } from "../components/projection/ContributionGrowthChart";
import { PensionBalanceChart } from "../components/projection/PensionBalanceChart";
import { ProjectionTable } from "../components/projection/ProjectionTable";
import { RetirementInsights } from "../components/retirement/RetirementInsights";
import { ProjectionAssumptions } from "../components/summary/ProjectionAssumptions";
import { ProjectionMilestones } from "../components/summary/ProjectionMilestones";
import { ProjectionSummary } from "../components/summary/ProjectionSummary";
import { defaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import "../styles/retirement-dashboard.css";

type ChartView = "balance" | "contributions";

export function RetirementPlannerPage() {
  const [inputs, setInputs] = useState<PensionInputs>(() => ({ ...defaultPensionInputs }));
  const [comparisonInputs, setComparisonInputs] = useState<PensionInputs>(() => ({ ...defaultPensionInputs }));
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("balance");

  const currentScenario = usePensionProjection(inputs);
  const comparisonScenario = usePensionProjection(comparisonInputs);

  const assumptions = useMemo(
    () => [
      { label: "Current age", value: String(inputs.currentAge) },
      { label: "Retirement age", value: String(inputs.retirementAge) },
      { label: "Starting pension", value: formatCurrency(inputs.currentPot) },
      {
        label: "Monthly contribution",
        value: formatCurrency(
          inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution,
        ),
      },
      { label: "Annual return", value: formatPercentage(inputs.annualReturn) },
      { label: "Inflation", value: formatPercentage(inputs.inflation) },
      { label: "Annual fund fee", value: formatPercentage(inputs.annualFee) },
      {
        label: "Contribution increase",
        value: formatPercentage(inputs.annualContributionIncrease),
      },
    ],
    [inputs],
  );


  function resetInputs() {
    setInputs({ ...defaultPensionInputs });
  }

  function resetComparisonInputs() {
    setComparisonInputs({ ...defaultPensionInputs });
  }

  function enableComparison() {
    setComparisonInputs({ ...inputs });
    setComparisonEnabled(true);
  }

  return (
    <main className="planner-page retirement-dashboard-page">
      <header className="planner-header retirement-dashboard-header">
        <div>
          <p className="planner-eyebrow">Retirement planning</p>
          <h1>Retirement Planner</h1>
          <p>Adjust your assumptions and see the projected outcome without losing sight of the key results.</p>
        </div>

        <button
          type="button"
          className={
            comparisonEnabled
              ? "comparison-toggle-button comparison-toggle-button-active"
              : "comparison-toggle-button"
          }
          onClick={() => (comparisonEnabled ? setComparisonEnabled(false) : enableComparison())}
        >
          {comparisonEnabled ? "Stop comparing" : "Compare scenario"}
        </button>
      </header>

      {comparisonEnabled ? (
        <ComparisonLayout
          inputs={inputs}
          comparisonInputs={comparisonInputs}
          currentScenario={currentScenario}
          comparisonScenario={comparisonScenario}
          setInputs={setInputs}
          setComparisonInputs={setComparisonInputs}
          resetInputs={resetInputs}
          resetComparisonInputs={resetComparisonInputs}
        />
      ) : (
        <div className="retirement-dashboard-shell">
          <aside className="retirement-dashboard-sidebar">
            <PensionInputsForm
              idPrefix="current"
              value={inputs}
              errors={currentScenario.errors}
              onChange={setInputs}
              onReset={resetInputs}
            />
          </aside>

          <div className="retirement-dashboard-content">
            {currentScenario.hasErrors ? (
              <section className="panel" role="alert">
                <div className="panel-heading">
                  <h2>Your projection</h2>
                  <p>Correct the highlighted fields to calculate your results.</p>
                </div>
              </section>
            ) : (
              <>
                <div className="retirement-summary-strip">
                  <ProjectionSummary result={currentScenario.projection} />
                </div>

                <div className="retirement-dashboard-main-grid">
                  <section className="retirement-chart-workspace">
                    <div className="retirement-chart-tabs" role="tablist" aria-label="Projection chart">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={chartView === "balance"}
                        className={chartView === "balance" ? "active" : undefined}
                        onClick={() => setChartView("balance")}
                      >
                        Pension balance
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={chartView === "contributions"}
                        className={chartView === "contributions" ? "active" : undefined}
                        onClick={() => setChartView("contributions")}
                      >
                        Contributions & growth
                      </button>
                    </div>

                    {chartView === "balance" ? (
                      <PensionBalanceChart years={currentScenario.projection.years} />
                    ) : (
                      <ContributionGrowthChart years={currentScenario.projection.years} />
                    )}
                  </section>

                  <RetirementInsights inputs={inputs} result={currentScenario.projection} />
                </div>

                <details className="retirement-dashboard-details">
                  <summary>Projection milestones</summary>
                  <ProjectionMilestones years={currentScenario.projection.years} />
                </details>

                <details className="retirement-dashboard-details">
                  <summary>Projection assumptions</summary>
                  <ProjectionAssumptions assumptions={assumptions} />
                </details>

                <details className="retirement-dashboard-details">
                  <summary>Year-by-year projection</summary>
                  <ProjectionTable years={currentScenario.projection.years} />
                </details>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

interface ComparisonLayoutProps {
  inputs: PensionInputs;
  comparisonInputs: PensionInputs;
  currentScenario: ReturnType<typeof usePensionProjection>;
  comparisonScenario: ReturnType<typeof usePensionProjection>;
  setInputs: (value: PensionInputs) => void;
  setComparisonInputs: (value: PensionInputs) => void;
  resetInputs: () => void;
  resetComparisonInputs: () => void;
}

function ComparisonLayout({
  inputs,
  comparisonInputs,
  currentScenario,
  comparisonScenario,
  setInputs,
  setComparisonInputs,
  resetInputs,
  resetComparisonInputs,
}: ComparisonLayoutProps) {
  function swapPlans() {
    const previousBaseline = { ...inputs };
    setInputs({ ...comparisonInputs });
    setComparisonInputs(previousBaseline);
  }

  return (
    <RetirementComparisonDashboard
      baselineInputs={inputs}
      alternativeInputs={comparisonInputs}
      baselineScenario={currentScenario}
      alternativeScenario={comparisonScenario}
      onBaselineChange={setInputs}
      onAlternativeChange={setComparisonInputs}
      onResetBaseline={resetInputs}
      onResetAlternative={resetComparisonInputs}
      onDuplicateBaseline={() => setComparisonInputs({ ...inputs })}
      onSwap={swapPlans}
    />
  );
}
