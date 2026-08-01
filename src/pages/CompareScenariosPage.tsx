import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { useScenarios } from "../components/scenarios";
import { AppIcons } from "../icons";
import { formatCurrency } from "../utils/formatters";

export function CompareScenariosPage() {
  const {
    scenarios,
    activeScenarioId,
    activeScenario,
    createScenario,
    duplicateScenario,
    renameScenario,
    setActiveScenario,
    deleteScenario,
  } = useScenarios();
  const [newScenarioName, setNewScenarioName] = useState("");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreateScenario() {
    try {
      const name = newScenarioName.trim() || "New Scenario";
      createScenario(name);
      setNewScenarioName("");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Scenario could not be created.");
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
      setError(caught instanceof Error ? caught.message : "Scenario could not be renamed.");
    }
  }

  function handleDelete(id: string) {
    try {
      deleteScenario(id);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Scenario could not be deleted.");
    }
  }

  return (
    <main className="planner-page scenario-manager-page">
      <header className="scenario-manager-header">
        <div>
          <p className="planner-eyebrow">Compare</p>
          <h1>Explore alternative plans</h1>
          <p>
            Create scenarios from your current plan, then adjust and compare them
            without changing the baseline.
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

      <section className="scenario-manager-create" aria-labelledby="create-scenario-title">
        <div>
          <p className="planner-eyebrow">New scenario</p>
          <h2 id="create-scenario-title">Start from the active plan</h2>
          <p>
            The new scenario will copy all inputs from <strong>{activeScenario.name}</strong>.
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
          <button type="button" className="ui-button ui-button-primary" onClick={handleCreateScenario}>
            <FontAwesomeIcon icon={AppIcons.plus} aria-hidden="true" />
            Create scenario
          </button>
        </div>
      </section>

      <section aria-labelledby="scenario-list-title">
        <div className="scenario-manager-section-heading">
          <div>
            <p className="planner-eyebrow">My scenarios</p>
            <h2 id="scenario-list-title">Choose a plan to work with</h2>
          </div>
          <span>{scenarios.length} {scenarios.length === 1 ? "scenario" : "scenarios"}</span>
        </div>

        <div className="scenario-manager-grid">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenarioId;
            const monthlyContribution =
              scenario.inputs.monthlyEmployeeContribution +
              scenario.inputs.monthlyEmployerContribution;

            return (
              <article
                key={scenario.id}
                className={`scenario-card${isActive ? " is-active" : ""}`}
              >
                <div className="scenario-card-heading">
                  <span className="scenario-card-icon" aria-hidden="true">
                    <FontAwesomeIcon
                      icon={scenario.isBaseline ? AppIcons.pension : AppIcons.comparison}
                    />
                  </span>
                  <div>
                    {editingScenarioId === scenario.id ? (
                      <div className="scenario-card-rename">
                        <label htmlFor={`scenario-name-${scenario.id}`}>Scenario name</label>
                        <input
                          id={`scenario-name-${scenario.id}`}
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                        />
                        <div>
                          <button type="button" className="ui-button ui-button-primary" onClick={saveRename}>
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
                          {scenario.isBaseline && <span className="scenario-card-badge">Baseline</span>}
                          {isActive && <span className="scenario-card-badge is-active">Active</span>}
                        </div>
                        <p>Updated {new Date(scenario.updatedAt).toLocaleDateString("en-GB")}</p>
                      </>
                    )}
                  </div>
                </div>

                <dl className="scenario-card-metrics">
                  <div>
                    <dt>Retirement</dt>
                    <dd>Age {scenario.inputs.retirementAge}</dd>
                  </div>
                  <div>
                    <dt>Current pension</dt>
                    <dd>{formatCurrency(scenario.inputs.currentPot)}</dd>
                  </div>
                  <div>
                    <dt>Monthly saving</dt>
                    <dd>{formatCurrency(monthlyContribution)}</dd>
                  </div>
                </dl>

                <div className="scenario-card-actions">
                  {!isActive && (
                    <button
                      type="button"
                      className="ui-button ui-button-primary"
                      onClick={() => setActiveScenario(scenario.id)}
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
    </main>
  );
}
