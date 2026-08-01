import { describe, expect, it } from "vitest";
import {
  createTestPensionInputs,
  createTestRetirementGoals,
} from "../../../test/retirementTestFixtures";
import { RecommendationEngine } from "../RecommendationEngine";

const fastConfig = {
  inputs: createTestPensionInputs(),
  goals: createTestRetirementGoals(),
  monteCarloSimulations: 120,
  sustainabilitySimulations: 80,
  monteCarloSeed: 9_876,
  annualVolatility: 0.12,
  maximumRecommendations: 5,
} as const;

describe("RecommendationEngine", () => {
  it("returns ranked, beneficial and non-destructive recommendations", () => {
    const originalInputs = { ...fastConfig.inputs };
    const result = RecommendationEngine.calculate(fastConfig);

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
    expect(result.recommendations.every((item) => item.impact.impactScore > 0)).toBe(
      true,
    );
    expect(fastConfig.inputs).toEqual(originalInputs);
  });

  it("is deterministic when the same seed and settings are used", () => {
    const first = RecommendationEngine.calculate(fastConfig);
    const second = RecommendationEngine.calculate(fastConfig);

    expect(second).toEqual(first);
  });

  it("can skip sustainability analysis for a faster accumulation-only result", () => {
    const result = RecommendationEngine.calculate({
      ...fastConfig,
      includeSustainability: false,
    });

    expect(result.baseline.metrics.sustainabilityProbability).toBeUndefined();
    expect(
      result.recommendations.every(
        (recommendation) =>
          recommendation.metrics.sustainabilityProbability === undefined &&
          recommendation.impact.sustainabilityProbabilityChange === undefined,
      ),
    ).toBe(true);
  });

  it("respects the requested result limit", () => {
    const result = RecommendationEngine.calculate({
      ...fastConfig,
      includeSustainability: false,
      maximumRecommendations: 2,
    });

    expect(result.recommendations).toHaveLength(2);
  });

  it("still offers optimisation candidates when the deterministic target is covered", () => {
    const result = RecommendationEngine.calculate({
      ...fastConfig,
      goals: {
        ...fastConfig.goals,
        desiredAnnualIncome: 10_000,
      },
      includeSustainability: false,
    });

    expect(result.baseline.metrics.readinessScore).toBe(100);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
