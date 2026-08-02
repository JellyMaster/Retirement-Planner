import { useEffect, useMemo, useState } from "react";

import { RetirementComparisonDashboard } from "../components/comparison/RetirementComparisonDashboard";
import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { formatCurrency } from "../utils/formatters";
import "../styles/what-if-page.css";

export function WhatIfPage() {
  const {
    activeScenario,
    createScenario,
    updateScenarioPlan,
  } = useScenarios();
  const [retirementGoals, setRetirementGoals] = useStoredRetirementGoals();
  const [baselineInputs, setBaselineInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [alternativeInputs, setAlternativeInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const nextInputs = { ...activeScenario.inputs };
    setBaselineInputs(nextInputs);
    setAlternativeInputs(nextInputs);
    setSaveMessage(null);
  }, [activeScenario.id, activeScenario.inputs]);

  const baselineScenario = usePensionProjection(baselineInputs);
  const alternativeScenario = usePensionProjection(alternativeInputs);

  const projectedDifference = useMemo(
    () =>
      alternativeScenario.projection.finalBalance.real -
      baselineScenario.projection.finalBalance.real,
    [
      alternativeScenario.projection.finalBalance.real,
      baselineScenario.projection.finalBalance.real,
    ],
  );

  function resetBaseline() {
    setBaselineInputs({ ...activeScenario.inputs });
  }

  function resetAlternative() {
    setAlternativeInputs({ ...activeScenario.inputs });
    setSaveMessage(null);
  }

  function saveAlternative() {
    const suggestedName = `${activeScenario.name} experiment`;
    const name = window.prompt("Name this scenario", suggestedName)?.trim();

    if (!name) return;

    const scenario = createScenario(name, activeScenario.id);
    updateScenarioPlan(
      scenario.id,
      { ...alternativeInputs },
      {
        ...activeScenario.drawdown,
      },
    );
    setSaveMessage(`${name} has been saved and is ready to compare.`);
  }

  return (
    <main className="planner-page what-if-page">
      <header className="planner-header what-if-header">
        <div>
          <p className="planner-eyebrow">Planning sandbox</p>
          <h1>What If?</h1>
          <p>
            Test changes against {activeScenario.name} without altering the saved
            plan. Keep an experiment only when it is worth comparing later.
          </p>
        </div>

        <button
          type="button"
          className="ui-button ui-button-primary ui-button-medium"
          disabled={alternativeScenario.hasErrors}
          onClick={saveAlternative}
        >
          Save as scenario
        </button>
      </header>

      <section className="what-if-summary" aria-label="Experiment summary">
        <div>
          <span>Current plan</span>
          <strong>{activeScenario.name}</strong>
        </div>
        <div>
          <span>Current projected pot</span>
          <strong>{formatCurrency(baselineScenario.projection.finalBalance.real)}</strong>
        </div>
        <div>
          <span>Alternative projected pot</span>
          <strong>{formatCurrency(alternativeScenario.projection.finalBalance.real)}</strong>
        </div>
        <div>
          <span>Difference</span>
          <strong>
            {projectedDifference >= 0 ? "+" : ""}
            {formatCurrency(projectedDifference)}
          </strong>
        </div>
      </section>

      {saveMessage && (
        <p className="what-if-save-message" role="status">
          {saveMessage}
        </p>
      )}

      <RetirementComparisonDashboard
        baselineInputs={baselineInputs}
        alternativeInputs={alternativeInputs}
        baselineScenario={baselineScenario}
        alternativeScenario={alternativeScenario}
        onBaselineChange={setBaselineInputs}
        onAlternativeChange={(nextInputs) => {
          setAlternativeInputs(nextInputs);
          setSaveMessage(null);
        }}
        onResetBaseline={resetBaseline}
        onResetAlternative={resetAlternative}
        retirementGoals={retirementGoals}
        onRetirementGoalsChange={setRetirementGoals}
      />
    </main>
  );
}
