import { describe, expect, it } from "vitest";
import type { RetirementRecommendation } from "../RecommendationTypes";
import { rankRecommendations } from "../RecommendationRanking";

function recommendation(
  id: string,
  impactPerUnit: number,
  impactScore: number,
  effort: RetirementRecommendation["effort"] = "medium",
): RetirementRecommendation {
  return {
    id,
    category: "saving",
    title: id,
    description: id,
    effort,
    inputs: {} as RetirementRecommendation["inputs"],
    changeMagnitude: 1,
    changes: [],
    metrics: {} as RetirementRecommendation["metrics"],
    impact: {
      projectedPotChange: 0,
      illustratedAnnualIncomeChange: 0,
      readinessScoreChange: 0,
      weightedScoreChange: 0,
      monteCarloConfidenceChange: 0,
      impactScore,
      impactRating: 1,
      impactPerUnit,
    },
  };
}

describe("rankRecommendations", () => {
  it("prioritises impact efficiency before absolute impact", () => {
    const ranked = rankRecommendations([
      recommendation("large", 2, 20),
      recommendation("efficient", 5, 10),
    ]);

    expect(ranked.map((item) => item.id)).toEqual(["efficient", "large"]);
  });

  it("uses lower effort as a stable tie-breaker", () => {
    const ranked = rankRecommendations([
      recommendation("high effort", 5, 10, "high"),
      recommendation("low effort", 5, 10, "low"),
    ]);

    expect(ranked[0].id).toBe("low effort");
  });
});
