import { useScenarios } from "./ScenarioContext";

interface ActiveScenarioSwitcherProps {
  onBeforeChange?: (nextScenarioId: string) => boolean;
}

export function ActiveScenarioSwitcher({ onBeforeChange }: ActiveScenarioSwitcherProps) {
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();

  function handleChange(nextScenarioId: string) {
    if (nextScenarioId === activeScenarioId) return;
    if (onBeforeChange && !onBeforeChange(nextScenarioId)) return;
    setActiveScenario(nextScenarioId);
  }

  return (
    <div className="active-scenario-switcher">
      <span className="active-scenario-switcher-label">Active Plan</span>
      <select
        id="active-scenario-select"
        value={activeScenarioId}
        onChange={(event) => handleChange(event.target.value)}
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
