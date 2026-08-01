import { useScenarios } from "./ScenarioContext";

export function ActiveScenarioSwitcher() {
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();

  return (
    <div className="active-scenario-switcher">
       <span className="active-scenario-switcher-label">
    Active Plan
  </span>
      <select
        id="active-scenario-select"
        value={activeScenarioId}
        onChange={(event) => setActiveScenario(event.target.value)}
        aria-label="Active plan"
        title="Change active plan"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
            {scenario.isBaseline ? " · Baseline" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
