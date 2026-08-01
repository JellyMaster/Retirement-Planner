import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import type { Scenario } from "./Scenario";
import { createScenarioInsights } from "./createScenarioInsights";

function createScenario(
  id: string,
  name: string,
  overrides: Partial<Scenario["inputs"]> = {},
): Scenario {
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
      monthlyEmployeeContribution: 800,
      monthlyEmployerContribution: 250,
      ...overrides,
    },
  };
}

describe("createScenarioInsights", () => {
  it("describes retirement, contribution and projected outcome differences", () => {
    const active = createScenario("active", "Active Plan");
    const alternative = createScenario("alternative", "Retire at 65", {
      retirementAge: 65,
      monthlyEmployeeContribution: 1_000,
    });

    const [group] = createScenarioInsights([active, alternative], active);
    const titles = group.insights.map((insight) => insight.title);

    expect(group.scenario.id).toBe(alternative.id);
    expect(titles).toContain("Earlier retirement");
    expect(titles).toContain("Higher monthly saving");
    expect(titles).toContain("Projected pension is lower");
    expect(group.insights.length).toBeLessThanOrEqual(5);
  });

  it("reports when an alternative overtakes the active plan", () => {
    const active = createScenario("active", "Active Plan");
    const alternative = createScenario("alternative", "Higher Contributions", {
      currentPot: 100_000,
      monthlyEmployeeContribution: 5_000,
    });

    const [group] = createScenarioInsights([active, alternative], active);

    expect(
      group.insights.some((insight) => insight.title === "Overtakes the active plan"),
    ).toBe(true);
  });

  it("returns an unavailable insight for invalid inputs", () => {
    const active = createScenario("active", "Active Plan");
    const invalid = createScenario("invalid", "Invalid", {
      retirementAge: 47,
    });

    const [group] = createScenarioInsights([active, invalid], active);

    expect(group.insights).toEqual([
      expect.objectContaining({
        title: "Projection unavailable",
        importance: "high",
      }),
    ]);
  });
});
