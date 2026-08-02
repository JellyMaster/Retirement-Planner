import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { useScenarios } from "../components/scenarios";
import { ContributionExperiment } from "../components/what-if/ContributionExperiment";
import {
  ExperimentLauncher,
  type ExperimentId,
} from "../components/what-if/ExperimentLauncher";
import { FeeExperiment } from "../components/what-if/FeeExperiment";
import { InflationExperiment } from "../components/what-if/InflationExperiment";
import { MarketDownturnExperiment } from "../components/what-if/MarketDownturnExperiment";
import { RetirementAgeExperiment } from "../components/what-if/RetirementAgeExperiment";
import { ReturnExperiment } from "../components/what-if/ReturnExperiment";
import { SpendingExperiment } from "../components/what-if/SpendingExperiment";
import { StatePensionExperiment } from "../components/what-if/StatePensionExperiment";
import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import "../styles/what-if-page.css";
import "../styles/what-if-controls.css";

export function WhatIfPage() {
  const scenarios = useScenarios();
  return (
    <WhatIfWorkspace
      key={scenarios.activeScenario.id}
      activeScenario={scenarios.activeScenario}
      createScenario={scenarios.createScenario}
      updateScenarioPlan={scenarios.updateScenarioPlan}
    />
  );
}

interface WhatIfWorkspaceProps {
  activeScenario: ReturnType<typeof useScenarios>["activeScenario"];
  createScenario: ReturnType<typeof useScenarios>["createScenario"];
  updateScenarioPlan: ReturnType<typeof useScenarios>["updateScenarioPlan"];
}

function WhatIfWorkspace({
  activeScenario,
  createScenario,
  updateScenarioPlan,
}: WhatIfWorkspaceProps) {
  const [retirementGoals] = useStoredRetirementGoals();
  const baselineDrawdown =
    activeScenario.drawdown ??
    createDefaultScenarioDrawdownPreferences(retirementGoals.desiredAnnualIncome);
  const baselineStateIncluded =
    baselineDrawdown.includeStatePension ?? retirementGoals.includeStatePension;
  const baselineStateAmount =
    baselineDrawdown.statePensionAnnualAmount ??
    retirementGoals.statePensionAnnualAmount;
  const baselineStateAge =
    baselineDrawdown.statePensionAge ?? retirementGoals.statePensionAge;

  const [activeExperiment, setActiveExperiment] =
    useState<ExperimentId>("retirement-age");
  const [alternativeInputs, setAlternativeInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [alternativeDrawdown, setAlternativeDrawdown] =
    useState<ScenarioDrawdownPreferences>(() => ({ ...baselineDrawdown }));
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const alternativeStateIncluded =
    alternativeDrawdown.includeStatePension ?? baselineStateIncluded;
  const alternativeStateAmount =
    alternativeDrawdown.statePensionAnnualAmount ?? baselineStateAmount;
  const alternativeStateAge =
    alternativeDrawdown.statePensionAge ?? baselineStateAge;

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

  const planningAge = baselineDrawdown.planningAge;
  const yearsToRetirement = Math.max(
    0,
    activeScenario.inputs.retirementAge - activeScenario.inputs.currentAge,
  );
  const baselineExtraContribution =
    activeScenario.inputs.extraMonthlyContribution ?? 0;
  const baselineExtraContributionAge =
    activeScenario.inputs.extraContributionAge ??
    Math.min(
      activeScenario.inputs.retirementAge - 1,
      activeScenario.inputs.currentAge + 1,
    );
  const defaultDownturnAge = Math.min(
    activeScenario.inputs.retirementAge,
    activeScenario.inputs.currentAge + 5,
  );
  const downturnAge =
    alternativeInputs.marketDownturnAge ?? defaultDownturnAge;
  const downturnPercentage =
    alternativeInputs.marketDownturnPercentage ?? 0;
  const balanceAtDownturn =
    baselineScenario.projection.years.find((year) => year.age >= downturnAge)
      ?.closingBalance.real ?? activeScenario.inputs.currentPot;

  function selectExperiment(experiment: ExperimentId) {
    setActiveExperiment(experiment);
    resetExperiment();
  }

  function changeRetirementAge(retirementAge: number) {
    setAlternativeInputs(
      createRetirementAgeExperimentInputs(activeScenario.inputs, retirementAge),
    );
    setSaveMessage(null);
  }

  function changeEmployeeContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      monthlyEmployeeContribution: Math.max(0, amount),
    }));
    setSaveMessage(null);
  }

  function changeEmployerContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      monthlyEmployerContribution: Math.max(0, amount),
    }));
    setSaveMessage(null);
  }

  function changeExtraContributionEnabled(enabled: boolean) {
    setAlternativeInputs((current) => {
      const next = { ...current };
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
    setSaveMessage(null);
  }

  function changeExtraContribution(amount: number) {
    setAlternativeInputs((current) => ({
      ...current,
      extraContributionAge:
        current.extraContributionAge ?? baselineExtraContributionAge,
      extraMonthlyContribution: amount,
    }));
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
    setSaveMessage(null);
  }

  function changeTargetIncome(amount: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      desiredAnnualIncome: Math.max(0, Math.round(amount)),
    }));
    setSaveMessage(null);
  }

  function changeAnnualFee(annualFee: number) {
    setAlternativeInputs((current) => ({
      ...current,
      annualFee: Math.min(0.02, Math.max(0, annualFee)),
    }));
    setSaveMessage(null);
  }

  function changeAnnualReturn(annualReturn: number) {
    setAlternativeInputs((current) => ({
      ...current,
      annualReturn: Math.min(0.12, Math.max(0, annualReturn)),
    }));
    setSaveMessage(null);
  }

  function changeInflation(inflation: number) {
    setAlternativeInputs((current) => ({
      ...current,
      inflation: Math.min(0.08, Math.max(0, inflation)),
    }));
    setSaveMessage(null);
  }

  function changeStateIncluded(includeStatePension: boolean) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension,
      statePensionAnnualAmount:
        current.statePensionAnnualAmount ?? baselineStateAmount,
      statePensionAge: current.statePensionAge ?? baselineStateAge,
    }));
    setSaveMessage(null);
  }

  function changeStateAmount(statePensionAnnualAmount: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension: true,
      statePensionAnnualAmount: Math.max(0, Math.round(statePensionAnnualAmount)),
      statePensionAge: current.statePensionAge ?? baselineStateAge,
    }));
    setSaveMessage(null);
  }

  function changeStateAge(statePensionAge: number) {
    setAlternativeDrawdown((current) => ({
      ...current,
      includeStatePension: true,
      statePensionAnnualAmount:
        current.statePensionAnnualAmount ?? baselineStateAmount,
      statePensionAge: Math.min(
        planningAge,
        Math.max(activeScenario.inputs.retirementAge, Math.round(statePensionAge)),
      ),
    }));
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
    setSaveMessage(null);
  }

  function resetExperiment() {
    setAlternativeInputs({ ...activeScenario.inputs });
    setAlternativeDrawdown({ ...baselineDrawdown });
    setSaveMessage(null);
  }

  function saveExperiment() {
    if (alternativeScenario.hasErrors) return;
    const suggestedName = createSuggestedName(
      activeExperiment,
      alternativeInputs,
      alternativeDrawdown,
      alternativeStateIncluded,
      alternativeStateAge,
    );
    const name = window.prompt("Name this scenario", suggestedName)?.trim();
    if (!name) return;
    const scenario = createScenario(name, activeScenario.id);
    updateScenarioPlan(
      scenario.id,
      { ...alternativeInputs },
      { ...alternativeDrawdown },
    );
    setSaveMessage(`${name} has been saved and is ready to compare.`);
  }

  return (
    <main className="planner-page what-if-page">
      <header className="planner-header what-if-header">
        <div>
          <p className="planner-eyebrow">Decision lab · {activeScenario.name}</p>
          <h1>What would happen if you changed one decision?</h1>
          <p>
            Explore one meaningful lever at a time. Every experiment starts from
            the active plan and remains temporary until you choose to save it.
          </p>
        </div>
        <div className="what-if-header-mark" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.lightbulb} fixedWidth />
        </div>
      </header>

      <ExperimentLauncher
        activeExperiment={activeExperiment}
        onSelect={selectExperiment}
      />

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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onRetirementAgeChange={changeRetirementAge}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onEmployeeContributionChange={changeEmployeeContribution}
          onEmployerContributionChange={changeEmployerContribution}
          onExtraContributionEnabledChange={changeExtraContributionEnabled}
          onExtraContributionChange={changeExtraContribution}
          onExtraContributionAgeChange={changeExtraContributionAge}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onTargetIncomeChange={changeTargetIncome}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onFeeChange={changeAnnualFee}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onReturnChange={changeAnnualReturn}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onInflationChange={changeInflation}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onIncludedChange={changeStateIncluded}
          onAnnualAmountChange={changeStateAmount}
          onStartAgeChange={changeStateAge}
          onReset={resetExperiment}
          onSave={saveExperiment}
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
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onAgeChange={changeDownturnAge}
          onPercentageChange={changeDownturnPercentage}
          onReset={resetExperiment}
          onSave={saveExperiment}
        />
      )}
    </main>
  );
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
    return stateIncluded
      ? `State Pension from ${stateAge}`
      : "Without State Pension";
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
