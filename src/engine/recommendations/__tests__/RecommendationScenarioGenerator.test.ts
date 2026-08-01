import { describe, expect, it } from "vitest";
import { createTestPensionInputs } from "../../../test/retirementTestFixtures";
import { generateRecommendationScenarios } from "../RecommendationScenarioGenerator";

describe("generateRecommendationScenarios", () => {
  it("creates contribution, timing, fee and combined candidates", () => {
    const scenarios = generateRecommendationScenarios(createTestPensionInputs());
    const ids = scenarios.map((scenario) => scenario.id);

    expect(ids).toContain("increase-contribution-50");
    expect(ids).toContain("increase-contribution-100");
    expect(ids).toContain("increase-contribution-250");
    expect(ids).toContain("retire-1-year-later");
    expect(ids).toContain("retire-2-years-later");
    expect(ids).toContain("reduce-fees");
    expect(ids).toContain("save-50-retire-one-year-later");
  });

  it("omits candidates that exceed the supported retirement-age boundary", () => {
    const scenarios = generateRecommendationScenarios({
      ...createTestPensionInputs(),
      retirementAge: 100,
    });

    expect(
      scenarios.some((scenario) => scenario.category === "retirement-timing"),
    ).toBe(false);
    expect(
      scenarios.some((scenario) => scenario.category === "combined"),
    ).toBe(false);
  });

  it("omits the fee candidate when fees are already zero", () => {
    const scenarios = generateRecommendationScenarios({
      ...createTestPensionInputs(),
      annualFee: 0,
    });

    expect(scenarios.some((scenario) => scenario.category === "fees")).toBe(
      false,
    );
  });
});
