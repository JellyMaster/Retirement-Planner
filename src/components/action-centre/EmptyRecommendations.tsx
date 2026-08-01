import { Card, CardHeader, StatusBadge } from "../ui";
import { AppIcons } from "../../icons";

interface EmptyRecommendationsProps {
  categoryLabel: string;
}

export function EmptyRecommendations({ categoryLabel }: EmptyRecommendationsProps) {
  return (
    <Card tone="subtle" className="action-centre-empty">
      <CardHeader
        title={`No ${categoryLabel.toLowerCase()} identified`}
        description="Your current plan does not have a recommendation in this category. Explore another category or use the custom scenario builder below."
        icon={AppIcons.success}
        badge={<StatusBadge tone="success">Nothing urgent</StatusBadge>}
        headingLevel={3}
      />
    </Card>
  );
}
