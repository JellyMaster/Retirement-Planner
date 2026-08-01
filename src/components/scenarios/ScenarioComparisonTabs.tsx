import {
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import "../../styles/scenario-intelligence-tabs.css";

interface ScenarioComparisonTabsProps {
  outcomes: ReactNode;
  chart: ReactNode;
  changes: ReactNode;
}

type ComparisonTab = "outcomes" | "chart" | "changes";

const tabs: Array<{ id: ComparisonTab; label: string }> = [
  { id: "outcomes", label: "Outcomes" },
  { id: "chart", label: "Growth chart" },
  { id: "changes", label: "What changed" },
];

export function ScenarioComparisonTabs({
  outcomes,
  chart,
  changes,
}: ScenarioComparisonTabsProps) {
  const [activeTab, setActiveTab] = useState<ComparisonTab>("outcomes");

  return (
    <section
      className="scenario-intelligence-panel"
      aria-labelledby="scenario-intelligence-title"
    >
      <div className="scenario-manager-section-heading">
        <div>
          <p className="planner-eyebrow">Scenario intelligence</p>
          <h2 id="scenario-intelligence-title">Compare selected plans</h2>
        </div>
        <span>Active plan shown first</span>
      </div>

      <div
        className="scenario-intelligence-tabs"
        role="tablist"
        aria-label="Comparison views"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`scenario-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`scenario-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) =>
              handleTabKeyDown(event, tab.id, setActiveTab)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`scenario-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`scenario-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="scenario-intelligence-content"
        >
          {tab.id === "outcomes"
            ? outcomes
            : tab.id === "chart"
              ? chart
              : changes}
        </div>
      ))}
    </section>
  );
}

function handleTabKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  current: ComparisonTab,
  setActive: (tab: ComparisonTab) => void,
) {
  const currentIndex = tabs.findIndex((tab) => tab.id === current);
  let nextIndex: number;

  switch (event.key) {
    case "ArrowRight":
      nextIndex = (currentIndex + 1) % tabs.length;
      break;
    case "ArrowLeft":
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();

  const next = tabs[nextIndex];
  setActive(next.id);
  document.getElementById(`scenario-tab-${next.id}`)?.focus();
}
