import { useEffect, useMemo, useState } from "react";
import { Info, PoundSterling, TrendingUp } from "lucide-react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChartExplorer } from "../components/drawdown/DrawdownBalanceChartExplorer";
import { DrawdownBalanceStory } from "../components/drawdown/DrawdownBalanceStory";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownIncomeWaterfall } from "../components/drawdown/DrawdownIncomeWaterfall";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownPlanContext } from "../components/drawdown/DrawdownPlanContext";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownRetirementChapters } from "../components/drawdown/DrawdownRetirementChapters";
import { DrawdownRetirementJourney } from "../components/drawdown/DrawdownRetirementJourney";
import { DrawdownRetirementTimeline } from "../components/drawdown/DrawdownRetirementTimeline";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { DrawdownSummaryRibbon } from "../components/drawdown/DrawdownSummaryRibbon";
import {
  DrawdownWorkspaceNavigation,
  type DrawdownWorkspaceSection,
} from "../components/drawdown/DrawdownWorkspaceNavigation";
import { useScenarios } from "../components/scenarios";
import type { ScenarioDrawdownPreferences } from "../domain/scenarios";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
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
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(getInitialMoneyDisplayMode);
  const [activeSection, setActiveSection] = useState<DrawdownWorkspaceSection>("overview");
  const pensionProjection = usePensionProjection(activeScenario.inputs);
  const inputs = useMemo(
    () => createDrawdownInputsFromPlan({ pensionInputs: activeScenario.inputs, projection: pensionProjection.projection, retirementGoals, drawdown: activeScenario.drawdown }),
    [activeScenario.drawdown, activeScenario.inputs, pensionProjection.projection, retirementGoals],
  );
  const validation = useMemo(() => validateDrawdownInputs(inputs), [inputs]);
  const result = useMemo(() => (validation.isValid ? drawdownEngine.calculate(inputs) : null), [inputs, validation.isValid]);

  useEffect(() => {
    window.localStorage.setItem(MONEY_DISPLAY_STORAGE_KEY, displayMode);
  }, [displayMode]);

  function updateDrawdownPreferences(drawdown: ScenarioDrawdownPreferences) {
    updateScenarioPlan(activeScenario.id, activeScenario.inputs, drawdown);
  }

  return (
    <main className="planner-page drawdown-dashboard-page drawdown-workspace-page drawdown-guided-page">
      <header className="planner-header dashboard-header drawdown-workspace-header">
        <div>
          <p className="planner-eyebrow">Your retirement</p>
          <h1>Your Retirement</h1>
          <p>Follow how your income, pension and key retirement events could develop after you stop working.</p>
        </div>
      </header>

      <DrawdownPlanContext activePlanName={activeScenario.name} value={inputs} />

      <section className="drawdown-results-workspace" aria-labelledby="drawdown-results-title">
        <div className="drawdown-guided-section-heading drawdown-outcome-heading">
          <div>
            <p className="panel-eyebrow">Retirement story</p>
            <h2 id="drawdown-results-title">What happens after you retire?</h2>
            <p>Start with the complete retirement journey, then use the detailed views when you want to inspect a specific part of the plan.</p>
          </div>
          <MoneyDisplayToggle value={displayMode} onChange={setDisplayMode} />
        </div>

        <div className="drawdown-outcome-toolbar">
          <DrawdownWorkspaceNavigation value={activeSection} onChange={setActiveSection} />
        </div>

        <section className="drawdown-workspace-content" aria-live="polite">
          {result ? (
            <>
              {activeSection === "overview" && (
                <div className="drawdown-workspace-section drawdown-retirement-story" id="drawdown-overview-section" role="tabpanel" aria-labelledby="drawdown-tab-overview" tabIndex={0}>
                  <SectionHeading
                    eyebrow="At a glance"
                    title="Your retirement summary"
                    description="Start with the outcome of the active plan before following the journey year by year."
                  />
                  <DrawdownSummaryRibbon inputs={inputs} result={result} displayMode={displayMode} />

                  <SectionHeading
                    eyebrow="Your journey"
                    title="How does retirement unfold?"
                    description="Follow retirement, tax-free cash, State Pension and changes in spending across the planning period."
                  />
                  <DrawdownRetirementJourney inputs={inputs} result={result} displayMode={displayMode} />
                  <DrawdownRetirementTimeline inputs={inputs} result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />

                  <SectionHeading
                    eyebrow="Your income"
                    title="How much could you receive through retirement?"
                    description="See how the amount available to spend changes as your retirement progresses."
                  />
                  <DrawdownRetirementChapters inputs={inputs} result={result} displayMode={displayMode} />
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel">
                    <div className="dashboard-chart-stage">
                      <DrawdownIncomeChart
                        years={result.years}
                        inflationRate={inputs.inflationRate}
                        displayMode={displayMode}
                        spendingPhases={inputs.spendingPhases}
                        statePensionAge={inputs.annualStatePension > 0 ? inputs.statePensionAge : undefined}
                      />
                    </div>
                  </section>

                  <SectionHeading
                    eyebrow="Income sources"
                    title="Where does your retirement income come from?"
                    description="Understand how pension withdrawals and State Pension combine to support your spending."
                  />
                  <DrawdownIncomeWaterfall inputs={inputs} result={result} displayMode={displayMode} />

                  <SectionHeading
                    eyebrow="Your pension"
                    title="What happens to the pension balance?"
                    description="See how withdrawals, investment growth and fees affect the pension that remains through retirement."
                  />
                  <DrawdownBalanceStory inputs={inputs} result={result} displayMode={displayMode} />

                  <SectionHeading
                    eyebrow="What this means"
                    title="Key retirement insights"
                    description="Finish with the most important outcomes from the current retirement plan."
                  />
                  <DrawdownInsights result={result} />
                </div>
              )}

              {activeSection !== "overview" && (
                <DrawdownSummaryRibbon inputs={inputs} result={result} displayMode={displayMode} />
              )}

              {activeSection === "income" && (
                <div className="drawdown-workspace-section" id="drawdown-income-section" role="tabpanel" aria-labelledby="drawdown-tab-income" tabIndex={0}>
                  <SectionHeading eyebrow="Income and tax" title="Where does retirement income come from?" description="Review income from your pension, State Pension, tax and any modelled gaps across each retirement chapter." />
                  <DrawdownRetirementChapters inputs={inputs} result={result} displayMode={displayMode} />
                  <DrawdownIncomeWaterfall inputs={inputs} result={result} displayMode={displayMode} />
                  <section className="panel dashboard-chart-panel drawdown-workspace-chart-panel"><div className="dashboard-chart-stage"><DrawdownIncomeChart years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} spendingPhases={inputs.spendingPhases} statePensionAge={inputs.annualStatePension > 0 ? inputs.statePensionAge : undefined} /></div></section>
                  <DrawdownSummary result={result} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}
              {activeSection === "balance" && (
                <div className="drawdown-workspace-section" id="drawdown-balance-section" role="tabpanel" aria-labelledby="drawdown-tab-balance" tabIndex={0}>
                  <SectionHeading eyebrow="Pension balance" title="How does your pension change through retirement?" description="See your current plan or compare alternative ending-balance paths to understand the trade-off between retirement income and money left later." />
                  <DrawdownRetirementChapters inputs={inputs} result={result} displayMode={displayMode} />
                  <DrawdownBalanceStory inputs={inputs} result={result} displayMode={displayMode} />
                  <DrawdownBalanceChartExplorer
                    inputs={inputs}
                    result={result}
                    displayMode={displayMode}
                    drawdown={activeScenario.drawdown}
                    onChange={updateDrawdownPreferences}
                  />
                </div>
              )}
              {activeSection === "details" && (
                <div className="drawdown-workspace-section" id="drawdown-details-section" role="tabpanel" aria-labelledby="drawdown-tab-details" tabIndex={0}>
                  <SectionHeading eyebrow="Retirement timeline" title="Inspect every year of retirement" description="Trace income from your pension, State Pension, tax, growth, fees and the pension left at the end of each year." />
                  <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                </div>
              )}
              {activeSection === "assumptions" && (
                <div className="drawdown-workspace-section" id="drawdown-assumptions-section" role="tabpanel" aria-labelledby="drawdown-tab-assumptions" tabIndex={0}>
                  <SectionHeading eyebrow="Calculation basis" title="What rules drive the illustration?" description="Understand the methodology, money basis, retirement chapters and plan values used by the deterministic model." />
                  <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />
                </div>
              )}
            </>
          ) : (
            <section className="panel retirement-dashboard-empty-state" aria-live="polite"><h2>Review the retirement-income settings</h2><p>Edit the active plan to correct the saved retirement choices.</p></section>
          )}
        </section>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="drawdown-section-heading"><div><p className="panel-eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{description}</p></div>;
}

interface MoneyDisplayToggleProps { value: MoneyDisplayMode; onChange: (value: MoneyDisplayMode) => void; }

function MoneyDisplayToggle({ value, onChange }: MoneyDisplayToggleProps) {
  const showingToday = value === "today";
  const nextValue: MoneyDisplayMode = showingToday ? "nominal" : "today";
  return (
    <div className="money-display-toggle-group">
      <span className="money-display-toggle-label">Display values</span>
      <button type="button" role="switch" aria-checked={!showingToday} aria-label={`Display values as ${showingToday ? "today's money" : "future money"}. Switch to ${showingToday ? "future money" : "today's money"}.`} className="money-display-toggle" onClick={() => onChange(nextValue)}>
        <span className="money-display-toggle-icon" aria-hidden="true">{showingToday ? <PoundSterling size={16} /> : <TrendingUp size={16} />}</span>
        <span>{showingToday ? "Today’s money" : "Future money"}</span>
        <span className="money-display-toggle-track" aria-hidden="true"><span className="money-display-toggle-thumb" /></span>
      </button>
      <details className="money-display-tooltip">
        <summary aria-label="Explain today’s money and future money"><Info size={16} aria-hidden="true" /></summary>
        <div className="money-display-tooltip-panel"><strong>Today&apos;s money</strong><p>Removes inflation so figures are shown using today&apos;s purchasing power.</p><strong>Future money</strong><p>Shows the projected pound amount in each future year.</p><small>The projection is unchanged; only the display basis changes.</small></div>
      </details>
    </div>
  );
}
