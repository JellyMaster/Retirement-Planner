import type { PensionInputs } from "../../engine/models/PensionInputs";
import { loadStoredPensionInputs } from "../../state/planStorage";
import {
  createBaselineScenario,
  type Scenario,
  type ScenarioDependencies,
  type ScenarioState,
} from "./Scenario";
import type { ScenarioRepository } from "./ScenarioRepository";

export const SCENARIO_STORAGE_KEY = "retirement-planner:scenarios";
const SCENARIO_STORAGE_VERSION = 1;

interface StoredScenarioState {
  version: typeof SCENARIO_STORAGE_VERSION;
  activeScenarioId: string;
  scenarios: Scenario[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPensionInputs(value: unknown): value is PensionInputs {
  if (!value || typeof value !== "object") return false;

  const inputs = value as Partial<PensionInputs>;
  return [
    inputs.currentAge,
    inputs.retirementAge,
    inputs.currentPot,
    inputs.monthlyEmployeeContribution,
    inputs.monthlyEmployerContribution,
    inputs.annualContributionIncrease,
    inputs.annualReturn,
    inputs.annualFee,
    inputs.inflation,
  ].every(isFiniteNumber);
}

function isScenario(value: unknown): value is Scenario {
  if (!value || typeof value !== "object") return false;

  const scenario = value as Partial<Scenario>;
  return (
    typeof scenario.id === "string" &&
    scenario.id.length > 0 &&
    typeof scenario.name === "string" &&
    scenario.name.trim().length > 0 &&
    typeof scenario.colour === "string" &&
    typeof scenario.isBaseline === "boolean" &&
    typeof scenario.createdAt === "string" &&
    typeof scenario.updatedAt === "string" &&
    isPensionInputs(scenario.inputs)
  );
}

function parseStoredState(value: string): ScenarioState | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredScenarioState>;
    if (
      parsed.version !== SCENARIO_STORAGE_VERSION ||
      typeof parsed.activeScenarioId !== "string" ||
      !Array.isArray(parsed.scenarios) ||
      parsed.scenarios.length === 0 ||
      !parsed.scenarios.every(isScenario)
    ) {
      return null;
    }

    const baselineCount = parsed.scenarios.filter(
      (scenario) => scenario.isBaseline,
    ).length;
    const activeScenarioExists = parsed.scenarios.some(
      (scenario) => scenario.id === parsed.activeScenarioId,
    );

    if (baselineCount !== 1 || !activeScenarioExists) return null;

    return {
      activeScenarioId: parsed.activeScenarioId,
      scenarios: parsed.scenarios.map((scenario) => ({
        ...scenario,
        inputs: { ...scenario.inputs },
      })),
    };
  } catch {
    return null;
  }
}

export class LocalScenarioRepository implements ScenarioRepository {
  constructor(
    private readonly storage: Storage,
    private readonly fallbackInputs: PensionInputs,
    private readonly dependencies: ScenarioDependencies,
  ) {}

  load(): ScenarioState {
    const saved = this.storage.getItem(SCENARIO_STORAGE_KEY);
    const storedState = saved ? parseStoredState(saved) : null;
    if (storedState) return storedState;

    const baselineInputs = loadStoredPensionInputs(this.fallbackInputs);
    const baseline = createBaselineScenario(
      baselineInputs,
      this.dependencies,
    );
    const initialState: ScenarioState = {
      activeScenarioId: baseline.id,
      scenarios: [baseline],
    };

    this.save(initialState);
    return initialState;
  }

  save(state: ScenarioState): void {
    const storedState: StoredScenarioState = {
      version: SCENARIO_STORAGE_VERSION,
      activeScenarioId: state.activeScenarioId,
      scenarios: state.scenarios.map((scenario) => ({
        ...scenario,
        inputs: { ...scenario.inputs },
      })),
    };

    this.storage.setItem(
      SCENARIO_STORAGE_KEY,
      JSON.stringify(storedState),
    );
  }
}
