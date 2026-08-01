import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ActionCentre } from "../components/action-centre";
import { RetirementComparisonDashboard } from "../components/comparison/RetirementComparisonDashboard";
import { FeeImpactDashboard } from "../components/fee-impact";
import { RetirementGoalsForm } from "../components/goals/RetirementGoalsForm";
import { RetirementHealthDashboard } from "../components/goals/RetirementHealthDashboard";
import { RetirementRecommendations } from "../components/goals/RetirementRecommendations";
import { RetirementWhatIfAnalysis } from "../components/goals/RetirementWhatIfAnalysis";
import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { GuidedPensionInputsForm } from "../components/inputs/guided";
import { RetirementJourney } from "../components/journey";
import { PlanPreviewBanner, usePlanPreview } from "../components/preview";
import { useScenarios } from "../components/scenarios";
import {
  MonteCarloConfidenceDashboard,
  MonteCarloConfidenceExplorer,
} from "../components/monte-carlo";
import {
  RetirementCoach,
  RetirementOverview,
  RetirementScoreBreakdown,
} from "../components/overview";
import { ContributionGrowthChart } from "../components/projection/ContributionGrowthChart";
import { PensionBalanceChart } from "../components/projection/PensionBalanceChart";
import { ProjectionTable } from "../components/projection/ProjectionTable";
import { RetirementInsights } from "../components/retirement/RetirementInsights";
import { ProjectionAssumptions } from "../components/summary/ProjectionAssumptions";
import { ProjectionMilestones } from "../components/summary/ProjectionMilestones";
import { ProjectionSummary } from "../components/summary/ProjectionSummary";
import { RetirementSustainabilityDashboard } from "../components/sustainability";
import { Card, CardHeader, StatusBadge } from "../components/ui";
import {
  isWorkspaceSectionId,
  RetirementWorkspace,
  WorkspaceSummaryRibbon,
  type WorkspaceSectionId,
} from "../components/workspace";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { RetirementGoals } from "../engine/models/RetirementGoals";
import {
  calculateMonteCarloTarget,
  MonteCarloEngine,
} from "../engine/monte-carlo";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import "../styles/retirement-dashboard.css";
import "../styles/retirement-what-if.css";
import "../styles/custom-what-if-builder.css";
import "../styles/retirement-overview.css";
import "../styles/retirement-journey.css";
import "../styles/retirement-score-breakdown.css";
import "../styles/retirement-coach.css";
import "../styles/monte-carlo-confidence.css";
import "../styles/monte-carlo-confidence-explorer.css";
import "../styles/smart-retirement-recommendations.css";
import "../styles/retirement-workspace.css";
import "../styles/retirement-sustainability.css";
import "../styles/action-centre.css";
import "../styles/plan-preview.css";
import "../styles/scenario-planner.css";

type ChartView = "balance" | "contributions";

const WORKSPACE_STORAGE_KEY = "retirement-planner-workspace-section";

function getInitialWorkspaceSection(): WorkspaceSectionId {
  if (typeof window === "undefined") return "overview";

  const hashSection = window.location.hash.replace(/^#/, "");
  if (isWorkspaceSectionId(hashSection)) return hashSection;

  const storedSection = window.sessionStorage.getItem(WORKSPACE_STORAGE_KEY);
  return storedSection && isWorkspaceSectionId(storedSection)
    ? storedSection
    : "overview";
}

export function RetirementPlannerPage() {
  const { activeScenario, updateScenarioInputs } = useScenarios();
  const [inputs, setInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [comparisonInputs, setComparisonInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [retirementGoals, setRetirementGoals] = useState<RetirementGoals>(() => ({
    ...defaultRetirementGoals,
  }));
  const [chartView, setChartView] = useState<ChartView>("balance");
  const [activeSection, setActiveSection] = useState<WorkspaceSectionId>(
    getInitialWorkspaceSection,
  );

  const commitActiveInputs = useCallback(
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

  const {
    preview,
    effectiveInputs,
    startPreview,
    updateEffectiveInputs,
    keepPreview,
    discardPreview,
  } = usePlanPreview({ committedInputs: inputs, onCommit: commitActiveInputs });

  const currentScenario = usePensionProjection(effectiveInputs);
  const comparisonScenario = usePensionProjection(comparisonInputs);

  const assumptions = useMemo(
    () => [
      { label: "Current age", value: String(effectiveInputs.currentAge) },
      { label: "Retirement age", value: String(effectiveInputs.retirementAge) },
      {
        label: "Starting pension",
        value: formatCurrency(effectiveInputs.currentPot),
      },
      {
        label: "Monthly contribution",
        value: formatCurrency(
          effectiveInputs.monthlyEmployeeContribution +
            effectiveInputs.monthlyEmployerContribution,
        ),
      },
      {
        label: "Annual return",
        value: formatPercentage(effectiveInputs.annualReturn),
      },
      {
        label: "Inflation",
        value: formatPercentage(effectiveInputs.inflation),
      },
      {
        label: "Annual fund fee",
        value: formatPercentage(effectiveInputs.annualFee),
      },
      {
        label: "Contribution increase",
        value: formatPercentage(effectiveInputs.annualContributionIncrease),
      },
    ],
    [effectiveInputs],
  );

  const summaryMetrics = useMemo(() => {
    if (currentScenario.hasErrors) {
      return {
        readinessScore: 0,
        confidenceProbability: 0,
        projectedPot: 0,
        illustratedIncome: 0,
      };
    }

    const health = calculateRetirementHealth(
      currentScenario.projection,
      retirementGoals,
    );
    const target = calculateMonteCarloTarget(retirementGoals);
    const monteCarlo = MonteCarloEngine.calculate({
      pensionInputs: effectiveInputs,
      simulations: 500,
      seed: 12_345,
      annualVolatility: 0.12,
      targetRealBalance: target.targetRealBalance,
    });

    return {
      readinessScore: health.score,
      confidenceProbability: monteCarlo.successProbability ?? 0,
      projectedPot: currentScenario.projection.finalBalance.real,
      illustratedIncome: health.estimatedAnnualIncome,
    };
  }, [
    currentScenario.hasErrors,
    currentScenario.projection,
    effectiveInputs,
    retirementGoals,
  ]);

  const changeWorkspaceSection = useCallback((section: WorkspaceSectionId) => {
    setActiveSection(section);
    window.sessionStorage.setItem(WORKSPACE_STORAGE_KEY, section);

    const nextHash = `#${section}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }

    window.requestAnimationFrame(() => {
      document.getElementById(`workspace-panel-${section}`)?.focus();
    });
  }, []);

  useEffect(() => {
    function handleNavigation() {
      const hashSection = window.location.hash.replace(/^#/, "");
      if (isWorkspaceSectionId(hashSection)) {
        setActiveSection(hashSection);
        window.sessionStorage.setItem(WORKSPACE_STORAGE_KEY, hashSection);
      }
    }

    window.addEventListener("hashchange", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("hashchange", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const displayedWorkspaceSection = currentScenario.hasErrors
    ? "overview"
    : activeSection;

  const handleWorkspaceSectionChange = useCallback(
    (section: WorkspaceSectionId) => {
      if (currentScenario.hasErrors && section !== "overview") {
        return;
      }

      changeWorkspaceSection(section);
    },
    [changeWorkspaceSection, currentScenario.hasErrors],
  );

  function resetInputs() {
    updateEffectiveInputs(createDefaultPensionInputs());
  }

  function resetComparisonInputs() {
    setComparisonInputs(createDefaultPensionInputs());
  }

  function enableComparison() {
    setComparisonInputs({ ...effectiveInputs });
    setComparisonEnabled(true);
  }

  function applyRecommendationToComparison(recommendedInputs: PensionInputs) {
    setComparisonInputs({ ...recommendedInputs });
    setComparisonEnabled(true);
  }

  function renderWorkspaceContent() {
    if (currentScenario.hasErrors) {
      return (
        <>
          <section
            className="retirement-guided-input-region"
            aria-label="Build your retirement plan"
          >
            <GuidedPensionInputsForm
              idPrefix="current"
              value={effectiveInputs}
              errors={currentScenario.errors}
              onChange={updateEffectiveInputs}
              onReset={resetInputs}
            />
          </section>
          <section className="panel" role="alert">
            <div className="panel-heading">
              <h2>Your projection</h2>
              <p>Correct the highlighted fields to calculate your results.</p>
            </div>
          </section>
        </>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <>
            <section
              className="retirement-guided-input-region"
              aria-label="Build your retirement plan"
            >
              <GuidedPensionInputsForm
                idPrefix="current"
                value={effectiveInputs}
                errors={currentScenario.errors}
                onChange={updateEffectiveInputs}
                onReset={resetInputs}
              />
            </section>
            <section
              className="retirement-goals-control-region"
              aria-label="Retirement goals"
            >
              <RetirementGoalsForm
                value={retirementGoals}
                onChange={setRetirementGoals}
                compact
                collapsible
              />
            </section>
            <RetirementOverview
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
              onApplyToComparison={applyRecommendationToComparison}
            />
            <RetirementHealthDashboard
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
            />
          </>
        );

      case "growth":
        return (
          <>
            <div className="retirement-summary-strip">
              <ProjectionSummary result={currentScenario.projection} />
            </div>
            <RetirementJourney
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
            />
            <div className="retirement-dashboard-main-grid">
              <section className="retirement-chart-workspace">
                <div
                  className="retirement-chart-tabs"
                  role="tablist"
                  aria-label="Projection chart"
                >
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
                    className={
                      chartView === "contributions" ? "active" : undefined
                    }
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
                    <PensionBalanceChart
                      years={currentScenario.projection.years}
                    />
                  </div>
                ) : (
                  <div
                    id="projection-contributions-panel"
                    role="tabpanel"
                    aria-labelledby="projection-contributions-tab"
                    tabIndex={0}
                  >
                    <ContributionGrowthChart
                      years={currentScenario.projection.years}
                    />
                  </div>
                )}
              </section>
              <RetirementInsights
                inputs={effectiveInputs}
                result={currentScenario.projection}
              />
            </div>
            <details className="retirement-dashboard-details" open>
              <summary>Projection milestones</summary>
              <ProjectionMilestones years={currentScenario.projection.years} />
            </details>
          </>
        );

      case "confidence":
        return (
          <>
            <MonteCarloConfidenceDashboard
              inputs={effectiveInputs}
              goals={retirementGoals}
            />
            <MonteCarloConfidenceExplorer
              inputs={effectiveInputs}
              goals={retirementGoals}
            />
            <RetirementScoreBreakdown
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
            />
          </>
        );

      case "income":
        return (
          <Card padding="large">
            <CardHeader
              eyebrow="Retirement income"
              title="Model your retirement pay cheque"
              description="Use the dedicated drawdown planner to combine private-pension withdrawals, State Pension and tax into an annual retirement-income plan."
              icon={AppIcons.money}
              badge={<StatusBadge tone="info">Dedicated workspace</StatusBadge>}
            />
            <div className="workspace-bridge-actions">
              <Link
                className="ui-button ui-button-primary ui-button-medium"
                to="/drawdown"
              >
                Open retirement income planner
              </Link>
              <button
                type="button"
                className="ui-button ui-button-secondary ui-button-medium"
                onClick={() => changeWorkspaceSection("sustainability")}
              >
                Review sustainability
              </button>
            </div>
          </Card>
        );

      case "sustainability":
        return (
          <RetirementSustainabilityDashboard
            inputs={effectiveInputs}
            projection={currentScenario.projection}
            goals={retirementGoals}
          />
        );

      case "improve":
        return (
          <>
            <ActionCentre
              inputs={effectiveInputs}
              goals={retirementGoals}
              onPreviewPlan={startPreview}
              onPreviewComparison={applyRecommendationToComparison}
            />
            <RetirementCoach
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
              onApplyToComparison={applyRecommendationToComparison}
            />
            <RetirementWhatIfAnalysis
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
              onApplyToComparison={applyRecommendationToComparison}
            />
            <RetirementRecommendations
              inputs={effectiveInputs}
              result={currentScenario.projection}
              goals={retirementGoals}
              onApplyToComparison={applyRecommendationToComparison}
            />
          </>
        );

      case "details":
        return (
          <>
            {currentScenario.comparison?.feeImpact && (
              <FeeImpactDashboard
                feeImpact={currentScenario.comparison.feeImpact}
              />
            )}
            <details className="retirement-dashboard-details" open>
              <summary>Projection assumptions</summary>
              <ProjectionAssumptions assumptions={assumptions} />
            </details>
            <details className="retirement-dashboard-details">
              <summary>Year-by-year projection</summary>
              <ProjectionTable years={currentScenario.projection.years} />
            </details>
          </>
        );
    }
  }

  return (
    <main className="planner-page retirement-dashboard-page">
      <header className="planner-header retirement-dashboard-header">
        <div>
          <p className="planner-eyebrow">Retirement planning workspace</p>
          <h1>Retirement Planner</h1>
          <p>
            Focus on one retirement question at a time while keeping the headline
            plan visible.
          </p>
        </div>
        <button
          type="button"
          className={
            comparisonEnabled
              ? "comparison-toggle-button comparison-toggle-button-active"
              : "comparison-toggle-button"
          }
          onClick={() =>
            comparisonEnabled
              ? setComparisonEnabled(false)
              : enableComparison()
          }
        >
          {comparisonEnabled ? "Stop comparing" : "Compare scenario"}
        </button>
      </header>

      <section
        className={`scenario-planner-status${
          activeScenario.isBaseline ? " is-baseline" : " is-alternative"
        }`}
        aria-label="Scenario being edited"
      >
        <div>
          <p className="planner-eyebrow">
            {activeScenario.isBaseline
              ? "Editing baseline plan"
              : "Editing scenario"}
          </p>
          <h2>{activeScenario.name}</h2>
          <p>
            {activeScenario.isBaseline
              ? "Changes here update your main retirement plan and overview."
              : "This is an alternative scenario. Your baseline plan remains unchanged."}
          </p>
        </div>
        <Link className="ui-button ui-button-secondary" to="/compare">
          Manage scenarios
        </Link>
      </section>

      {preview && !comparisonEnabled && (
        <PlanPreviewBanner
          label={preview.label}
          baselineInputs={preview.baselineInputs}
          previewInputs={preview.previewInputs}
          onKeep={keepPreview}
          onDiscard={discardPreview}
        />
      )}

      {comparisonEnabled ? (
        <ComparisonLayout
          inputs={effectiveInputs}
          comparisonInputs={comparisonInputs}
          currentScenario={currentScenario}
          comparisonScenario={comparisonScenario}
          setInputs={updateEffectiveInputs}
          setComparisonInputs={setComparisonInputs}
          resetInputs={resetInputs}
          resetComparisonInputs={resetComparisonInputs}
          retirementGoals={retirementGoals}
          onRetirementGoalsChange={setRetirementGoals}
        />
      ) : (
        <>
          {!currentScenario.hasErrors && (
            <WorkspaceSummaryRibbon
              readinessScore={summaryMetrics.readinessScore}
              confidenceProbability={summaryMetrics.confidenceProbability}
              projectedPot={summaryMetrics.projectedPot}
              illustratedIncome={summaryMetrics.illustratedIncome}
              retirementAge={effectiveInputs.retirementAge}
            />
          )}
          <RetirementWorkspace
            activeSection={displayedWorkspaceSection}
            onSectionChange={handleWorkspaceSectionChange}
          >
            {renderWorkspaceContent()}
          </RetirementWorkspace>
        </>
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
