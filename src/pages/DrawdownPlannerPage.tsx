import { useEffect, useMemo, useState } from "react";
import { PoundSterling, TrendingUp } from "lucide-react";

import { DrawdownAssumptionsPanel } from "../components/drawdown/DrawdownAssumptionsPanel";
import { DrawdownBalanceChartExplorer } from "../components/drawdown/DrawdownBalanceChartExplorer";
import { DrawdownBalanceStory } from "../components/drawdown/DrawdownBalanceStory";
import { DrawdownIncomeChart } from "../components/drawdown/DrawdownIncomeChart";
import { DrawdownIncomeWaterfall } from "../components/drawdown/DrawdownIncomeWaterfall";
import { DrawdownInsights } from "../components/drawdown/DrawdownInsights";
import { DrawdownJourneyChart } from "../components/drawdown/DrawdownJourneyChart";
import { DrawdownPlanContext } from "../components/drawdown/DrawdownPlanContext";
import { DrawdownProjectionTable } from "../components/drawdown/DrawdownProjectionTable";
import { DrawdownRetirementChapters } from "../components/drawdown/DrawdownRetirementChapters";
import { DrawdownSummary } from "../components/drawdown/DrawdownSummary";
import { DrawdownSummaryRibbon } from "../components/drawdown/DrawdownSummaryRibbon";
import {
  DrawdownWorkspaceNavigation,
  type DrawdownWorkspaceSection,
} from "../components/drawdown/DrawdownWorkspaceNavigation";
import { useScenarios } from "../components/scenarios";
import { InfoTooltip } from "../components/ui";
import type { ScenarioDrawdownPreferences } from "../domain/scenarios";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import { validateDrawdownInputs } from "../engine/drawdown/validators/DrawdownInputsValidator";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import type { MoneyDisplayMode } from "../utils/drawdownDisplayValues";

const MONEY_DISPLAY_STORAGE_KEY = "retirement-planner:drawdown-money-display";
const drawdownEngine = new DrawdownEngine();

type DrawdownViewMode = "simple" | "detailed";

function getInitialMoneyDisplayMode(): MoneyDisplayMode {
  if (typeof window === "undefined") return "today";
  const savedMode = window.localStorage.getItem(MONEY_DISPLAY_STORAGE_KEY);
  return savedMode === "nominal" || savedMode === "today" ? savedMode : "today";
}

export function DrawdownPlannerPage() {
  const { activeScenario, updateScenarioPlan } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const [displayMode, setDisplayMode] = useState<MoneyDisplayMode>(getInitialMoneyDisplayMode);
  const [viewMode, setViewMode] = useState<DrawdownViewMode>("simple");
  const [activeSection, setActiveSection] = useState<DrawdownWorkspaceSection>("income");
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
          <h1>Drawdown</h1>
          <p>See how your retirement income and pension could evolve over time.</p>
        </div>
      </header>

      <DrawdownPlanContext activePlanName={activeScenario.name} value={inputs} />

      <section className="drawdown-results-workspace" aria-labelledby="drawdown-results-title">
        <div className="drawdown-view-controls">
          <div>
            <p className="panel-eyebrow">Drawdown view</p>
            <h2 id="drawdown-results-title">
              {viewMode === "simple" ? "Your retirement at a glance" : "Detailed drawdown analysis"}
            </h2>
            <p>
              {viewMode === "simple"
                ? "Start with the overall outcome, then follow how retirement develops over time."
                : "Inspect income, pension balance, the year-by-year timeline and calculation assumptions."}
            </p>
          </div>

          <div className="drawdown-view-actions">
            <div className="drawdown-view-mode-toggle" role="group" aria-label="Drawdown view">
              <button
                type="button"
                className={viewMode === "simple" ? "is-active" : undefined}
                aria-pressed={viewMode === "simple"}
                onClick={() => setViewMode("simple")}
              >
                Simple
              </button>
              <button
                type="button"
                className={viewMode === "detailed" ? "is-active" : undefined}
                aria-pressed={viewMode === "detailed"}
                onClick={() => setViewMode("detailed")}
              >
                Detailed
              </button>
            </div>
            <MoneyDisplayToggle value={displayMode} onChange={setDisplayMode} />
          </div>
        </div>

        {viewMode === "detailed" && (
          <div className="drawdown-outcome-toolbar drawdown-detailed-toolbar">
            <DrawdownWorkspaceNavigation value={activeSection} onChange={setActiveSection} />
          </div>
        )}

        <section className="drawdown-workspace-content" aria-live="polite">
          {result ? (
            viewMode === "simple" ? (
              <div className="drawdown-workspace-section drawdown-retirement-story drawdown-v12-dashboard drawdown-simple-story" id="drawdown-simple-section">
                <section className="drawdown-simple-story-section drawdown-simple-outcome" aria-labelledby="drawdown-simple-outcome-title">
                  <SimpleStoryHeading
                    eyebrow="Retirement outcome"
                    title="Can your plan support your retirement?"
                    description="Start with the headline outcome from your current plan."
                    id="drawdown-simple-outcome-title"
                  />
                  <DrawdownSummaryRibbon inputs={inputs} result={result} displayMode={displayMode} />
                </section>

                <section className="drawdown-simple-story-section" aria-labelledby="drawdown-simple-journey-title">
                  <SimpleStoryHeading
                    eyebrow="Your retirement journey"
                    title="What happens over time?"
                    description="Follow how your pension and retirement income develop through the plan."
                    id="drawdown-simple-journey-title"
                  />
                  <DrawdownJourneyChart
                    years={result.years}
                    inflationRate={inputs.inflationRate}
                    displayMode={displayMode}
                    spendingPhases={inputs.spendingPhases}
                    statePensionAge={inputs.annualStatePension > 0 ? inputs.statePensionAge : undefined}
                    depletionAge={result.depletionAge}
                  />
                </section>

                <section className="drawdown-simple-story-section" aria-labelledby="drawdown-simple-observations-title">
                  <SimpleStoryHeading
                    eyebrow="At a glance"
                    title="Anything important you should know?"
                    description="These observations highlight the parts of the plan worth noticing."
                    id="drawdown-simple-observations-title"
                  />
                  <DrawdownInsights inputs={inputs} result={result} displayMode={displayMode} />
                </section>

                <section className="drawdown-simple-story-section" aria-labelledby="drawdown-simple-income-title">
                  <SimpleStoryHeading
                    eyebrow="Retirement income"
                    title="Where does your income come from?"
                    description="See how your pension and State Pension combine to support retirement income."
                    id="drawdown-simple-income-title"
                  />
                  <DrawdownIncomeWaterfall inputs={inputs} result={result} displayMode={displayMode} />
                </section>
              </div>
            ) : (
              <div className="drawdown-detailed-view">
                <DrawdownSummaryRibbon inputs={inputs} result={result} displayMode={displayMode} />

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
                    <SectionHeading eyebrow="Pension balance" title="How does your pension change through retirement?" description="See the current plan in detail and inspect alternative ending-balance illustrations." />
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
                    <SectionHeading eyebrow="Retirement timeline" title="Inspect every year of retirement" description="Trace pension withdrawals, State Pension, tax, growth, fees and the pension left at the end of each year." />
                    <DrawdownProjectionTable years={result.years} inflationRate={inputs.inflationRate} displayMode={displayMode} />
                  </div>
                )}

                {activeSection === "assumptions" && (
                  <div className="drawdown-workspace-section" id="drawdown-assumptions-section" role="tabpanel" aria-labelledby="drawdown-tab-assumptions" tabIndex={0}>
                    <SectionHeading eyebrow="Calculation basis" title="What rules drive the illustration?" description="Understand the methodology, money basis and plan values used by the deterministic model." />
                    <DrawdownAssumptionsPanel inputs={inputs} displayMode={displayMode} />
                  </div>
                )}
              </div>
            )
          ) : (
            <section className="panel retirement-dashboard-empty-state" aria-live="polite"><h2>Review the retirement-income settings</h2><p>Edit the active plan from My Plan to correct the saved retirement choices.</p></section>
          )}
        </section>
      </section>
    </main>
  );
}

function SimpleStoryHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return (
    <div className="drawdown-simple-story-heading">
      <p className="panel-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
    </div>
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
      <InfoTooltip
        ariaLabel="Explain today’s money and future money"
        size="medium"
      >
        <strong>Today&apos;s money</strong>
        <p>Removes inflation so figures are shown using today&apos;s purchasing power.</p>
        <strong>Future money</strong>
        <p>Shows the projected pound amount in each future year.</p>
        <small>The projection is unchanged; only the display basis changes.</small>
      </InfoTooltip>
    </div>
  );
}
