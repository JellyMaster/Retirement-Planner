import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import { AppIcons } from "../../icons";
import type { ExperimentId } from "./ExperimentLauncher";
import "../../styles/what-if-applied-experiments.css";

interface SavedExperimentsPanelProps {
  activeExperiment: ExperimentId;
  activePlanName: string;
  scenarios: WhatIfScenario[];
  loadedScenarioId: string | null;
  onLoad: (scenario: WhatIfScenario) => void;
  onUnload: () => void;
  onDelete: (scenarioId: string) => void;
}

export function SavedExperimentsPanel({
  activeExperiment,
  activePlanName,
  scenarios,
  loadedScenarioId,
  onLoad,
  onUnload,
  onDelete,
}: SavedExperimentsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const appliedScenario = scenarios.find((scenario) => scenario.id === loadedScenarioId) ?? null;

  function closeMenu() {
    setOpenMenuId(null);
    setPendingDeleteId(null);
  }

  function confirmDelete(scenarioId: string) {
    onDelete(scenarioId);
    closeMenu();
  }

  return (
    <aside
      className={`what-if-saved-panel${collapsed ? " is-collapsed" : ""}`}
      aria-label={`Saved ${formatExperimentName(activeExperiment)} experiments`}
    >
      <div className="what-if-saved-panel-header">
        <div className="what-if-saved-panel-title">
          <span className="what-if-saved-panel-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.assumptions} fixedWidth />
          </span>
          {!collapsed && (
            <div>
              <strong>Saved experiments</strong>
              <span>{formatExperimentName(activeExperiment)}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="what-if-saved-panel-collapse"
          aria-label={collapsed ? "Expand saved experiments" : "Collapse saved experiments"}
          aria-expanded={!collapsed}
          onClick={() => {
            setCollapsed((current) => !current);
            closeMenu();
          }}
        >
          <span className="what-if-saved-panel-count" aria-label={`${scenarios.length} saved`}>
            {scenarios.length}
          </span>
          <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
        </button>
      </div>

      {!collapsed && (
        <>
          <AppliedExperimentStatus
            scenario={appliedScenario}
            activePlanName={activePlanName}
            onStopApplying={onUnload}
          />

          <p className="what-if-saved-panel-copy">
            Saved {formatExperimentName(activeExperiment).toLowerCase()} ideas for {activePlanName}.
          </p>

          {scenarios.length > 0 ? (
            <div className="what-if-saved-panel-list">
              {scenarios.map((scenario) => {
                const isApplied = loadedScenarioId === scenario.id;
                const menuOpen = openMenuId === scenario.id;
                const confirmingDelete = pendingDeleteId === scenario.id;

                return (
                  <article
                    key={scenario.id}
                    className={`what-if-saved-panel-card${isApplied ? " is-loaded is-applied" : ""}`}
                  >
                    <div className="what-if-saved-panel-card-main">
                      <strong>{scenario.name}</strong>
                      <span>{createExperimentSummary(scenario)}</span>
                    </div>

                    <div className="what-if-saved-panel-card-actions">
                      {isApplied ? (
                        <button
                          type="button"
                          className="what-if-saved-panel-unload what-if-saved-panel-stop-applying"
                          onClick={onUnload}
                        >
                          Stop applying
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="what-if-saved-panel-apply"
                          aria-label={`Apply ${scenario.name}`}
                          onClick={() => onLoad(scenario)}
                        >
                          Apply
                        </button>
                      )}

                      <div className="what-if-saved-panel-menu-wrap">
                        <button
                          type="button"
                          className="what-if-saved-panel-more"
                          aria-label={`More actions for ${scenario.name}`}
                          aria-expanded={menuOpen}
                          onClick={() => {
                            if (menuOpen) {
                              closeMenu();
                              return;
                            }
                            setOpenMenuId(scenario.id);
                            setPendingDeleteId(null);
                          }}
                        >
                          <span aria-hidden="true">•••</span>
                        </button>
                        {menuOpen && (
                          <div className="what-if-saved-panel-menu" role="menu">
                            {confirmingDelete ? (
                              <>
                                <span className="what-if-saved-panel-delete-copy">
                                  Delete this saved experiment?
                                </span>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="is-danger"
                                  onClick={() => confirmDelete(scenario.id)}
                                >
                                  Delete permanently
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => setPendingDeleteId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                role="menuitem"
                                className="is-danger"
                                onClick={() => setPendingDeleteId(scenario.id)}
                              >
                                Delete experiment
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isApplied && (
                      <span className="what-if-saved-panel-loaded what-if-saved-panel-applied">
                        Applied
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="what-if-saved-panel-empty">
              <strong>No saved experiments yet</strong>
              <span>Try a change, then save it if you want to revisit it.</span>
            </div>
          )}

          <p className="what-if-saved-panel-note">
            Apply a saved idea to use it in this What If. Stop applying returns this experiment to {activePlanName} without deleting the saved idea.
          </p>
        </>
      )}
    </aside>
  );
}

interface AppliedExperimentStatusProps {
  scenario: WhatIfScenario | null;
  activePlanName: string;
  onStopApplying: () => void;
}

function AppliedExperimentStatus({
  scenario,
  activePlanName,
  onStopApplying,
}: AppliedExperimentStatusProps) {
  if (!scenario) {
    return (
      <div className="what-if-applied-status is-empty">
        <span className="what-if-applied-status-label">Exploring from {activePlanName}</span>
        <strong>No saved experiment applied</strong>
      </div>
    );
  }

  return (
    <div className="what-if-applied-status" aria-live="polite">
      <div>
        <span className="what-if-applied-status-label">Applied experiment</span>
        <strong>{scenario.name}</strong>
        <small>{createExperimentSummary(scenario)}</small>
      </div>
      <button type="button" onClick={onStopApplying}>
        Stop applying
      </button>
    </div>
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

function createExperimentSummary(scenario: WhatIfScenario): string {
  switch (scenario.experimentType) {
    case "retirement-age":
      return `Age ${scenario.inputs.retirementAge}`;
    case "contributions":
      return `£${Math.round(scenario.inputs.monthlyEmployeeContribution + scenario.inputs.monthlyEmployerContribution).toLocaleString("en-GB")}/month`;
    case "spending":
      return `£${Math.round(scenario.drawdown.desiredAnnualIncome).toLocaleString("en-GB")}/year target`;
    case "fees":
      return `${(scenario.inputs.annualFee * 100).toFixed(2)}% annual fee`;
    case "returns":
      return `${(scenario.inputs.annualReturn * 100).toFixed(1)}% assumed return`;
    case "inflation":
      return `${(scenario.inputs.inflation * 100).toFixed(1)}% inflation`;
    case "state-pension":
      return scenario.drawdown.includeStatePension ? "State Pension included" : "State Pension excluded";
    case "market-downturn":
      return `${Math.round((scenario.inputs.marketDownturnPercentage ?? 0) * 100)}% fall at age ${scenario.inputs.marketDownturnAge ?? scenario.inputs.currentAge}`;
  }
}
