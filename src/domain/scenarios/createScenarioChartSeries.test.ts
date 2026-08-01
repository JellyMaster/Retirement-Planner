import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import type { Scenario } from "./Scenario";
import { createScenarioChartSeries } from "./createScenarioChartSeries";

function createScenario(id: string, name: string): Scenario {
  return {
    id,
    name,
    colour: "accent",
    isBaseline: id === "baseline",
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    inputs: {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 68,
      currentPot: 194_420,
    },
  };
}

describe("createScenarioChartSeries", () => {
  it("preserves the selected order and marks the active series", () => {
    const active = createScenario("active", "Retire at 65");
    const baseline = createScenario("baseline", "Baseline Plan");

    const series = createScenarioChartSeries(
      [active, baseline],
      active.id,
    );

    expect(series.map((item) => item.name)).toEqual([
      "Retire at 65",
      "Baseline Plan",
    ]);
    expect(series[0].isActive).toBe(true);
    expect(series[1].isActive).toBe(false);
    expect(series[0].points[0]).toEqual(
      expect.objectContaining({
        age: 47,
        nominal: expect.any(Number),
        real: expect.any(Number),
      }),
    );
  });

  it("excludes scenarios with invalid inputs", () => {
    const invalid = createScenario("invalid", "Invalid");
    invalid.inputs.retirementAge = invalid.inputs.currentAge;

    expect(createScenarioChartSeries([invalid], invalid.id)).toEqual([]);
  });
});
