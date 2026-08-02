import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { useScenarios } from "../components/scenarios";
import { ContributionExperiment } from "../components/what-if/ContributionExperiment";
import {
  ExperimentLauncher,
  type ExperimentId,
} from "../components/what-if/ExperimentLauncher";
import { RetirementAgeExperiment } from "../components/what-if/RetirementAgeExperiment";
import { createDefaultScenarioDrawdownPreferences } from "../domain/scenarios";
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
  const [activeExperiment, setActiveExperiment] =
    useState<ExperimentId>("retirement-age");
  const [alternativeInputs, setAlternativeInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const baselineScenario = usePensionProjection(activeScenario.inputs);
  const alternativeScenario = usePensionProjection(alternativeInputs);
  const baselineHealth = baselineScenario.hasErrors
    ? null
    : calculateRetirementHealth(baselineScenario.projection, retirementGoals);
  const alternativeHealth = alternativeScenario.hasErrors
    ? null
    : calculateRetirementHealth(alternativeScenario.projection, retirementGoals);
  const planningAge =
    activeScenario.drawdown?.planningAge ??
    createDefaultScenarioDrawdownPreferences().planningAge;
  const baselineExtraContribution =
    activeScenario.inputs.extraMonthlyContribution ?? 0;
  const baselineExtraContributionAge =
    activeScenario.inputs.extraContributionAge ??
    Math.min(
      activeScenario.inputs.retirementAge - 1,
      activeScenario.inputs.currentAge + 1,
    );

  function selectExperiment(experiment: ExperimentId) {
    setActiveExperiment(experiment);
    setAlternativeInputs({ ...activeScenario.inputs });
    setSaveMessage(null);
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
        current.extraContributionAge ??
        Math.min(
          baselineExtraContributionAge,
          Math.max(current.currentAge, current.retirementAge - 1),
        ),
      extraMonthlyContribution: amount,
    }));
    setSaveMessage(null);
  }

  function resetExperiment() {
    setAlternativeInputs({ ...activeScenario.inputs });
    setSaveMessage(null);
  }

  function saveExperiment() {
    if (alternativeScenario.hasErrors) return;

    const suggestedName =
      activeExperiment === "contributions"
        ? `Save ${Math.round(
            alternativeInputs.monthlyEmployeeContribution +
              alternativeInputs.monthlyEmployerContribution,
          )} monthly`
        : `Retire at ${alternativeInputs.retirementAge}`;
    const name = window.prompt("Name this scenario", suggestedName)?.trim();
    if (!name) return;

    const scenario = createScenario(name, activeScenario.id);
    updateScenarioPlan(
      scenario.id,
      { ...alternativeInputs },
      {
        ...(activeScenario.drawdown ??
          createDefaultScenarioDrawdownPreferences()),
      },
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
          statePensionAge={retirementGoals.statePensionAge}
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
          baselineEmployeeContribution={
            activeScenario.inputs.monthlyEmployeeContribution
          }
          employeeContribution={alternativeInputs.monthlyEmployeeContribution}
          baselineEmployerContribution={
            activeScenario.inputs.monthlyEmployerContribution
          }
          employerContribution={alternativeInputs.monthlyEmployerContribution}
          baselineExtraContribution={baselineExtraContribution}
          extraContribution={
            alternativeInputs.extraMonthlyContribution ??
            (baselineExtraContribution || 250)
          }
          extraContributionAge={
            alternativeInputs.extraContributionAge ?? baselineExtraContributionAge
          }
          includeExtraContribution={
            alternativeInputs.extraContributionAge !== undefined &&
            alternativeInputs.extraMonthlyContribution !== undefined
          }
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
          onReset={resetExperiment}
          onSave={saveExperiment}
        />
      )}
    </main>
  );
}

function createRetirementAgeExperimentInputs(
  baselineInputs: PensionInputs,
  retirementAge: number,
): PensionInputs {
  const nextInputs: PensionInputs = {
    ...baselineInputs,
    retirementAge,
  };

  if (
    nextInputs.extraContributionAge !== undefined &&
    nextInputs.extraContributionAge >= retirementAge
  ) {
    delete nextInputs.extraContributionAge;
    delete nextInputs.extraMonthlyContribution;
  }

  return nextInputs;
}
