import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
import { PLAN_STORAGE_KEY } from "../../state/planStorage";
import {
  createBaselineScenario,
  type Scenario,
  type ScenarioDependencies,
  type ScenarioState,
} from "./Scenario";
import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "./ScenarioDrawdownPreferences";
import type { ScenarioRepository } from "./ScenarioRepository";

export const SCENARIO_STORAGE_KEY = "retirement-planner:scenarios";
const SCENARIO_STORAGE_VERSION = 2;

interface StoredScenarioState {
  version: number;
  activeScenarioId: string;
  scenarios: unknown[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return value === undefined || isFiniteNumber(value);
}

function isPensionInputs(value: unknown): value is PensionInputs {
  if (!value || typeof value !== "object") return false;

  const inputs = value as Partial<PensionInputs>;
  return (
    [
      inputs.currentAge,
      inputs.retirementAge,
      inputs.currentPot,
      inputs.monthlyEmployeeContribution,
      inputs.monthlyEmployerContribution,
      inputs.annualContributionIncrease,
      inputs.annualReturn,
      inputs.annualFee,
      inputs.inflation,
    ].every(isFiniteNumber) &&
    isOptionalFiniteNumber(inputs.extraContributionAge) &&
    isOptionalFiniteNumber(inputs.extraMonthlyContribution)
  );
}

function normaliseSpendingPhases(value: unknown): DrawdownSpendingPhase[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const phases = value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const phase = candidate as Partial<DrawdownSpendingPhase>;
    if (
      !Number.isInteger(phase.startAge) ||
      !isFiniteNumber(phase.annualIncome) ||
      typeof phase.label !== "string" ||
      phase.label.trim().length === 0 ||
      (phase.withdrawalRate !== undefined && !isFiniteNumber(phase.withdrawalRate))
    ) {
      return [];
    }

    return [
      {
        startAge: phase.startAge,
        annualIncome: phase.annualIncome,
        ...(phase.withdrawalRate !== undefined
          ? { withdrawalRate: phase.withdrawalRate }
          : {}),
        label: phase.label,
      },
    ];
  });

  return phases.length > 0 ? phases : undefined;
}

function normaliseDrawdownPreferences(
  value: unknown,
): ScenarioDrawdownPreferences {
  const defaults = createDefaultScenarioDrawdownPreferences();
  if (!value || typeof value !== "object") return defaults;

  const preferences = value as Partial<ScenarioDrawdownPreferences>;
  const spendingPhases = normaliseSpendingPhases(preferences.spendingPhases);

  return {
    planningAge: isFiniteNumber(preferences.planningAge)
      ? preferences.planningAge
      : defaults.planningAge,
    withdrawalStrategy:
      preferences.withdrawalStrategy === "target-income" ||
      preferences.withdrawalStrategy === "percentage"
        ? preferences.withdrawalStrategy
        : defaults.withdrawalStrategy,
    withdrawalRate: isFiniteNumber(preferences.withdrawalRate)
      ? preferences.withdrawalRate
      : defaults.withdrawalRate,
    desiredAnnualIncome: isFiniteNumber(preferences.desiredAnnualIncome)
      ? preferences.desiredAnnualIncome
      : defaults.desiredAnnualIncome,
    incomeTargetMode:
      preferences.incomeTargetMode === "gross" ||
      preferences.incomeTargetMode === "net"
        ? preferences.incomeTargetMode
        : defaults.incomeTargetMode,
    ...(spendingPhases ? { spendingPhases } : {}),
    taxFreeCash: isFiniteNumber(preferences.taxFreeCash)
      ? preferences.taxFreeCash
      : defaults.taxFreeCash,
    taxFreeCashMode:
      preferences.taxFreeCashMode === "maximum" ||
      preferences.taxFreeCashMode === "custom"
        ? preferences.taxFreeCashMode
        : defaults.taxFreeCashMode,
    endingBalanceMode:
      preferences.endingBalanceMode === "preserve" ||
      preferences.endingBalanceMode === "percentage" ||
      preferences.endingBalanceMode === "spend-to-zero"
        ? preferences.endingBalanceMode
        : defaults.endingBalanceMode,
    endingBalancePercentage: isFiniteNumber(preferences.endingBalancePercentage)
      ? preferences.endingBalancePercentage
      : defaults.endingBalancePercentage,
    retirementLivingStandardsHousehold:
      preferences.retirementLivingStandardsHousehold === "one-person" ||
      preferences.retirementLivingStandardsHousehold === "two-person"
        ? preferences.retirementLivingStandardsHousehold
        : defaults.retirementLivingStandardsHousehold,
    retirementLivingStandardsRegion:
      preferences.retirementLivingStandardsRegion === "uk" ||
      preferences.retirementLivingStandardsRegion === "london"
        ? preferences.retirementLivingStandardsRegion
        : defaults.retirementLivingStandardsRegion,
    ...(typeof preferences.includeStatePension === "boolean"
      ? { includeStatePension: preferences.includeStatePension }
      : {}),
    ...(isFiniteNumber(preferences.statePensionAnnualAmount)
      ? { statePensionAnnualAmount: preferences.statePensionAnnualAmount }
      : {}),
    ...(isFiniteNumber(preferences.statePensionAge)
      ? { statePensionAge: preferences.statePensionAge }
      : {}),
  };
}

function normaliseScenario(value: unknown): Scenario | null {
  if (!value || typeof value !== "object") return null;

  const scenario = value as Partial<Scenario>;
  if (
    typeof scenario.id !== "string" ||
    scenario.id.length === 0 ||
    typeof scenario.name !== "string" ||
    scenario.name.trim().length === 0 ||
    typeof scenario.colour !== "string" ||
    typeof scenario.isBaseline !== "boolean" ||
    typeof scenario.createdAt !== "string" ||
    typeof scenario.updatedAt !== "string" ||
    !isPensionInputs(scenario.inputs)
  ) {
    return null;
  }

  return {
    ...scenario,
    id: scenario.id,
    name: scenario.name,
    colour: scenario.colour,
    isBaseline: scenario.isBaseline,
    createdAt: scenario.createdAt,
    updatedAt: scenario.updatedAt,
    inputs: { ...scenario.inputs },
    drawdown: normaliseDrawdownPreferences(scenario.drawdown),
  };
}

function parseStoredState(value: string): ScenarioState | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredScenarioState>;
    if (
      (parsed.version !== 1 && parsed.version !== SCENARIO_STORAGE_VERSION) ||
      typeof parsed.activeScenarioId !== "string" ||
      !Array.isArray(parsed.scenarios) ||
      parsed.scenarios.length === 0
    ) {
      return null;
    }

    const scenarios = parsed.scenarios.map(normaliseScenario);
    if (scenarios.some((scenario) => scenario === null)) return null;

    const validScenarios = scenarios as Scenario[];
    const baselineCount = validScenarios.filter(
      (scenario) => scenario.isBaseline,
    ).length;
    const activeScenarioExists = validScenarios.some(
      (scenario) => scenario.id === parsed.activeScenarioId,
    );

    if (baselineCount !== 1 || !activeScenarioExists) return null;

    return {
      activeScenarioId: parsed.activeScenarioId,
      scenarios: validScenarios,
    };
  } catch {
    return null;
  }
}

function loadLegacyBaselineInputs(
  storage: Storage,
  fallback: PensionInputs,
): PensionInputs {
  const saved = storage.getItem(PLAN_STORAGE_KEY);
  if (!saved) return { ...fallback };

  try {
    const parsed = JSON.parse(saved) as Partial<PensionInputs>;
    const merged = { ...fallback, ...parsed };
    return isPensionInputs(merged) ? merged : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    inputs: { ...scenario.inputs },
    drawdown: normaliseDrawdownPreferences(scenario.drawdown),
  };
}

export class LocalScenarioRepository implements ScenarioRepository {
  private readonly storage: Storage;
  private readonly fallbackInputs: PensionInputs;
  private readonly dependencies: ScenarioDependencies;

  constructor(
    storage: Storage,
    fallbackInputs: PensionInputs,
    dependencies: ScenarioDependencies,
  ) {
    this.storage = storage;
    this.fallbackInputs = fallbackInputs;
    this.dependencies = dependencies;
  }

  load(): ScenarioState {
    const saved = this.storage.getItem(SCENARIO_STORAGE_KEY);
    const storedState = saved ? parseStoredState(saved) : null;
    if (storedState) {
      this.save(storedState);
      return storedState;
    }

    const baselineInputs = loadLegacyBaselineInputs(
      this.storage,
      this.fallbackInputs,
    );
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
    const storedState = {
      version: SCENARIO_STORAGE_VERSION,
      activeScenarioId: state.activeScenarioId,
      scenarios: state.scenarios.map(cloneScenario),
    };

    this.storage.setItem(
      SCENARIO_STORAGE_KEY,
      JSON.stringify(storedState),
    );
  }
}
