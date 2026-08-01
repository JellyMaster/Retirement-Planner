import type { PensionInputs } from "../../engine/models/PensionInputs";
import {
  duplicateScenario,
  type Scenario,
  type ScenarioDependencies,
  type ScenarioId,
  type ScenarioState,
} from "./Scenario";
import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "./ScenarioDrawdownPreferences";
import type { ScenarioRepository } from "./ScenarioRepository";

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    inputs: { ...scenario.inputs },
    drawdown: {
      ...(scenario.drawdown ?? createDefaultScenarioDrawdownPreferences()),
    },
  };
}

function cloneState(state: ScenarioState): ScenarioState {
  return {
    activeScenarioId: state.activeScenarioId,
    scenarios: state.scenarios.map(cloneScenario),
  };
}

function normaliseName(name: string): string {
  const normalised = name.trim();
  if (!normalised) throw new Error("Scenario name is required.");
  return normalised;
}

export class ScenarioService {
  private state: ScenarioState;
  private readonly repository: ScenarioRepository;
  private readonly dependencies: ScenarioDependencies;

  constructor(
    repository: ScenarioRepository,
    dependencies: ScenarioDependencies,
  ) {
    this.repository = repository;
    this.dependencies = dependencies;
    this.state = repository.load();
  }

  getState(): ScenarioState {
    return cloneState(this.state);
  }

  getActiveScenario(): Scenario {
    const active = this.state.scenarios.find(
      (scenario) => scenario.id === this.state.activeScenarioId,
    );

    if (!active) throw new Error("Active scenario could not be found.");
    return cloneScenario(active);
  }

  createScenario(name: string, sourceId = this.state.activeScenarioId): Scenario {
    const source = this.requireScenario(sourceId);
    const scenario = duplicateScenario(
      source,
      normaliseName(name),
      this.dependencies,
    );

    this.commit({
      activeScenarioId: scenario.id,
      scenarios: [...this.state.scenarios, scenario],
    });

    return cloneScenario(scenario);
  }

  duplicateScenario(id: ScenarioId): Scenario {
    const source = this.requireScenario(id);
    return this.createScenario(this.createCopyName(source.name), id);
  }

  renameScenario(id: ScenarioId, name: string): Scenario {
    const scenario = this.requireScenario(id);
    const updated: Scenario = {
      ...scenario,
      name: normaliseName(name),
      updatedAt: this.dependencies.now(),
    };

    this.replaceScenario(updated);
    return cloneScenario(updated);
  }

  updateScenarioInputs(id: ScenarioId, inputs: PensionInputs): Scenario {
    const scenario = this.requireScenario(id);
    const updated: Scenario = {
      ...scenario,
      updatedAt: this.dependencies.now(),
      inputs: { ...inputs },
    };

    this.replaceScenario(updated);
    return cloneScenario(updated);
  }

  updateScenarioPlan(
    id: ScenarioId,
    inputs: PensionInputs,
    drawdown: ScenarioDrawdownPreferences,
  ): Scenario {
    const scenario = this.requireScenario(id);
    const updated: Scenario = {
      ...scenario,
      updatedAt: this.dependencies.now(),
      inputs: { ...inputs },
      drawdown: { ...drawdown },
    };

    this.replaceScenario(updated);
    return cloneScenario(updated);
  }

  setActiveScenario(id: ScenarioId): void {
    this.requireScenario(id);
    this.commit({ ...this.state, activeScenarioId: id });
  }

  deleteScenario(id: ScenarioId): void {
    const scenario = this.requireScenario(id);
    if (scenario.isBaseline) {
      throw new Error("The baseline scenario cannot be deleted.");
    }

    const scenarios = this.state.scenarios.filter(
      (candidate) => candidate.id !== id,
    );
    const activeScenarioId =
      this.state.activeScenarioId === id
        ? this.requireBaseline().id
        : this.state.activeScenarioId;

    this.commit({ activeScenarioId, scenarios });
  }

  private requireScenario(id: ScenarioId): Scenario {
    const scenario = this.state.scenarios.find(
      (candidate) => candidate.id === id,
    );
    if (!scenario) throw new Error(`Scenario ${id} could not be found.`);
    return scenario;
  }

  private requireBaseline(): Scenario {
    const baseline = this.state.scenarios.find(
      (scenario) => scenario.isBaseline,
    );
    if (!baseline) throw new Error("Baseline scenario could not be found.");
    return baseline;
  }

  private replaceScenario(updated: Scenario): void {
    this.commit({
      ...this.state,
      scenarios: this.state.scenarios.map((scenario) =>
        scenario.id === updated.id ? updated : scenario,
      ),
    });
  }

  private createCopyName(name: string): string {
    const existingNames = new Set(
      this.state.scenarios.map((scenario) => scenario.name),
    );
    let candidate = `${name} Copy`;
    let copyNumber = 2;

    while (existingNames.has(candidate)) {
      candidate = `${name} Copy ${copyNumber}`;
      copyNumber += 1;
    }

    return candidate;
  }

  private commit(state: ScenarioState): void {
    this.repository.save(state);
    this.state = cloneState(state);
  }
}

export function createBrowserScenarioDependencies(): ScenarioDependencies {
  return {
    createId: () => crypto.randomUUID(),
    now: () => new Date().toISOString(),
  };
}
