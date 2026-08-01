import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import {
  createBaselineScenario,
  type ScenarioDependencies,
  type ScenarioState,
} from "./Scenario";
import type { ScenarioRepository } from "./ScenarioRepository";
import { ScenarioService } from "./ScenarioService";

class MemoryScenarioRepository implements ScenarioRepository {
  savedStates: ScenarioState[] = [];
  private state: ScenarioState;

  constructor(state: ScenarioState) {
    this.state = state;
  }

  load(): ScenarioState {
    return structuredClone(this.state);
  }

  save(state: ScenarioState): void {
    this.state = structuredClone(state);
    this.savedStates.push(structuredClone(state));
  }
}

function createService() {
  const ids = ["baseline", "scenario-1", "scenario-2", "scenario-3"];
  let timeIndex = 0;
  const dependencies: ScenarioDependencies = {
    createId: () => ids.shift() ?? "fallback-id",
    now: () => `2026-08-01T20:0${timeIndex++}:00.000Z`,
  };
  const baseline = createBaselineScenario(
    createDefaultPensionInputs(),
    dependencies,
  );
  const repository = new MemoryScenarioRepository({
    activeScenarioId: baseline.id,
    scenarios: [baseline],
  });

  return {
    service: new ScenarioService(repository, dependencies),
    repository,
  };
}

describe("ScenarioService", () => {
  it("creates a scenario from the active scenario and selects it", () => {
    const { service, repository } = createService();

    const scenario = service.createScenario("Early Retirement");
    const state = service.getState();

    expect(scenario).toEqual(
      expect.objectContaining({
        id: "scenario-1",
        name: "Early Retirement",
        isBaseline: false,
      }),
    );
    expect(state.activeScenarioId).toBe("scenario-1");
    expect(state.scenarios).toHaveLength(2);
    expect(repository.savedStates).toHaveLength(1);
  });

  it("creates unique names when duplicating the same scenario", () => {
    const { service } = createService();

    const firstCopy = service.duplicateScenario("baseline");
    const secondCopy = service.duplicateScenario("baseline");

    expect(firstCopy.name).toBe("Baseline Plan Copy");
    expect(secondCopy.name).toBe("Baseline Plan Copy 2");
  });

  it("renames scenarios and rejects blank names", () => {
    const { service } = createService();
    const scenario = service.createScenario("Early Retirement");

    const renamed = service.renameScenario(scenario.id, "  Retire at 65  ");

    expect(renamed.name).toBe("Retire at 65");
    expect(() => service.renameScenario(scenario.id, "   ")).toThrow(
      "Scenario name is required.",
    );
  });

  it("updates scenario inputs without mutating the supplied object", () => {
    const { service } = createService();
    const scenario = service.createScenario("Higher Contributions");
    const inputs = {
      ...scenario.inputs,
      monthlyEmployeeContribution: 1_500,
    };

    const updated = service.updateScenarioInputs(scenario.id, inputs);
    inputs.monthlyEmployeeContribution = 10;

    expect(updated.inputs.monthlyEmployeeContribution).toBe(1_500);
    expect(
      service.getActiveScenario().inputs.monthlyEmployeeContribution,
    ).toBe(1_500);
  });

  it("switches the active scenario", () => {
    const { service } = createService();
    const scenario = service.createScenario("Early Retirement");

    service.setActiveScenario("baseline");

    expect(service.getActiveScenario().id).toBe("baseline");
    expect(scenario.id).toBe("scenario-1");
  });

  it("returns to the baseline when the active alternative is deleted", () => {
    const { service } = createService();
    const scenario = service.createScenario("Early Retirement");

    service.deleteScenario(scenario.id);

    const state = service.getState();
    expect(state.activeScenarioId).toBe("baseline");
    expect(state.scenarios).toHaveLength(1);
  });

  it("does not allow the baseline scenario to be deleted", () => {
    const { service } = createService();

    expect(() => service.deleteScenario("baseline")).toThrow(
      "The baseline scenario cannot be deleted.",
    );
  });

  it("returns defensive copies of state", () => {
    const { service } = createService();

    const state = service.getState();
    state.scenarios[0].name = "Mutated";
    state.scenarios[0].inputs.currentPot = 999;

    expect(service.getActiveScenario().name).toBe("Baseline Plan");
    expect(service.getActiveScenario().inputs.currentPot).toBe(0);
  });
});
