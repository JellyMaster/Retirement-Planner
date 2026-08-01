import { useId, useState } from "react";

import type { RecommendationBaseline, RetirementRecommendation } from "../../engine/recommendations";
import { AppIcons } from "../../icons";
import { Button, Card, CardHeader, StatusBadge } from "../ui";
import { ActionDetails } from "./ActionDetails";
import { ActionImpactSummary } from "./ActionImpactSummary";

interface ActionCardProps {
  baseline: RecommendationBaseline;
  recommendation: RetirementRecommendation;
  rank: number;
  onPreview: (recommendation: RetirementRecommendation) => void;
}

const effortLabels = {
  low: "Low effort",
  medium: "Moderate effort",
  high: "Higher effort",
} as const;

function getTone(rating: number): "success" | "accent" | "info" {
  if (rating >= 5) return "success";
  if (rating >= 4) return "accent";
  return "info";
}

export function ActionCard({
  baseline,
  recommendation,
  rank,
  onPreview,
}: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <Card
      as="article"
      className={rank === 1 ? "action-card action-card-featured" : "action-card"}
      tone={rank === 1 ? "accent" : "subtle"}
      padding="medium"
    >
      <CardHeader
        headingLevel={3}
        eyebrow={rank === 1 ? "Top recommendation" : `Ranked #${rank}`}
        title={recommendation.title}
        description={recommendation.description}
        icon={recommendation.category === "fees" ? AppIcons.fees : recommendation.category === "retirement-timing" ? AppIcons.calendar : AppIcons.recommendations}
        badge={
          <div className="action-card-badges">
            <StatusBadge tone={getTone(recommendation.impact.impactRating)}>
              Impact {recommendation.impact.impactRating}/5
            </StatusBadge>
            <StatusBadge tone="neutral">{effortLabels[recommendation.effort]}</StatusBadge>
          </div>
        }
      />

      <ActionImpactSummary baseline={baseline} recommendation={recommendation} />

      <div className="action-card-actions">
        <Button
          variant="subtle"
          size="small"
          aria-expanded={expanded}
          aria-controls={detailsId}
          icon={AppIcons.information}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Hide explanation" : "Why this action?"}
        </Button>
        <Button
          variant="primary"
          size="small"
          icon={AppIcons.comparison}
          onClick={() => onPreview(recommendation)}
        >
          Preview in comparison
        </Button>
      </div>

      {expanded && (
        <div id={detailsId} className="action-card-details-panel">
          <ActionDetails recommendation={recommendation} />
        </div>
      )}
    </Card>
  );
}
