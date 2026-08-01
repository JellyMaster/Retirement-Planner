import { useMemo, useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import {
  RecommendationEngine,
  type RetirementRecommendation,
} from "../../engine/recommendations";
import { AppIcons } from "../../icons";
import { Card, CardHeader, StatusBadge } from "../ui";
import { ActionCard } from "./ActionCard";
import {
  ActionCategoryTabs,
  type ActionCategoryFilter,
} from "./ActionCategoryTabs";
import { EmptyRecommendations } from "./EmptyRecommendations";

interface ActionCentreProps {
  inputs: PensionInputs;
  goals: RetirementGoals;
  onPreviewRecommendation: (inputs: PensionInputs) => void;
}

const categoryLabels: Record<ActionCategoryFilter, string> = {
  "biggest-gains": "Biggest gains",
  "quick-wins": "Quick wins",
  "risk-reduction": "Risk reduction",
  "retirement-timing": "Retirement timing",
  "cost-savings": "Cost savings",
};

function matchesCategory(
  recommendation: RetirementRecommendation,
  category: ActionCategoryFilter,
): boolean {
  if (category === "biggest-gains") return true;
  if (category === "quick-wins") return recommendation.effort === "low" || recommendation.impact.impactPerUnit >= 1;
  if (category === "risk-reduction") {
    return (
      recommendation.impact.monteCarloConfidenceChange > 0 ||
      (recommendation.impact.sustainabilityProbabilityChange ?? 0) > 0
    );
  }
  if (category === "retirement-timing") return recommendation.category === "retirement-timing" || recommendation.category === "combined";
  return recommendation.category === "fees";
}

export function ActionCentre({
  inputs,
  goals,
  onPreviewRecommendation,
}: ActionCentreProps) {
  const [category, setCategory] = useState<ActionCategoryFilter>("biggest-gains");

  const result = useMemo(
    () =>
      RecommendationEngine.calculate({
        inputs,
        goals,
        monteCarloSimulations: 500,
        sustainabilitySimulations: 350,
        maximumRecommendations: 7,
      }),
    [goals, inputs],
  );

  const categoryCounts = useMemo(() => {
    const categories: ActionCategoryFilter[] = [
      "biggest-gains",
      "quick-wins",
      "risk-reduction",
      "retirement-timing",
      "cost-savings",
    ];

    return Object.fromEntries(
      categories.map((item) => [
        item,
        result.recommendations.filter((recommendation) => matchesCategory(recommendation, item)).length,
      ]),
    ) as Record<ActionCategoryFilter, number>;
  }, [result.recommendations]);

  const visibleRecommendations = result.recommendations.filter((recommendation) =>
    matchesCategory(recommendation, category),
  );

  function handlePreview(recommendation: RetirementRecommendation) {
    onPreviewRecommendation(recommendation.inputs);
  }

  return (
    <Card
      className="action-centre"
      padding="large"
      aria-labelledby="action-centre-heading"
    >
      <CardHeader
        eyebrow="Your next best actions"
        title="Action Centre"
        titleId="action-centre-heading"
        description="Ranked changes based on projected growth, retirement readiness, Monte Carlo confidence and pension sustainability. Preview any action without changing your current plan."
        icon={AppIcons.recommendations}
        badge={
          <StatusBadge tone="accent">
            {result.recommendations.length} personalised actions
          </StatusBadge>
        }
      />

      <ActionCategoryTabs
        value={category}
        onChange={setCategory}
        counts={categoryCounts}
      />

      <div
        id="action-centre-results"
        role="tabpanel"
        aria-labelledby={`action-category-${category}`}
        tabIndex={0}
        className="action-centre-results"
      >
        {visibleRecommendations.length > 0 ? (
          <div className="action-centre-grid">
            {visibleRecommendations.map((recommendation) => (
              <ActionCard
                key={recommendation.id}
                baseline={result.baseline}
                recommendation={recommendation}
                rank={result.recommendations.indexOf(recommendation) + 1}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <EmptyRecommendations categoryLabel={categoryLabels[category]} />
        )}
      </div>

      <p className="action-centre-disclaimer">
        Recommendations are planning illustrations based on the assumptions entered. They are not regulated financial advice, guarantees or instructions to change investments.
      </p>
    </Card>
  );
}
