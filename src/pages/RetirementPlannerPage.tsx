import { useMemo, useState } from "react";

import { RetirementComparisonDashboard } from "../components/comparison/RetirementComparisonDashboard";
import { GuidedPensionInputsForm } from "../components/inputs/guided";
import { RetirementJourney } from "../components/journey";
import { MonteCarloConfidenceDashboard } from "../components/monte-carlo";
import { RetirementGoalsForm } from "../components/goals/RetirementGoalsForm";
import { RetirementHealthDashboard } from "../components/goals/RetirementHealthDashboard";
import { RetirementRecommendations } from "../components/goals/RetirementRecommendations";
import { RetirementWhatIfAnalysis } from "../components/goals/RetirementWhatIfAnalysis";
import { RetirementCoach, RetirementOverview, RetirementScoreBreakdown } from "../components/overview";
import { ContributionGrowthChart } from "../components/projection/ContributionGrowthChart";
import { PensionBalanceChart } from "../components/projection/PensionBalanceChart";
import { ProjectionTable } from "../components/projection/ProjectionTable";
import { RetirementInsights } from "../components/retirement/RetirementInsights";
import { ProjectionAssumptions } from "../components/summary/ProjectionAssumptions";
import { ProjectionMilestones } from "../components/summary/ProjectionMilestones";
import { ProjectionSummary } from "../components/summary/ProjectionSummary";
import { defaultPensionInputs } from "../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { RetirementGoals } from "../engine/models/RetirementGoals";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import "../styles/retirement-dashboard.css";
import "../styles/retirement-what-if.css";
import "../styles/custom-what-if-builder.css";
import "../styles/retirement-overview.css";
import "../styles/retirement-journey.css";
import "../styles/retirement-score-breakdown.css";
import "../styles/retirement-coach.css";
import "../styles/monte-carlo-confidence.css";
import "../styles/smart-retirement-recommendations.css";
import { FeeImpactDashboard } from "../components/fee-impact";

type ChartView = "balance" | "contributions";

export function RetirementPlannerPage() {
  const [inputs, setInputs] = useState<PensionInputs>(() => ({ ...defaultPensionInputs }));
  const [comparisonInputs, setComparisonInputs] = useState<PensionInputs>(() => ({ ...defaultPensionInputs }));
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [retirementGoals, setRetirementGoals] = useState<RetirementGoals>(() => ({ ...defaultRetirementGoals }));
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

  function applyRecommendationToComparison(recommendedInputs: PensionInputs) {
    setComparisonInputs({ ...recommendedInputs });
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
          retirementGoals={retirementGoals}
          onRetirementGoalsChange={setRetirementGoals}
        />
      ) : (
        <div className="retirement-planner-workspace">
          <section className="retirement-guided-input-region" aria-label="Build your retirement plan">
            <GuidedPensionInputsForm
              idPrefix="current"
              value={inputs}
              errors={currentScenario.errors}
              onChange={setInputs}
              onReset={resetInputs}
            />
          </section>

          <section className="retirement-goals-control-region" aria-label="Retirement goals">
            <RetirementGoalsForm
              value={retirementGoals}
              onChange={setRetirementGoals}
              compact
              collapsible
            />
          </section>

          <div className="retirement-dashboard-content" id="retirement-projection-results">
            {currentScenario.hasErrors ? (
              <section className="panel" role="alert">
                <div className="panel-heading">
                  <h2>Your projection</h2>
                  <p>Correct the highlighted fields to calculate your results.</p>
                </div>
              </section>
            ) : (
              <>
                <RetirementOverview
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                  onApplyToComparison={applyRecommendationToComparison}
                />

                <MonteCarloConfidenceDashboard
                  inputs={inputs}
                  goals={retirementGoals}
                />

                <RetirementJourney
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                />

                <RetirementScoreBreakdown
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                />

                <RetirementCoach
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                  onApplyToComparison={applyRecommendationToComparison}
                />

                <RetirementWhatIfAnalysis
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                  onApplyToComparison={applyRecommendationToComparison}
                />

                <RetirementHealthDashboard
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                />

                <RetirementRecommendations
                  inputs={inputs}
                  result={currentScenario.projection}
                  goals={retirementGoals}
                  onApplyToComparison={applyRecommendationToComparison}
                />

                <div className="retirement-summary-strip">
                  <ProjectionSummary result={currentScenario.projection} />
                </div>
{currentScenario.comparison?.feeImpact && (

    <FeeImpactDashboard
        feeImpact={
            currentScenario.comparison.feeImpact
        }
    />

)}


                <div className="retirement-dashboard-main-grid">
                  <section className="retirement-chart-workspace">
                    <div className="retirement-chart-tabs" role="tablist" aria-label="Projection chart">
                      <button
                        type="button"
                        role="tab"
                        id="projection-balance-tab"
                        aria-controls="projection-balance-panel"
                        aria-selected={chartView === "balance"}
                        tabIndex={chartView === "balance" ? 0 : -1}
                        className={chartView === "balance" ? "active" : undefined}
                        onClick={() => setChartView("balance")}
                      >
                        Pension balance
                      </button>
                      <button
                        type="button"
                        role="tab"
                        id="projection-contributions-tab"
                        aria-controls="projection-contributions-panel"
                        aria-selected={chartView === "contributions"}
                        tabIndex={chartView === "contributions" ? 0 : -1}
                        className={chartView === "contributions" ? "active" : undefined}
                        onClick={() => setChartView("contributions")}
                      >
                        Contributions & growth
                      </button>
                    </div>

                    {chartView === "balance" ? (
                      <div
                        id="projection-balance-panel"
                        role="tabpanel"
                        aria-labelledby="projection-balance-tab"
                        tabIndex={0}
                      >
                        <PensionBalanceChart years={currentScenario.projection.years} />
                      </div>
                    ) : (
                      <div
                        id="projection-contributions-panel"
                        role="tabpanel"
                        aria-labelledby="projection-contributions-tab"
                        tabIndex={0}
                      >
                        <ContributionGrowthChart years={currentScenario.projection.years} />
                      </div>
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
  retirementGoals: RetirementGoals;
  onRetirementGoalsChange: (value: RetirementGoals) => void;
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
  retirementGoals,
  onRetirementGoalsChange,
}: ComparisonLayoutProps) {

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
      retirementGoals={retirementGoals}
      onRetirementGoalsChange={onRetirementGoalsChange}
    />
  );
}
