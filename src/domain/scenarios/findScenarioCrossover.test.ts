import { describe, expect, it } from "vitest";

import type { ScenarioChartSeries } from "./createScenarioChartSeries";
import { findScenarioCrossover } from "./findScenarioCrossover";

function createSeries(
  scenarioId: string,
  values: Array<[age: number, real: number]>,
): ScenarioChartSeries {
  return {
    scenarioId,
    name: scenarioId,
    isActive: scenarioId === "active",
    points: values.map(([age, real]) => ({
      age,
      real,
      nominal: real,
    })),
  };
}

describe("findScenarioCrossover", () => {
  it("returns the first age an alternative moves ahead", () => {
    const active = createSeries("active", [
      [47, 200_000],
      [48, 215_000],
      [49, 230_000],
    ]);
    const alternative = createSeries("alternative", [
      [47, 200_000],
      [48, 214_000],
      [49, 235_000],
    ]);

    expect(findScenarioCrossover(alternative, active)).toEqual({
      age: 49,
      alternativeValue: 235_000,
      activeValue: 230_000,
    });
  });

  it("returns null when an alternative never moves ahead", () => {
    const active = createSeries("active", [
      [47, 200_000],
      [48, 215_000],
    ]);
    const alternative = createSeries("alternative", [
      [47, 190_000],
      [48, 210_000],
    ]);

    expect(findScenarioCrossover(alternative, active)).toBeNull();
  });
});
