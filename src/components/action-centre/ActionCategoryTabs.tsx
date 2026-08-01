import type { KeyboardEvent } from "react";

export type ActionCategoryFilter =
  | "biggest-gains"
  | "quick-wins"
  | "risk-reduction"
  | "retirement-timing"
  | "cost-savings";

interface ActionCategoryTabsProps {
  value: ActionCategoryFilter;
  onChange: (value: ActionCategoryFilter) => void;
  counts: Record<ActionCategoryFilter, number>;
}

const tabs: Array<{ id: ActionCategoryFilter; label: string }> = [
  { id: "biggest-gains", label: "Biggest gains" },
  { id: "quick-wins", label: "Quick wins" },
  { id: "risk-reduction", label: "Risk reduction" },
  { id: "retirement-timing", label: "Retirement timing" },
  { id: "cost-savings", label: "Cost savings" },
];

export function ActionCategoryTabs({
  value,
  onChange,
  counts,
}: ActionCategoryTabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.id === value);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    onChange(tabs[nextIndex].id);
    document.getElementById(`action-category-${tabs[nextIndex].id}`)?.focus();
  }

  return (
    <div
      className="action-category-tabs"
      role="tablist"
      aria-label="Recommendation categories"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`action-category-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          aria-controls="action-centre-results"
          tabIndex={value === tab.id ? 0 : -1}
          className={value === tab.id ? "active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          <small>{counts[tab.id]}</small>
        </button>
      ))}
    </div>
  );
}
