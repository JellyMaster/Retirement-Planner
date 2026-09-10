import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import { AppIcons } from "../../icons";
import type { ExperimentId } from "./ExperimentLauncher";

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

  function deleteScenario(scenario: WhatIfScenario) {
    if (!window.confirm(`Delete ${scenario.name}? This saved experiment cannot be restored.`)) {
      return;
    }
    setOpenMenuId(null);
    onDelete(scenario.id);
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
          onClick={() => setCollapsed((current) => !current)}
        >
          <span className="what-if-saved-panel-count" aria-label={`${scenarios.length} saved`}>
            {scenarios.length}
          </span>
          <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
        </button>
      </div>

      {!collapsed && (
        <>
          <p className="what-if-saved-panel-copy">
            Saved {formatExperimentName(activeExperiment).toLowerCase()} ideas for {activePlanName}.
          </p>

          {scenarios.length > 0 ? (
            <div className="what-if-saved-panel-list">
              {scenarios.map((scenario) => {
                const isLoaded = loadedScenarioId === scenario.id;
                const menuOpen = openMenuId === scenario.id;

                return (
                  <article
                    key={scenario.id}
                    className={`what-if-saved-panel-card${isLoaded ? " is-loaded" : ""}`}
                  >
                    <button
                      type="button"
                      className="what-if-saved-panel-card-main"
                      aria-label={`Load ${scenario.name}`}
                      aria-pressed={isLoaded}
                      onClick={() => onLoad(scenario)}
                    >
                      <strong>{scenario.name}</strong>
                      <span>{createExperimentSummary(scenario)}</span>
                    </button>

                    <div className="what-if-saved-panel-card-actions">
                      {isLoaded && (
                        <button
                          type="button"
                          className="what-if-saved-panel-unload"
                          onClick={onUnload}
                        >
                          Unload
                        </button>
                      )}
                      <div className="what-if-saved-panel-menu-wrap">
                        <button
                          type="button"
                          className="what-if-saved-panel-more"
                          aria-label={`More actions for ${scenario.name}`}
                          aria-expanded={menuOpen}
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === scenario.id ? null : scenario.id,
                            )
                          }
                        >
                          <span aria-hidden="true">•••</span>
                        </button>
                        {menuOpen && (
                          <div className="what-if-saved-panel-menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className="is-danger"
                              onClick={() => deleteScenario(scenario)}
                            >
                              Delete experiment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isLoaded && (
                      <span className="what-if-saved-panel-loaded">Loaded</span>
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
            Loading applies a saved idea temporarily. Unloading returns this experiment to {activePlanName} without deleting anything.
          </p>
        </>
      )}
    </aside>
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
