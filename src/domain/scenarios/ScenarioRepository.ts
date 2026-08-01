import type { ScenarioState } from "./Scenario";

export interface ScenarioRepository {
  load(): ScenarioState;
  save(state: ScenarioState): void;
}
