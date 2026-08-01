import { useScenarios } from "./ScenarioContext";

export function ActiveScenarioSwitcher() {
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();

  return (
    <div className="active-scenario-switcher">
      <label htmlFor="active-scenario-select">Active plan</label>
      <select
        id="active-scenario-select"
        value={activeScenarioId}
        onChange={(event) => setActiveScenario(event.target.value)}
        aria-label="Active plan"
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
