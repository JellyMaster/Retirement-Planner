import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { calculateRetirementHealth } from "../components/goals/calculateRetirementHealth";
import { useScenarios } from "../components/scenarios";
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
  const baselineExtraContribution =
    activeScenario.inputs.extraMonthlyContribution ?? 0;
  const [includeExtraContributions, setIncludeExtraContributions] = useState(
    baselineExtraContribution > 0,
  );
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState(
    baselineExtraContribution,
  );
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

  function rebuildExperiment(
    retirementAge: number,
    includeExtra: boolean,
    extraAmount: number,
  ) {
    setAlternativeInputs(
      createRetirementAgeExperimentInputs(
        activeScenario.inputs,
        retirementAge,
        includeExtra,
        extraAmount,
      ),
    );
    setSaveMessage(null);
  }

  function changeRetirementAge(retirementAge: number) {
    rebuildExperiment(
      retirementAge,
      includeExtraContributions,
      extraMonthlyContribution,
    );
  }

  function changeExtraContributionEnabled(enabled: boolean) {
    setIncludeExtraContributions(enabled);
    rebuildExperiment(
      alternativeInputs.retirementAge,
      enabled,
      extraMonthlyContribution,
    );
  }

  function changeExtraMonthlyContribution(amount: number) {
    setExtraMonthlyContribution(amount);
    rebuildExperiment(
      alternativeInputs.retirementAge,
      includeExtraContributions,
      amount,
    );
  }

  function resetExperiment() {
    setIncludeExtraContributions(baselineExtraContribution > 0);
    setExtraMonthlyContribution(baselineExtraContribution);
    setAlternativeInputs({ ...activeScenario.inputs });
    setSaveMessage(null);
  }

  function saveExperiment() {
    if (alternativeScenario.hasErrors) return;

    const suggestedName = `Retire at ${alternativeInputs.retirementAge}`;
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
        onSelect={setActiveExperiment}
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
          includeExtraContributions={includeExtraContributions}
          extraMonthlyContribution={extraMonthlyContribution}
          baselineExtraMonthlyContribution={baselineExtraContribution}
          canSave={!alternativeScenario.hasErrors}
          saveMessage={saveMessage}
          onRetirementAgeChange={changeRetirementAge}
          onExtraContributionEnabledChange={changeExtraContributionEnabled}
          onExtraMonthlyContributionChange={changeExtraMonthlyContribution}
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
  includeExtraContributions: boolean,
  extraMonthlyContribution: number,
): PensionInputs {
  const nextInputs: PensionInputs = {
    ...baselineInputs,
    retirementAge,
  };

  delete nextInputs.extraContributionAge;
  delete nextInputs.extraMonthlyContribution;

  if (
    includeExtraContributions &&
    extraMonthlyContribution > 0 &&
    retirementAge > baselineInputs.currentAge
  ) {
    const savedStartAge = baselineInputs.extraContributionAge;
    nextInputs.extraContributionAge =
      savedStartAge !== undefined && savedStartAge < retirementAge
        ? savedStartAge
        : baselineInputs.currentAge;
    nextInputs.extraMonthlyContribution = extraMonthlyContribution;
  }

  return nextInputs;
}
