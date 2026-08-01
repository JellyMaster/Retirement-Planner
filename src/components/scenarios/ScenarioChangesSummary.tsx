import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { Scenario } from "../../domain/scenarios";
import { describeScenarioChanges } from "../../domain/scenarios/describeScenarioChanges";
import { AppIcons } from "../../icons";

interface ScenarioChangesSummaryProps {
  activeScenario: Scenario;
  scenarios: Scenario[];
}

export function ScenarioChangesSummary({
  activeScenario,
  scenarios,
}: ScenarioChangesSummaryProps) {
  const comparedScenarios = scenarios.filter(
    (scenario) => scenario.id !== activeScenario.id,
  );

  return (
    <section
      className="scenario-changes"
      aria-labelledby="scenario-changes-title"
    >
      <div className="scenario-manager-section-heading">
        <div>
          <p className="planner-eyebrow">What changed?</p>
          <h2 id="scenario-changes-title">Changes from the active plan</h2>
        </div>
        <span>Reference: {activeScenario.name}</span>
      </div>

      {comparedScenarios.length === 0 ? (
        <p className="scenario-changes-empty">
          Select another scenario to see which planning assumptions are different.
        </p>
      ) : (
        <div className="scenario-changes-grid">
          {comparedScenarios.map((scenario) => {
            const changes = describeScenarioChanges(
              scenario.inputs,
              activeScenario.inputs,
            );

            return (
              <article className="scenario-changes-card" key={scenario.id}>
                <div className="scenario-changes-card-heading">
                  <span className="scenario-card-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={AppIcons.comparison} />
                  </span>
                  <div>
                    <h3>{scenario.name}</h3>
                    <p>Compared with {activeScenario.name}</p>
                  </div>
                </div>

                {changes.length === 0 ? (
                  <p className="scenario-changes-none">
                    No input changes from the active plan.
                  </p>
                ) : (
                  <ul className="scenario-changes-list">
                    {changes.map((change) => (
                      <li key={change}>{change}</li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
