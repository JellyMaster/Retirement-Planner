import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { AppIcons } from "../../icons";

export type WorkspaceSectionId =
  | "overview"
  | "growth"
  | "confidence"
  | "income"
  | "sustainability"
  | "improve"
  | "details";

export interface WorkspaceSectionDefinition {
  id: WorkspaceSectionId;
  label: string;
  shortLabel: string;
  question: string;
  icon: IconDefinition;
}

export const workspaceSections: readonly WorkspaceSectionDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Overview",
    question: "Am I on track for retirement?",
    icon: AppIcons.home,
  },
  {
    id: "growth",
    label: "Build my pension",
    shortLabel: "Growth",
    question: "How could my pension grow?",
    icon: AppIcons.growth,
  },
  {
    id: "confidence",
    label: "Confidence & risk",
    shortLabel: "Confidence",
    question: "How uncertain is the outcome?",
    icon: AppIcons.chartLine,
  },
  {
    id: "income",
    label: "Retirement income",
    shortLabel: "Income",
    question: "How much income could I receive?",
    icon: AppIcons.money,
  },
  {
    id: "sustainability",
    label: "Sustainability",
    shortLabel: "Sustainability",
    question: "How long might my money last?",
    icon: AppIcons.health,
  },
  {
    id: "improve",
    label: "Improve my plan",
    shortLabel: "Improve",
    question: "What changes could improve my outlook?",
    icon: AppIcons.recommendations,
  },
  {
    id: "details",
    label: "Assumptions & details",
    shortLabel: "Details",
    question: "What assumptions and calculations are being used?",
    icon: AppIcons.settings,
  },
] as const;

export function isWorkspaceSectionId(value: string): value is WorkspaceSectionId {
  return workspaceSections.some((section) => section.id === value);
}
