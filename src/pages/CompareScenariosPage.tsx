import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import {
  ScenarioChangesSummary,
  ScenarioEditModal,
  useScenarios,
} from "../components/scenarios";
import { calculateScenarioSummary } from "../domain/scenarios/calculateScenarioSummary";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import { formatCurrency } from "../utils/formatters";

const MAX_COMPARED_SCENARIOS = 3;

type ScenarioSummary = ReturnType<typeof calculateScenarioSummary>;
type ComparisonDirection = "greater" | "less" | "same";

interface ComparisonIndicator {
  direction: ComparisonDirection;
  label: string;
}

export function CompareScenariosPage() {
  const {
    scenarios,
    activeScenarioId,
    activeScenario,
    createScenario,
    duplicateScenario,
    renameScenario,
    updateScenarioInputs,
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
    const requiredIds = [...new Set([activeScenarioId, baselineScenario.id])];
    const optionalIds = selectedScenarioIds.filter(
      (id) => !requiredIds.includes(id),
    );
    const ids = [...requiredIds, ...optionalIds].slice(
      0,
      MAX_COMPARED_SCENARIOS,
    );

    return ids
      .map((id) => scenarios.find((scenario) => scenario.id === id))
      .filter((scenario) => scenario !== undefined);
  }, [activeScenarioId, baselineScenario.id, scenarios, selectedScenarioIds]);

  const scenarioBeingEdited = scenarios.find(
    (scenario) => scenario.id === scenarioEditorId,
  );

  const summaries = useMemo(
    () => selectedScenarios.map(calculateScenarioSummary),
    [selectedScenarios],
  );
  const activeSummary = useMemo(
    () => calculateScenarioSummary(activeScenario),
    [activeScenario],
  );

  function handleCreateScenario() {
    try {
      const name = newScenarioName.trim() || "New Scenario";
      const scenario = createScenario(name);
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

  function handleScenarioSave(inputs: PensionInputs) {
    if (!scenarioBeingEdited) return;

    try {
      updateScenarioInputs(scenarioBeingEdited.id, inputs);
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
    setSelectedScenarioIds((current) => [
      ...new Set([id, baselineScenario.id, ...current]),
    ]);
  }

  function toggleComparison(id: string) {
    if (id === baselineScenario.id || id === activeScenarioId) return;

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
                      scenario.isBaseline ||
                      isActive ||
                      (!isSelected &&
                        selectedScenarios.length >= MAX_COMPARED_SCENARIOS)
                    }
                    onChange={() => toggleComparison(scenario.id)}
                  />
                  {scenario.isBaseline
                    ? "Always included"
                    : isActive
                      ? "Active plan included"
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

      <ScenarioChangesSummary
        activeScenario={activeScenario}
        scenarios={selectedScenarios}
      />

      <section
        className="scenario-comparison"
        aria-labelledby="scenario-comparison-title"
      >
        <div className="scenario-manager-section-heading">
          <div>
            <p className="planner-eyebrow">Scenario intelligence</p>
            <h2 id="scenario-comparison-title">Compare projected outcomes</h2>
          </div>
          <span>Compared with the active plan · values in today&apos;s money</span>
        </div>

        <div className="scenario-comparison-table-wrap">
          <table className="scenario-comparison-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                {summaries.map((summary) => {
                  const isActive = summary.scenario.id === activeScenarioId;
                  return (
                    <th
                      scope="col"
                      key={summary.scenario.id}
                      className={isActive ? "is-active-plan" : undefined}
                    >
                      <span>{summary.scenario.name}</span>
                      {isActive && (
                        <span className="scenario-comparison-active-badge">
                          Active plan
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Retirement age"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) =>
                  `Age ${summary.scenario.inputs.retirementAge}`
                }
                indicator={(summary) =>
                  createNumberIndicator(
                    summary.scenario.inputs.retirementAge,
                    activeSummary.scenario.inputs.retirementAge,
                    " years",
                  )
                }
              />
              <ComparisonRow
                label="Monthly saving"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) =>
                  formatCurrency(summary.monthlyContribution)
                }
                indicator={(summary) =>
                  createCurrencyIndicator(
                    summary.monthlyContribution,
                    activeSummary.monthlyContribution,
                  )
                }
              />
              <ComparisonRow
                label="Projected pension pot"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) =>
                  formatOptionalCurrency(summary.projectedPot)
                }
                indicator={(summary) =>
                  createOptionalCurrencyIndicator(
                    summary.projectedPot,
                    activeSummary.projectedPot,
                  )
                }
              />
              <ComparisonRow
                label="Total contributions"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) =>
                  formatOptionalCurrency(summary.totalContributions)
                }
                indicator={(summary) =>
                  createOptionalCurrencyIndicator(
                    summary.totalContributions,
                    activeSummary.totalContributions,
                  )
                }
              />
              <ComparisonRow
                label="Investment growth"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) =>
                  formatOptionalCurrency(summary.investmentGrowth)
                }
                indicator={(summary) =>
                  createOptionalCurrencyIndicator(
                    summary.investmentGrowth,
                    activeSummary.investmentGrowth,
                  )
                }
              />
              <ComparisonRow
                label="Total fees"
                summaries={summaries}
                activeScenarioId={activeScenarioId}
                value={(summary) => formatOptionalCurrency(summary.totalFees)}
                indicator={(summary) =>
                  createOptionalCurrencyIndicator(
                    summary.totalFees,
                    activeSummary.totalFees,
                  )
                }
              />
            </tbody>
          </table>
        </div>
      </section>

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

interface ComparisonRowProps {
  label: string;
  summaries: ScenarioSummary[];
  activeScenarioId: string;
  value: (summary: ScenarioSummary) => string;
  indicator: (summary: ScenarioSummary) => ComparisonIndicator | null;
}

function ComparisonRow({
  label,
  summaries,
  activeScenarioId,
  value,
  indicator,
}: ComparisonRowProps) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {summaries.map((summary) => {
        const isActive = summary.scenario.id === activeScenarioId;
        const comparison = isActive ? null : indicator(summary);

        return (
          <td
            key={summary.scenario.id}
            className={isActive ? "is-active-plan" : undefined}
          >
            <strong>{value(summary)}</strong>
            {isActive ? (
              <span className="scenario-comparison-reference">
                Current active plan
              </span>
            ) : (
              comparison && (
                <span
                  className={`scenario-comparison-indicator is-${comparison.direction}`}
                >
                  <span aria-hidden="true">
                    {comparison.direction === "greater"
                      ? "↑"
                      : comparison.direction === "less"
                        ? "↓"
                        : "="}
                  </span>{" "}
                  {comparison.label}
                </span>
              )
            )}
          </td>
        );
      })}
    </tr>
  );
}

function formatOptionalCurrency(value: number | null): string {
  return value === null ? "Unavailable" : formatCurrency(value);
}

function createOptionalCurrencyIndicator(
  value: number | null,
  activeValue: number | null,
): ComparisonIndicator | null {
  if (value === null || activeValue === null) return null;
  return createCurrencyIndicator(value, activeValue);
}

function createCurrencyIndicator(
  value: number,
  activeValue: number,
): ComparisonIndicator {
  const difference = value - activeValue;
  if (Math.abs(difference) < 0.5) {
    return { direction: "same", label: "Same as active plan" };
  }

  return {
    direction: difference > 0 ? "greater" : "less",
    label: `${difference > 0 ? "Greater" : "Less"} by ${formatCurrency(
      Math.abs(difference),
    )}`,
  };
}

function createNumberIndicator(
  value: number,
  activeValue: number,
  suffix = "",
): ComparisonIndicator {
  const difference = value - activeValue;
  if (difference === 0) {
    return { direction: "same", label: "Same as active plan" };
  }

  return {
    direction: difference > 0 ? "greater" : "less",
    label: `${difference > 0 ? "Greater" : "Less"} by ${Math.abs(
      difference,
    )}${suffix}`,
  };
}
