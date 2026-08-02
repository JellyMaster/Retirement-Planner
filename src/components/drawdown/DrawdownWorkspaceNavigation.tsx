import type { KeyboardEvent } from "react";
import {
  BarChart3,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";

export type DrawdownWorkspaceSection =
  | "overview"
  | "income"
  | "balance"
  | "details"
  | "assumptions";

interface DrawdownWorkspaceNavigationProps {
  value: DrawdownWorkspaceSection;
  onChange: (section: DrawdownWorkspaceSection) => void;
}

const sections: Array<{
  id: DrawdownWorkspaceSection;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Outcome",
    icon: LayoutDashboard,
  },
  {
    id: "income",
    label: "Income & tax",
    shortLabel: "Income",
    icon: ReceiptText,
  },
  {
    id: "balance",
    label: "Pension balance",
    shortLabel: "Balance",
    icon: BarChart3,
  },
  {
    id: "details",
    label: "Year-by-year",
    shortLabel: "Details",
    icon: ClipboardList,
  },
  {
    id: "assumptions",
    label: "Assumptions",
    shortLabel: "Basis",
    icon: Landmark,
  },
];

export function DrawdownWorkspaceNavigation({
  value,
  onChange,
}: DrawdownWorkspaceNavigationProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % sections.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + sections.length) % sections.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = sections.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextSection = sections[nextIndex];
    onChange(nextSection.id);
    document.getElementById(`drawdown-tab-${nextSection.id}`)?.focus();
  }

  return (
    <div
      className="drawdown-workspace-navigation"
      role="tablist"
      aria-label="Drawdown analysis"
    >
      {sections.map((section, index) => {
        const Icon = section.icon;
        const active = value === section.id;

        return (
          <button
            key={section.id}
            type="button"
            id={`drawdown-tab-${section.id}`}
            role="tab"
            aria-selected={active}
            aria-controls={`drawdown-${section.id}-section`}
            tabIndex={active ? 0 : -1}
            className={
              active
                ? "drawdown-workspace-nav-item active"
                : "drawdown-workspace-nav-item"
            }
            onClick={() => onChange(section.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className="drawdown-workspace-nav-marker" aria-hidden="true">
              {index + 1}
            </span>
            <span className="drawdown-workspace-nav-copy">
              <small>View {index + 1}</small>
              <strong>{section.shortLabel}</strong>
            </span>
            <Icon className="drawdown-workspace-nav-icon" size={17} aria-hidden="true" />
            <span className="visually-hidden">{section.label}</span>
          </button>
        );
      })}
    </div>
  );
}
