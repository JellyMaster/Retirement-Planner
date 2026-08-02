import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import {
  ScenarioEditModal,
  ScenarioIntelligencePanel,
  useScenarios,
} from "../components/scenarios";
import { calculateScenarioSummary } from "../domain/scenarios/calculateScenarioSummary";
import type { ScenarioDrawdownPreferences } from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import { formatCurrency } from "../utils/formatters";

const MAX_COMPARED_SCENARIOS = 3;

export function CompareScenariosPage() {
  const {
    scenarios,
    activeScenarioId,
    activeScenario,
    createScenario,
    duplicateScenario,
    renameScenario,
    updateScenarioPlan,
    setActiveScenario,
    deleteScenario,
  } = useScenarios();
  const baselineScenario =
    scenarios.find((scenario) => scenario.isBaseline) ?? activeScenario;
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(() => {
    const initial = [activeScenarioId];
    if (activeScenarioId !== baselineScenario.id) initial.push(baselineScenario.id);
    return initial;
  });
  const [newScenarioName, setNewScenarioName] = useState("");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [scenarioEditorId, setScenarioEditorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedScenarios = useMemo(() => {
    const optionalIds = selectedScenarioIds.filter(
      (id) => id !== activeScenarioId,
    );
    const ids = [activeScenarioId, ...optionalIds].slice(
      0,
      MAX_COMPARED_SCENARIOS,
    );

    return ids
      .map((id) => scenarios.find((scenario) => scenario.id === id))
      .filter((scenario) => scenario !== undefined);
  }, [activeScenarioId, scenarios, selectedScenarioIds]);

  const scenarioBeingEdited = scenarios.find(
    (scenario) => scenario.id === scenarioEditorId,
  );

  function handleCreateScenario() {
    try {
      const scenario = createScenario(newScenarioName.trim() || "New Scenario");
      setSelectedScenarioIds((current) =>
        current.length < MAX_COMPARED_SCENARIOS
          ? [...new Set([...current, scenario.id])]
          : current,
      );
      setNewScenarioName("");
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Scenario could not be created.",
      );
    }
  }

  function startRenaming(id: string, name: string) {
    setEditingScenarioId(id);
    setEditingName(name);
    setError(null);
  }

  function saveRename() {
    if (!editingScenarioId) return;

    try {
      renameScenario(editingScenarioId, editingName);
      setEditingScenarioId(null);
      setEditingName("");
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Scenario could not be renamed.",
      );
    }
  }

  function handleScenarioSave(
    inputs: PensionInputs,
    drawdown: ScenarioDrawdownPreferences,
  ) {
    if (!scenarioBeingEdited) return;

    try {
      updateScenarioPlan(scenarioBeingEdited.id, inputs, drawdown);
      if (scenarioBeingEdited.isBaseline) savePensionInputs(inputs);
      setScenarioEditorId(null);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Scenario could not be updated.",
      );
    }
  }

  function handleDelete(id: string) {
    try {
      deleteScenario(id);
      setSelectedScenarioIds((current) =>
        current.filter((scenarioId) => scenarioId !== id),
      );
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Scenario could not be deleted.",
      );
    }
  }

  function handleMakeActive(id: string) {
    setActiveScenario(id);
    setSelectedScenarioIds((current) => [...new Set([id, ...current])]);
  }

  function toggleComparison(id: string) {
    if (id === activeScenarioId) return;

    setSelectedScenarioIds((current) => {
      if (current.includes(id)) {
        return current.filter((scenarioId) => scenarioId !== id);
      }
      if (selectedScenarios.length >= MAX_COMPARED_SCENARIOS) return current;
      return [...current, id];
    });
  }

  return (
    <main className="planner-page scenario-manager-page">
      <header className="scenario-manager-header">
        <div>
          <p className="planner-eyebrow">Compare</p>
          <h1>Explore alternative plans</h1>
          <p>
            Create scenarios, choose up to three plans and compare their projected
            outcomes without changing your baseline.
          </p>
        </div>
        <Link className="ui-button ui-button-primary" to="/plan">
          Review active plan
        </Link>
      </header>

      {error && (
        <div className="scenario-manager-error" role="alert">
          <FontAwesomeIcon icon={AppIcons.warning} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <section
        className="scenario-manager-create"
        aria-labelledby="create-scenario-title"
      >
        <div>
          <p className="planner-eyebrow">New scenario</p>
          <h2 id="create-scenario-title">Start from the active plan</h2>
          <p>
            The new scenario will copy all inputs from{" "}
            <strong>{activeScenario.name}</strong>.
          </p>
        </div>
        <div className="scenario-manager-create-controls">
          <label htmlFor="new-scenario-name">Scenario name</label>
          <input
            id="new-scenario-name"
            value={newScenarioName}
            onChange={(event) => setNewScenarioName(event.target.value)}
            placeholder="For example, Retire at 65"
          />
          <button
            type="button"
            className="ui-button ui-button-primary"
            onClick={handleCreateScenario}
          >
            <FontAwesomeIcon icon={AppIcons.plus} aria-hidden="true" />
            Create scenario
          </button>
        </div>
      </section>

      <section aria-labelledby="scenario-list-title">
        <div className="scenario-manager-section-heading">
          <div>
            <p className="planner-eyebrow">My scenarios</p>
            <h2 id="scenario-list-title">Choose plans to compare</h2>
          </div>
          <span>
            {selectedScenarios.length} of {MAX_COMPARED_SCENARIOS} selected
          </span>
        </div>

        <div className="scenario-manager-grid">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenarioId;
            const isSelected = selectedScenarios.some(
              (selected) => selected.id === scenario.id,
            );
            const summary = calculateScenarioSummary(scenario);

            return (
              <article
                key={scenario.id}
                className={`scenario-card${isActive ? " is-active" : ""}${
                  isSelected ? " is-selected" : ""
                }`}
              >
                <div className="scenario-card-heading">
                  <span className="scenario-card-icon" aria-hidden="true">
                    <FontAwesomeIcon
                      icon={
                        scenario.isBaseline
                          ? AppIcons.pension
                          : AppIcons.comparison
                      }
                    />
                  </span>
                  <div>
                    {editingScenarioId === scenario.id ? (
                      <div className="scenario-card-rename">
                        <label htmlFor={`scenario-name-${scenario.id}`}>
                          Scenario name
                        </label>
                        <input
                          id={`scenario-name-${scenario.id}`}
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                        />
                        <div>
                          <button
                            type="button"
                            className="ui-button ui-button-primary"
                            onClick={saveRename}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="ui-button ui-button-secondary"
                            onClick={() => setEditingScenarioId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="scenario-card-title-row">
                          <h3>{scenario.name}</h3>
                          {scenario.isBaseline && (
                            <span className="scenario-card-badge">Baseline</span>
                          )}
                          {isActive && (
                            <span className="scenario-card-badge is-active">
                              Active
                            </span>
                          )}
                        </div>
                        <p>
                          Updated{" "}
                          {new Date(scenario.updatedAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <label className="scenario-card-compare-toggle">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={
                      isActive ||
                      (!isSelected &&
                        selectedScenarios.length >= MAX_COMPARED_SCENARIOS)
                    }
                    onChange={() => toggleComparison(scenario.id)}
                  />
                  {isActive
                    ? "Active plan included"
                    : scenario.isBaseline
                      ? "Include baseline in comparison"
                      : "Include in comparison"}
                </label>

                <dl className="scenario-card-metrics">
                  <div>
                    <dt>Retirement</dt>
                    <dd>Age {scenario.inputs.retirementAge}</dd>
                  </div>
                  <div>
                    <dt>Projected pot</dt>
                    <dd>
                      {summary.projectedPot === null
                        ? "Unavailable"
                        : formatCurrency(summary.projectedPot)}
                    </dd>
                  </div>
                  <div>
                    <dt>Monthly saving</dt>
                    <dd>{formatCurrency(summary.monthlyContribution)}</dd>
                  </div>
                </dl>

                <div className="scenario-card-actions">
                  <button
                    type="button"
                    className="ui-button ui-button-primary"
                    onClick={() => setScenarioEditorId(scenario.id)}
                  >
                    Edit scenario
                  </button>
                  {!isActive && (
                    <button
                      type="button"
                      className="ui-button ui-button-secondary"
                      onClick={() => handleMakeActive(scenario.id)}
                    >
                      Make active
                    </button>
                  )}
                  <button
                    type="button"
                    className="ui-button ui-button-secondary"
                    onClick={() => duplicateScenario(scenario.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="ui-button ui-button-secondary"
                    onClick={() => startRenaming(scenario.id, scenario.name)}
                  >
                    Rename
                  </button>
                  {!scenario.isBaseline && (
                    <button
                      type="button"
                      className="ui-button ui-button-secondary"
                      onClick={() => handleDelete(scenario.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ScenarioIntelligencePanel
        activeScenario={activeScenario}
        scenarios={selectedScenarios}
      />

      {scenarioBeingEdited && (
        <ScenarioEditModal
          scenario={scenarioBeingEdited}
          onClose={() => setScenarioEditorId(null)}
          onSave={handleScenarioSave}
        />
      )}
    </main>
  );
}
