import { useMemo } from "react";

import {
  createScenarioInsights,
  type Scenario,
} from "../../domain/scenarios";

interface ScenarioInsightsProps {
  scenarios: Scenario[];
  activeScenario: Scenario;
}

export function ScenarioInsights({
  scenarios,
  activeScenario,
}: ScenarioInsightsProps) {
  const groups = useMemo(
    () => createScenarioInsights(scenarios, activeScenario),
    [scenarios, activeScenario],
  );

  return (
    <section className="scenario-insights" aria-labelledby="scenario-insights-title">
      <div className="scenario-manager-section-heading">
        <div>
          <h3 id="scenario-insights-title">Key comparison insights</h3>
          <p>
            Deterministic observations based on the selected plans and their
            projections.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="scenario-insights-empty">
          Select another scenario to generate comparison insights.
        </p>
      ) : (
        <div className="scenario-insights-grid">
          {groups.map((group) => (
            <article className="scenario-insight-group" key={group.scenario.id}>
              <div className="scenario-insight-group-heading">
                <h4>{group.scenario.name}</h4>
                {group.scenario.isBaseline && <span>Baseline</span>}
              </div>

              <ol className="scenario-insight-list">
                {group.insights.map((insight) => (
                  <li
                    key={insight.id}
                    className={`scenario-insight is-${insight.importance}`}
                  >
                    <span className="scenario-insight-importance">
                      {insight.importance}
                    </span>
                    <div>
                      <strong>{insight.title}</strong>
                      <p>{insight.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
