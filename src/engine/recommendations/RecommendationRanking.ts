import type { RetirementRecommendation } from "./RecommendationTypes";

const EFFORT_ORDER = {
  low: 0,
  medium: 1,
  high: 2,
} as const;

export function rankRecommendations(
  recommendations: readonly RetirementRecommendation[],
): RetirementRecommendation[] {
  return [...recommendations].sort((left, right) => {
    const leftHelpful = left.impact.impactScore > 0;
    const rightHelpful = right.impact.impactScore > 0;
    if (leftHelpful !== rightHelpful) return leftHelpful ? -1 : 1;

    if (right.impact.impactPerUnit !== left.impact.impactPerUnit) {
      return right.impact.impactPerUnit - left.impact.impactPerUnit;
    }

    if (right.impact.impactScore !== left.impact.impactScore) {
      return right.impact.impactScore - left.impact.impactScore;
    }

    if (EFFORT_ORDER[left.effort] !== EFFORT_ORDER[right.effort]) {
      return EFFORT_ORDER[left.effort] - EFFORT_ORDER[right.effort];
    }

    return left.title.localeCompare(right.title);
  });
}
