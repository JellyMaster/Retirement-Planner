import type { KeyboardEvent } from "react";

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
}> = [
  { id: "overview", label: "Overview" },
  { id: "income", label: "Income & tax" },
  { id: "balance", label: "Pension balance" },
  { id: "details", label: "Year-by-year" },
  { id: "assumptions", label: "Assumptions" },
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
            {section.label}
          </button>
        );
      })}
    </div>
  );
}
