import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { PLAN_STORAGE_KEY } from "../../state/planStorage";
import {
  LocalScenarioRepository,
  SCENARIO_STORAGE_KEY,
} from "./LocalScenarioRepository";
import type { ScenarioDependencies } from "./Scenario";

const dependencies: ScenarioDependencies = {
  createId: () => "baseline-id",
  now: () => "2026-08-01T20:00:00.000Z",
};

describe("LocalScenarioRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates and persists a baseline scenario from factory defaults", () => {
    const defaults = createDefaultPensionInputs();
    const repository = new LocalScenarioRepository(
      localStorage,
      defaults,
      dependencies,
    );

    const state = repository.load();

    expect(state.activeScenarioId).toBe("baseline-id");
    expect(state.scenarios).toEqual([
      expect.objectContaining({
        id: "baseline-id",
        name: "Baseline Plan",
        isBaseline: true,
        createdAt: "2026-08-01T20:00:00.000Z",
        updatedAt: "2026-08-01T20:00:00.000Z",
        inputs: defaults,
        drawdown: expect.objectContaining({
          withdrawalStrategy: "target-income",
          withdrawalRate: 0.04,
        }),
      }),
    ]);

    expect(JSON.parse(localStorage.getItem(SCENARIO_STORAGE_KEY) ?? "")).toEqual(
      expect.objectContaining({
        version: 2,
        activeScenarioId: "baseline-id",
      }),
    );
  });

  it("persists the complete retirement strategy including percentage phases", () => {
    const repository = new LocalScenarioRepository(
      localStorage,
      createDefaultPensionInputs(),
      dependencies,
    );
    const state = repository.load();
    const baseline = state.scenarios[0];

    repository.save({
      ...state,
      scenarios: [
        {
          ...baseline,
          drawdown: {
            ...baseline.drawdown,
            withdrawalStrategy: "percentage",
            withdrawalRate: 0.04,
            spendingPhases: [
              {
                startAge: 68,
                annualIncome: 30_000,
                withdrawalRate: 0.05,
                label: "Active retirement",
              },
              {
                startAge: 78,
                annualIncome: 30_000,
                withdrawalRate: 0.035,
                label: "Settled retirement",
              },
            ],
            taxFreeCashMode: "custom",
            taxFreeCash: 20_000,
            endingBalanceMode: "spend-to-zero",
            endingBalancePercentage: 0,
            retirementLivingStandardsHousehold: "two-person",
            retirementLivingStandardsRegion: "london",
          },
        },
      ],
    });

    const reloaded = repository.load();

    expect(reloaded.scenarios[0].drawdown).toEqual(
      expect.objectContaining({
        withdrawalStrategy: "percentage",
        taxFreeCashMode: "custom",
        taxFreeCash: 20_000,
        endingBalanceMode: "spend-to-zero",
        retirementLivingStandardsHousehold: "two-person",
        retirementLivingStandardsRegion: "london",
        spendingPhases: [
          expect.objectContaining({
            startAge: 68,
            withdrawalRate: 0.05,
          }),
          expect.objectContaining({
            startAge: 78,
            withdrawalRate: 0.035,
          }),
        ],
      }),
    );
  });

  it("migrates the existing saved baseline plan", () => {
    const defaults = createDefaultPensionInputs();
    const savedInputs = {
      ...defaults,
      currentAge: 48,
      currentPot: 245_000,
      monthlyEmployeeContribution: 1_125,
    };
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedInputs));

    const repository = new LocalScenarioRepository(
      localStorage,
      defaults,
      dependencies,
    );

    const state = repository.load();

    expect(state.scenarios[0].inputs).toEqual(savedInputs);
    expect(state.scenarios[0].drawdown).toEqual(
      expect.objectContaining({ withdrawalStrategy: "target-income" }),
    );
    expect(localStorage.getItem(SCENARIO_STORAGE_KEY)).not.toBeNull();
  });

  it("restores and upgrades an existing version-one scenario state", () => {
    const defaults = createDefaultPensionInputs();
    localStorage.setItem(
      SCENARIO_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        activeScenarioId: "early",
        scenarios: [
          {
            id: "baseline",
            name: "Baseline Plan",
            colour: "accent",
            isBaseline: true,
            createdAt: "2026-08-01T20:00:00.000Z",
            updatedAt: "2026-08-01T20:00:00.000Z",
            inputs: defaults,
          },
          {
            id: "early",
            name: "Early Retirement",
            colour: "accent",
            isBaseline: false,
            createdAt: "2026-08-01T20:05:00.000Z",
            updatedAt: "2026-08-01T20:05:00.000Z",
            inputs: { ...defaults, retirementAge: 65 },
          },
        ],
      }),
    );

    const repository = new LocalScenarioRepository(
      localStorage,
      defaults,
      dependencies,
    );

    const state = repository.load();

    expect(state.activeScenarioId).toBe("early");
    expect(state.scenarios).toHaveLength(2);
    expect(state.scenarios[1].inputs.retirementAge).toBe(65);
    expect(state.scenarios[1].drawdown).toEqual(
      expect.objectContaining({
        withdrawalStrategy: "target-income",
        desiredAnnualIncome: 30_000,
      }),
    );
    expect(JSON.parse(localStorage.getItem(SCENARIO_STORAGE_KEY) ?? "").version).toBe(2);
  });

  it("replaces malformed scenario data with a valid baseline", () => {
    localStorage.setItem(
      SCENARIO_STORAGE_KEY,
      JSON.stringify({ version: 1, activeScenarioId: "missing", scenarios: [] }),
    );

    const repository = new LocalScenarioRepository(
      localStorage,
      createDefaultPensionInputs(),
      dependencies,
    );

    const state = repository.load();

    expect(state.activeScenarioId).toBe("baseline-id");
    expect(state.scenarios).toHaveLength(1);
    expect(state.scenarios[0].isBaseline).toBe(true);
  });
});
