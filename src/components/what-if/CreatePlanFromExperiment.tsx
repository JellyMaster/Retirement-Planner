import { useEffect, useState } from "react";

import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";

interface CreatePlanFromExperimentProps {
  activePlanName: string;
  scenario: WhatIfScenario | null;
  onCreate: (name: string, scenario: WhatIfScenario) => void;
}

export function CreatePlanFromExperiment({
  activePlanName,
  scenario,
  onCreate,
}: CreatePlanFromExperimentProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(scenario?.name ?? "");
  }, [scenario]);

  const canCreate = scenario !== null && name.trim().length > 0;

  return (
    <section className="what-if-create-plan" aria-labelledby="what-if-create-plan-title">
      <div className="what-if-create-plan-heading">
        <div>
          <p className="planner-eyebrow">Create a plan</p>
          <h2 id="what-if-create-plan-title">Turn a saved experiment into a plan</h2>
          <p>
            Load the saved experiment you want to use, review the change, then create a separate plan. {activePlanName} will not be changed.
          </p>
        </div>
        <span className={`what-if-create-plan-status${scenario ? " is-ready" : ""}`}>
          {scenario ? "Ready to create" : "No experiment loaded"}
        </span>
      </div>

      {scenario ? (
        <div className="what-if-create-plan-body">
          <div className="what-if-create-plan-review">
            <span>Loaded experiment</span>
            <strong>{scenario.name}</strong>
            <small>{createExperimentSummary(scenario)}</small>
          </div>

          <label className="what-if-create-plan-name">
            <span>New plan name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="New plan name"
            />
            <small>This creates a new plan. Your existing plan stays untouched.</small>
          </label>

          <button
            type="button"
            className="ui-button ui-button-primary ui-button-medium"
            disabled={!canCreate}
            onClick={() => {
              if (!scenario) return;
              onCreate(name.trim(), scenario);
            }}
          >
            Create new plan
          </button>
        </div>
      ) : (
        <div className="what-if-create-plan-empty">
          <strong>Load a saved experiment first</strong>
          <span>
            Select one from the Saved experiments panel above. Loading an experiment does not remove it from your saved list.
          </span>
        </div>
      )}
    </section>
  );
}

function createExperimentSummary(scenario: WhatIfScenario): string {
  switch (scenario.experimentType) {
    case "retirement-age":
      return `Retirement age ${scenario.inputs.retirementAge}`;
    case "contributions":
      return `£${Math.round(scenario.inputs.monthlyEmployeeContribution + scenario.inputs.monthlyEmployerContribution).toLocaleString("en-GB")}/month regular contributions`;
    case "spending":
      return `£${Math.round(scenario.drawdown.desiredAnnualIncome).toLocaleString("en-GB")}/year retirement income target`;
    case "fees":
      return `${(scenario.inputs.annualFee * 100).toFixed(2)}% annual pension fee`;
    case "returns":
      return `${(scenario.inputs.annualReturn * 100).toFixed(1)}% assumed annual return`;
    case "inflation":
      return `${(scenario.inputs.inflation * 100).toFixed(1)}% inflation assumption`;
    case "state-pension":
      return scenario.drawdown.includeStatePension
        ? "State Pension included"
        : "State Pension excluded";
    case "market-downturn":
      return `${Math.round((scenario.inputs.marketDownturnPercentage ?? 0) * 100)}% market fall at age ${scenario.inputs.marketDownturnAge ?? scenario.inputs.currentAge}`;
  }
}
