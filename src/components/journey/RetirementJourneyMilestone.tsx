import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type RetirementJourneyTone =
  | "current"
  | "contribution"
  | "retirement"
  | "state-pension";

export interface RetirementJourneyMilestoneData {
  id: string;
  age: number;
  title: string;
  summary: string;
  value: string;
  detail: string;
  icon: IconDefinition;
  tone: RetirementJourneyTone;
  order: number;
}

interface RetirementJourneyMilestoneProps {
  milestone: RetirementJourneyMilestoneData;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function RetirementJourneyMilestone({
  milestone,
  isActive,
  onSelect,
}: RetirementJourneyMilestoneProps) {
  return (
    <li
      className={`retirement-journey-milestone retirement-journey-milestone-${milestone.tone}${
        isActive ? " retirement-journey-milestone-active" : ""
      }`}
    >
      <button
        type="button"
        className="retirement-journey-milestone-button"
        aria-pressed={isActive}
        aria-controls="retirement-journey-detail"
        onClick={() => onSelect(milestone.id)}
      >
        <span className="retirement-journey-marker" aria-hidden="true">
          <FontAwesomeIcon icon={milestone.icon} />
        </span>

        <span className="retirement-journey-milestone-copy">
          <small>Age {milestone.age}</small>
          <strong>{milestone.title}</strong>
          <span>{milestone.summary}</span>
        </span>
      </button>
    </li>
  );
}
