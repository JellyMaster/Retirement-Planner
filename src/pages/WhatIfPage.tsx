import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { useScenarios } from "../components/scenarios";
import { ContributionExperiment } from "../components/what-if/ContributionExperiment";
import { CreatePlanFromExperiment } from "../components/what-if/CreatePlanFromExperiment";
import {
  ExperimentLauncher,
  type ExperimentId,
} from "../components/what-if/ExperimentLauncher";
import { FeeExperiment } from "../components/what-if/FeeExperiment";
import { InflationExperiment } from "../components/what-if/InflationExperiment";
import { isSavedExperimentMatch } from "../components/what-if/isSavedExperimentMatch";
import { MarketDownturnExperiment } from "../components/what-if/MarketDownturnExperiment";
import { RetirementAgeExperiment } from "../components/what-if/RetirementAgeExperiment";
import { ReturnExperiment } from "../components/what-if/ReturnExperiment";
import { SaveWhatIfScenarioModal } from "../components/what-if/SaveWhatIfScenarioModal";
import { SavedExperimentsPanel } from "../components/what-if/SavedExperimentsPanel";
import { SpendingExperiment } from "../components/what-if/SpendingExperiment";
import { StatePensionExperiment } from "../components/what-if/StatePensionExperiment";
import { useWhatIfScenarios } from "../components/what-if/WhatIfScenarioContext";
import { ExperimentInsights } from "../components/what-if/shared/ExperimentInsights";
import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../domain/scenarios";
import type { WhatIfScenario } from "../domain/what-if/WhatIfScenario";
import { createRetirementSpendingOutcome } from "../engine/drawdown/createRetirementSpendingOutcome";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import "../styles/what-if-page.css";
import "../styles/what-if-controls.css";
import "../styles/what-if-insights.css";
import "../styles/what-if-scenarios.css";

export function WhatIfPage() {
  const scenarios = useScenarios();
  const whatIfScenarios = useWhatIfScenarios();

  return (
    <WhatIfWorkspace
      key={scenarios.activeScenario.id}
      activeScenario={scenarios.activeScenario}
      createScenario={scenarios.createScenario}
      updateScenarioPlan={scenarios.updateScenarioPlan}
      savedWhatIfScenarios={whatIfScenarios.scenarios}
      saveWhatIfScenario={whatIfScenarios.saveScenario}
      deleteWhatIfScenario={whatIfScenarios.deleteScenario}
      setHasUnsavedExperiment={whatIfScenarios.setHasUnsavedExperiment}
    />
  );
}

interface WhatIfWorkspaceProps {
  activeScenario: ReturnType<typeof useScenarios>["activeScenario"];
  createScenario: ReturnType<typeof useScenarios>["createScenario"];
  updateScenarioPlan: ReturnType<typeof useScenarios>["updateScenarioPlan"];
  savedWhatIfScenarios: WhatIfScenario[];
  saveWhatIfScenario: ReturnType<typeof useWhatIfScenarios>["saveScenario"];
  deleteWhatIfScenario: ReturnType<typeof useWhatIfScenarios>["deleteScenario"];
  setHasUnsavedExperiment: ReturnType<typeof useWhatIfScenarios>["setHasUnsavedExperiment"];
}

function WhatIfWorkspace({
  activeScenario,
  createScenario,
  updateScenarioPlan,
  savedWhatIfScenarios,
  saveWhatIfScenario,
  deleteWhatIfScenario,
  setHasUnsavedExperiment,
}: WhatIfWorkspaceProps) {
  const [retirementGoals] = useStoredRetirementGoals();
  const baselineDrawdown =
    activeScenario.drawdown ??
    createDefaultScenarioDrawdownPreferences(retirementGoals.desiredAnnualIncome);
  const baselineStateIncluded =
    baselineDrawdown.includeStatePension ?? retirementGoals.includeStatePension;
  const baselineStateAmount =
    baselineDrawdown.statePensionAnnualAmount ?? retirementGoals.statePensionAnnualAmount;
  const baselineStateAge =
    baselineDrawdown.statePensionAge ?? retirementGoals.statePensionAge;

  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>("retirement-age");
  const [alternativeInputs, setAlternativeInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [alternativeDrawdown, setAlternativeDrawdown] =
    useState<ScenarioDrawdownPreferences>(() => ({ ...baselineDrawdown }));
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loadedWhatIfScenarioId, setLoadedWhatIfScenarioId] = useState<string | null>(null);
  const [saveDialogSuggestedName, setSaveDialogSuggestedName] = useState<string | null>(null);

  const savedForActiveExperiment = useMemo(
    () =>
      savedWhatIfScenarios.filter(
        (scenario) =>
          scenario.baseScenarioId === activeScenario.id &&
          scenario.experimentType === activeExperiment,
      ),
    [activeExperiment, activeScenario.id, savedWhatIfScenarios],
  );
  const loadedWhatIfScenario = useMemo(
    () =>
      loadedWhatIfScenarioId
        ? savedWhatIfScenarios.find(
            (scenario) =>
              scenario.id === loadedWhatIfScenarioId &&
              scenario.baseScenarioId === activeScenario.id,
          ) ?? null
        : null,
    [activeScenario.id, loadedWhatIfScenarioId, savedWhatIfScenarios],
  );

  const alternativeStateIncluded =
    alternativeDrawdown.includeStatePension ?? baselineStateIncluded;
  const alternativeStateAmount =
    alternativeDrawdown.statePensionAnnualAmount ?? baselineStateAmount;
  const alternativeStateAge = alternativeDrawdown.statePensionAge ?? baselineStateAge;

  const baselineScenario = usePensionProjection(activeScenario.inputs);
  const alternativeScenario = usePensionProjection(alternativeInputs);
  const baselineHealth = baselineScenario.hasErrors
    ? null
    : calculateRetirementHealth(baselineScenario.projection, {
        ...retirementGoals,
        desiredAnnualIncome: baselineDrawdown.desiredAnnualIncome,
        includeStatePension: baselineStateIncluded,
        statePensionAnnualAmount: baselineStateAmount,
        statePensionAge: baselineStateAge,
      });
  const alternativeHealth = alternativeScenario.hasErrors
    ? null
    : calculateRetirementHealth(alternativeScenario.projection, {
        ...retirementGoals,
        desiredAnnualIncome: alternativeDrawdown.desiredAnnualIncome,
        includeStatePension: alternativeStateIncluded,
        statePensionAnnualAmount: alternativeStateAmount,
        statePensionAge: alternativeStateAge,
      });

  const baselineRetirementOutcome = useMemo(() => {
    if (baselineScenario.hasErrors) return null;
    const drawdownInputs = createDrawdownInputsFromPlan({
      pensionInputs: activeScenario.inputs,
      projection: baselineScenario.projection,
      retirementGoals: {
        ...retirementGoals,
        desiredAnnualIncome: baselineDrawdown.desiredAnnualIncome,
        includeStatePension: baselineStateIncluded,
        statePensionAnnualAmount: baselineStateAmount,
        statePensionAge: baselineStateAge,
      },
      drawdown: baselineDrawdown,
    });
    return createRetirementSpendingOutcome(drawdownInputs, baselineDrawdown);
  }, [
    activeScenario.inputs,
    baselineDrawdown,
    baselineScenario.hasErrors,
    baselineScenario.projection,
    baselineStateAge,
    baselineStateAmount,
    baselineStateIncluded,
    retirementGoals,
  ]);

  const alternativeRetirementOutcome = useMemo(() => {
    if (alternativeScenario.hasErrors) return null;
    const drawdownInputs = createDrawdownInputsFromPlan({
      pensionInputs: alternativeInputs,
      projection: alternativeScenario.projection,
      retirementGoals: {
        ...retirementGoals,
        desiredAnnualIncome: alternativeDrawdown.desiredAnnualIncome,
        includeStatePension: alternativeStateIncluded,
        statePensionAnnualAmount: alternativeStateAmount,
        statePensionAge: alternativeStateAge,
      },
      drawdown: alternativeDrawdown,
    });
    return createRetirementSpendingOutcome(drawdownInputs, alternativeDrawdown);
  }, [
    alternativeDrawdown,
    alternativeInputs,
    alternativeScenario.hasErrors,
    alternativeScenario.projection,
    alternativeStateAge,
    alternativeStateAmount,
    alternativeStateIncluded,
    retirementGoals,
  ]);

  const planningAge = baselineDrawdown.planningAge;
  const yearsToRetirement = Math.max(
    0,
    activeScenario.inputs.retirementAge - activeScenario.inputs.currentAge,
  );
  const baselineExtraContribution = activeScenario.inputs.extraMonthlyContribution ?? 0;
  const baselineExtraContributionAge =
    activeScenario.inputs.extraContributionAge ??
    Math.min(activeScenario.inputs.retirementAge - 1, activeScenario.inputs.currentAge + 1);
  const defaultDownturnAge = Math.min(
    activeScenario.inputs.retirementAge,
    activeScenario.inputs.currentAge + 5,
  );
  const downturnAge = alternativeInputs.marketDownturnAge ?? defaultDownturnAge;
  const downturnPercentage = alternativeInputs.marketDownturnPercentage ?? 0;
  const balanceAtDownturn =
    baselineScenario.projection.years.find((year) => year.age >= downturnAge)
      ?.closingBalance.real ?? activeScenario.inputs.currentPot;
  const experimentHasChanged = hasExperimentChanged(
    activeExperiment,
    activeScenario.inputs,
    alternativeInputs,
    baselineDrawdown,
    alternativeDrawdown,
    baselineStateIncluded,
    alternativeStateIncluded,
    baselineStateAmount,
    alternativeStateAmount,
    baselineStateAge,
    alternativeStateAge,
  );
  const experimentAlreadySaved = savedForActiveExperiment.some((scenario) =>
    isSavedExperimentMatch({
      experiment: activeExperiment,
      scenario,
      inputs: alternativeInputs,
      drawdown: alternativeDrawdown,
      stateIncluded: alternativeStateIncluded,
      stateAmount: alternativeStateAmount,
      stateAge: alternativeStateAge,
    }),
  );
  const canSaveExperiment = !alternativeScenario.hasErrors && !experimentAlreadySaved;

  useEffect(() => {
    setHasUnsavedExperiment(
      experimentHasChanged && loadedWhatIfScenarioId === null && !experimentAlreadySaved,
    );
    return () => setHasUnsavedExperiment(false);
  }, [
    experimentAlreadySaved,
    experimentHasChanged,
    loadedWhatIfScenarioId,
    setHasUnsavedExperiment,
  ]);

  function selectExperiment(experiment: ExperimentId) {
    setActiveExperiment(experiment);
    resetExperiment();
  }

  function changeRetirementAge(retirementAge: number) {
    setAlternativeInputs(createRetirementAgeExperimentInputs(activeScenario.inputs, retirementAge));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeEmployeeContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      monthlyEmployeeContribution: Math.max(0, amount),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeEmployerContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      monthlyEmployerContribution: Math.max(0, amount),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeExtraContributionEnabled(enabled: boolean) {
    setAlternativeInputs((current) => {
      const next: PensionInputs = { ...current };
      if (!enabled) {
        delete next.extraContributionAge;
        delete next.extraMonthlyContribution;
        return next;
      }
      next.extraContributionAge = Math.min(
        baselineExtraContributionAge,
        Math.max(next.currentAge, next.retirementAge - 1),
      );
      next.extraMonthlyContribution = baselineExtraContribution || 250;
      return next;
    });
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeExtraContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      extraContributionAge: current.extraContributionAge ?? baselineExtraContributionAge,
      extraMonthlyContribution: amount,
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeExtraContributionAge(age: number) {
    setAlternativeInputs((current) => ({
      ...current,
      extraContributionAge: Math.min(
        Math.max(current.currentAge, Math.round(age)),
        current.retirementAge - 1,
      ),
      extraMonthlyContribution:
        current.extraMonthlyContribution ?? (baselineExtraContribution || 250),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeTargetIncome(amount: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      desiredAnnualIncome: Math.max(0, Math.round(amount)),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeAnnualFee(annualFee: number) {
    setAlternativeInputs((current) => ({
      ...current,
      annualFee: Math.min(0.02, Math.max(0, annualFee)),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeAnnualReturn(annualReturn: number) {
    setAlternativeInputs((current) => ({
      ...current,
      annualReturn: Math.min(0.12, Math.max(0, annualReturn)),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeInflation(inflation: number) {
    setAlternativeInputs((current) => ({
      ...current,
      inflation: Math.min(0.08, Math.max(0, inflation)),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeStateIncluded(includeStatePension: boolean) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension,
      statePensionAnnualAmount: current.statePensionAnnualAmount ?? baselineStateAmount,
      statePensionAge: current.statePensionAge ?? baselineStateAge,
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeStateAmount(statePensionAnnualAmount: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension: true,
      statePensionAnnualAmount: Math.max(0, Math.round(statePensionAnnualAmount)),
      statePensionAge: current.statePensionAge ?? baselineStateAge,
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeStateAge(statePensionAge: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension: true,
      statePensionAnnualAmount: current.statePensionAnnualAmount ?? baselineStateAmount,
      statePensionAge: Math.min(
        planningAge,
        Math.max(activeScenario.inputs.retirementAge, Math.round(statePensionAge)),
      ),
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeDownturnAge(age: number) {
    setAlternativeInputs((current) => ({
      ...current,
      marketDownturnAge: Math.min(
        current.retirementAge,
        Math.max(current.currentAge, Math.round(age)),
      ),
      marketDownturnPercentage: current.marketDownturnPercentage ?? 0.2,
    }));
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function changeDownturnPercentage(percentage: number) {
    setAlternativeInputs((current) => {
      const next: PensionInputs = {
        ...current,
        marketDownturnAge: current.marketDownturnAge ?? defaultDownturnAge,
        marketDownturnPercentage: Math.min(0.5, Math.max(0, percentage)),
      };
      if (next.marketDownturnPercentage === 0) {
        delete next.marketDownturnPercentage;
        delete next.marketDownturnAge;
      }
      return next;
    });
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
  }

  function resetExperiment() {
    setAlternativeInputs({ ...activeScenario.inputs });
    setAlternativeDrawdown({ ...baselineDrawdown });
    setLoadedWhatIfScenarioId(null);
    setSaveMessage(null);
    setSaveDialogSuggestedName(null);
  }

  function unloadSavedExperiment() {
    resetExperiment();
    setSaveMessage(`Returned to ${activeScenario.name}. The saved experiment is still available.`);
  }

  function openSaveExperiment() {
    if (!canSaveExperiment || !experimentHasChanged) return;
    setSaveDialogSuggestedName(
      createSuggestedName(
        activeExperiment,
        alternativeInputs,
        alternativeDrawdown,
        alternativeStateIncluded,
        alternativeStateAge,
      ),
    );
  }

  function confirmSaveExperiment(name: string) {
    if (experimentAlreadySaved) return;
    const saved = saveWhatIfScenario({
      name,
      baseScenarioId: activeScenario.id,
      experimentType: activeExperiment,
      inputs: { ...alternativeInputs },
      drawdown: { ...alternativeDrawdown },
    });
    setLoadedWhatIfScenarioId(saved.id);
    setSaveDialogSuggestedName(null);
    setSaveMessage(`${name} saved to ${activeScenario.name}.`);
  }

  function loadSavedExperiment(scenario: WhatIfScenario) {
    setActiveExperiment(scenario.experimentType);
    setAlternativeInputs({ ...scenario.inputs });
    setAlternativeDrawdown({ ...scenario.drawdown });
    setLoadedWhatIfScenarioId(scenario.id);
    setSaveDialogSuggestedName(null);
    setSaveMessage(`${scenario.name} applied.`);
  }

  function deleteSavedExperiment(scenarioId: string) {
    const deletingLoaded = scenarioId === loadedWhatIfScenarioId;
    deleteWhatIfScenario(scenarioId);
    if (deletingLoaded) {
      resetExperiment();
      setSaveMessage(`Experiment deleted. Returned to ${activeScenario.name}.`);
    }
  }

  function createPlanFromExperiment(name: string, scenario: WhatIfScenario) {
    const plan = createScenario(name, scenario.baseScenarioId);
    updateScenarioPlan(plan.id, { ...scenario.inputs }, { ...scenario.drawdown });
    setSaveMessage(`${name} has been added to My Plans and is ready to compare.`);
  }

  return (
    <main className="planner-page what-if-page">
      <header className="planner-header what-if-header">
        <div>
          <p className="planner-eyebrow">Decision lab · {activeScenario.name}</p>
          <h1>What would happen if you changed one decision?</h1>
          <p>
            Explore one meaningful lever at a time. Save useful experiments against a plan,
            then turn the alternatives you want to keep into full plans.
          </p>
        </div>
        <div className="what-if-header-mark" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.lightbulb} fixedWidth />
        </div>
      </header>

      <section className="what-if-plan-context" aria-labelledby="what-if-base-plan-title">
        <div>
          <p className="planner-eyebrow">Experimenting with</p>
          <h2 id="what-if-base-plan-title">{activeScenario.name}</h2>
        </div>
        <p>What If uses the active plan selected in the top navigation.</p>
        <span className="what-if-active-plan-badge">Active plan</span>
      </section>

      <ExperimentLauncher activeExperiment={activeExperiment} onSelect={selectExperiment} />

      <div className="what-if-experiment-stage">
        <SavedExperimentsPanel
          activeExperiment={activeExperiment}
          activePlanName={activeScenario.name}
          scenarios={savedForActiveExperiment}
          loadedScenarioId={loadedWhatIfScenarioId}
          onLoad={loadSavedExperiment}
          onUnload={unloadSavedExperiment}
          onDelete={deleteSavedExperiment}
        />

        <div className="what-if-experiment-stage-main">
          {activeExperiment === "retirement-age" && (
            <RetirementAgeExperiment
              activePlanName={activeScenario.name}
              currentAge={activeScenario.inputs.currentAge}
              statePensionAge={baselineStateAge}
              baselineRetirementAge={activeScenario.inputs.retirementAge}
              retirementAge={alternativeInputs.retirementAge}
              planningAge={planningAge}
              baselineProjectedPension={baselineScenario.projection.finalBalance.real}
              projectedPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onRetirementAgeChange={changeRetirementAge}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "contributions" && (
            <ContributionExperiment
              activePlanName={activeScenario.name}
              currentAge={activeScenario.inputs.currentAge}
              retirementAge={activeScenario.inputs.retirementAge}
              baselineEmployeeContribution={activeScenario.inputs.monthlyEmployeeContribution}
              employeeContribution={alternativeInputs.monthlyEmployeeContribution}
              baselineEmployerContribution={activeScenario.inputs.monthlyEmployerContribution}
              employerContribution={alternativeInputs.monthlyEmployerContribution}
              baselineExtraContribution={baselineExtraContribution}
              baselineExtraContributionAge={baselineExtraContributionAge}
              extraContribution={alternativeInputs.extraMonthlyContribution ?? (baselineExtraContribution || 250)}
              extraContributionAge={alternativeInputs.extraContributionAge ?? baselineExtraContributionAge}
              includeExtraContribution={alternativeInputs.extraContributionAge !== undefined && alternativeInputs.extraMonthlyContribution !== undefined}
              baselineProjectedPension={baselineScenario.projection.finalBalance.real}
              projectedPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onEmployeeContributionChange={changeEmployeeContribution}
              onEmployerContributionChange={changeEmployerContribution}
              onExtraContributionEnabledChange={changeExtraContributionEnabled}
              onExtraContributionChange={changeExtraContribution}
              onExtraContributionAgeChange={changeExtraContributionAge}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "spending" && (
            <SpendingExperiment
              activePlanName={activeScenario.name}
              baselineTargetIncome={baselineDrawdown.desiredAnnualIncome}
              targetIncome={alternativeDrawdown.desiredAnnualIncome}
              incomeTargetMode={alternativeDrawdown.incomeTargetMode}
              illustratedAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              baselineCoverage={baselineHealth?.score ?? 0}
              coverage={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onTargetIncomeChange={changeTargetIncome}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "fees" && (
            <FeeExperiment
              activePlanName={activeScenario.name}
              baselineFee={activeScenario.inputs.annualFee}
              fee={alternativeInputs.annualFee}
              yearsToRetirement={yearsToRetirement}
              baselineTotalFees={baselineScenario.projection.totalFees.real}
              totalFees={alternativeScenario.projection.totalFees.real}
              baselineProjectedPension={baselineScenario.projection.finalBalance.real}
              projectedPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onFeeChange={changeAnnualFee}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "returns" && (
            <ReturnExperiment
              activePlanName={activeScenario.name}
              baselineReturn={activeScenario.inputs.annualReturn}
              annualReturn={alternativeInputs.annualReturn}
              yearsToRetirement={yearsToRetirement}
              baselineGrowth={baselineScenario.projection.totalInvestmentGrowth.real}
              growth={alternativeScenario.projection.totalInvestmentGrowth.real}
              baselineProjectedPension={baselineScenario.projection.finalBalance.real}
              projectedPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onReturnChange={changeAnnualReturn}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "inflation" && (
            <InflationExperiment
              activePlanName={activeScenario.name}
              baselineInflation={activeScenario.inputs.inflation}
              inflation={alternativeInputs.inflation}
              yearsToRetirement={yearsToRetirement}
              baselineNominalPension={baselineScenario.projection.finalBalance.nominal}
              nominalPension={alternativeScenario.projection.finalBalance.nominal}
              baselineRealPension={baselineScenario.projection.finalBalance.real}
              realPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onInflationChange={changeInflation}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "state-pension" && (
            <StatePensionExperiment
              activePlanName={activeScenario.name}
              retirementAge={activeScenario.inputs.retirementAge}
              planningAge={planningAge}
              baselineIncluded={baselineStateIncluded}
              included={alternativeStateIncluded}
              baselineAnnualAmount={baselineStateAmount}
              annualAmount={alternativeStateAmount}
              baselineStartAge={baselineStateAge}
              startAge={alternativeStateAge}
              privateAnnualIncome={baselineHealth?.annualPrivateIncome ?? 0}
              targetIncome={alternativeDrawdown.desiredAnnualIncome}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onIncludedChange={changeStateIncluded}
              onAnnualAmountChange={changeStateAmount}
              onStartAgeChange={changeStateAge}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}

          {activeExperiment === "market-downturn" && (
            <MarketDownturnExperiment
              activePlanName={activeScenario.name}
              currentAge={activeScenario.inputs.currentAge}
              retirementAge={activeScenario.inputs.retirementAge}
              downturnAge={downturnAge}
              downturnPercentage={downturnPercentage}
              balanceAtDownturn={balanceAtDownturn}
              baselineProjectedPension={baselineScenario.projection.finalBalance.real}
              projectedPension={alternativeScenario.projection.finalBalance.real}
              baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
              annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
              baselinePreparedness={baselineHealth?.score ?? 0}
              preparedness={alternativeHealth?.score ?? 0}
              canSave={canSaveExperiment}
              saveMessage={saveMessage}
              onAgeChange={changeDownturnAge}
              onPercentageChange={changeDownturnPercentage}
              onReset={resetExperiment}
              onSave={openSaveExperiment}
            />
          )}
        </div>
      </div>

      <ExperimentInsights
        activeExperiment={activeExperiment}
        baselineProjectedPension={baselineScenario.projection.finalBalance.real}
        projectedPension={alternativeScenario.projection.finalBalance.real}
        baselineAnnualIncome={baselineHealth?.estimatedAnnualIncome ?? 0}
        annualIncome={alternativeHealth?.estimatedAnnualIncome ?? 0}
        baselinePreparedness={baselineHealth?.score ?? 0}
        preparedness={alternativeHealth?.score ?? 0}
        baselineRetirementOutcome={baselineRetirementOutcome}
        retirementOutcome={alternativeRetirementOutcome}
        currentAge={activeScenario.inputs.currentAge}
        retirementAge={alternativeInputs.retirementAge}
        statePensionAge={alternativeStateAge}
        extraContributionAge={alternativeInputs.extraContributionAge}
        downturnAge={downturnAge}
        hasChanged={experimentHasChanged}
        onSelectExperiment={selectExperiment}
      />

      <CreatePlanFromExperiment
        activePlanName={activeScenario.name}
        scenario={loadedWhatIfScenario}
        onCreate={createPlanFromExperiment}
      />

      {saveDialogSuggestedName !== null && (
        <SaveWhatIfScenarioModal
          suggestedName={saveDialogSuggestedName}
          experimentName={formatExperimentName(activeExperiment)}
          basePlanName={activeScenario.name}
          onCancel={() => setSaveDialogSuggestedName(null)}
          onSave={confirmSaveExperiment}
        />
      )}
    </main>
  );
}

function formatExperimentName(experiment: ExperimentId): string {
  switch (experiment) {
    case "retirement-age": return "Retirement age";
    case "contributions": return "Save more";
    case "spending": return "Spending";
    case "fees": return "Fees";
    case "returns": return "Returns";
    case "inflation": return "Inflation";
    case "state-pension": return "State Pension";
    case "market-downturn": return "Market downturn";
  }
}

function hasExperimentChanged(
  experiment: ExperimentId,
  baselineInputs: PensionInputs,
  inputs: PensionInputs,
  baselineDrawdown: ScenarioDrawdownPreferences,
  drawdown: ScenarioDrawdownPreferences,
  baselineStateIncluded: boolean,
  stateIncluded: boolean,
  baselineStateAmount: number,
  stateAmount: number,
  baselineStateAge: number,
  stateAge: number,
): boolean {
  switch (experiment) {
    case "retirement-age":
      return inputs.retirementAge !== baselineInputs.retirementAge;
    case "contributions":
      return (
        inputs.monthlyEmployeeContribution !== baselineInputs.monthlyEmployeeContribution ||
        inputs.monthlyEmployerContribution !== baselineInputs.monthlyEmployerContribution ||
        inputs.extraMonthlyContribution !== baselineInputs.extraMonthlyContribution ||
        inputs.extraContributionAge !== baselineInputs.extraContributionAge
      );
    case "spending":
      return drawdown.desiredAnnualIncome !== baselineDrawdown.desiredAnnualIncome;
    case "fees":
      return inputs.annualFee !== baselineInputs.annualFee;
    case "returns":
      return inputs.annualReturn !== baselineInputs.annualReturn;
    case "inflation":
      return inputs.inflation !== baselineInputs.inflation;
    case "state-pension":
      return (
        stateIncluded !== baselineStateIncluded ||
        stateAmount !== baselineStateAmount ||
        stateAge !== baselineStateAge
      );
    case "market-downturn":
      return (
        (inputs.marketDownturnPercentage ?? 0) !==
          (baselineInputs.marketDownturnPercentage ?? 0) ||
        inputs.marketDownturnAge !== baselineInputs.marketDownturnAge
      );
  }
}

function createSuggestedName(
  experiment: ExperimentId,
  inputs: PensionInputs,
  drawdown: ScenarioDrawdownPreferences,
  stateIncluded: boolean,
  stateAge: number,
): string {
  if (experiment === "contributions") {
    return `Save ${Math.round(inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution)} monthly`;
  }
  if (experiment === "spending") {
    return `Spend ${Math.round(drawdown.desiredAnnualIncome)} yearly`;
  }
  if (experiment === "fees") {
    return `Fees ${(inputs.annualFee * 100).toFixed(2)} percent`;
  }
  if (experiment === "returns") {
    return `Return ${(inputs.annualReturn * 100).toFixed(1)} percent`;
  }
  if (experiment === "inflation") {
    return `Inflation ${(inputs.inflation * 100).toFixed(1)} percent`;
  }
  if (experiment === "state-pension") {
    return stateIncluded ? `State Pension from ${stateAge}` : "Without State Pension";
  }
  if (experiment === "market-downturn") {
    return `${Math.round((inputs.marketDownturnPercentage ?? 0) * 100)} percent fall at ${inputs.marketDownturnAge ?? inputs.currentAge}`;
  }
  return `Retire at ${inputs.retirementAge}`;
}

function createRetirementAgeExperimentInputs(
  baselineInputs: PensionInputs,
  retirementAge: number,
): PensionInputs {
  const nextInputs: PensionInputs = { ...baselineInputs, retirementAge };
  if (
    nextInputs.extraContributionAge !== undefined &&
    nextInputs.extraContributionAge >= retirementAge
  ) {
    delete nextInputs.extraContributionAge;
    delete nextInputs.extraMonthlyContribution;
  }
  if (
    nextInputs.marketDownturnAge !== undefined &&
    nextInputs.marketDownturnAge > retirementAge
  ) {
    nextInputs.marketDownturnAge = retirementAge;
  }
  return nextInputs;
}
