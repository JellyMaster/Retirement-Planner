import { useEffect, type KeyboardEvent } from "react";
import { useInRouterContext, useSearchParams } from "react-router-dom";

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
  queryValue: string;
  label: string;
}> = [
  { id: "income", queryValue: "income", label: "Income" },
  { id: "balance", queryValue: "balance", label: "Balance" },
  { id: "details", queryValue: "timeline", label: "Retirement journey" },
  { id: "assumptions", queryValue: "assumptions", label: "How it works" },
];

export function DrawdownWorkspaceNavigation(
  props: DrawdownWorkspaceNavigationProps,
) {
  return useInRouterContext() ? (
    <RoutedDrawdownWorkspaceNavigation {...props} />
  ) : (
    <DrawdownWorkspaceNavigationContent {...props} />
  );
}

function RoutedDrawdownWorkspaceNavigation({
  value,
  onChange,
}: DrawdownWorkspaceNavigationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = parseSection(searchParams.get("tab"));

  useEffect(() => {
    if (!requestedSection || requestedSection === value) return;
    onChange(requestedSection);
  }, [onChange, requestedSection, value]);

  function selectSection(section: DrawdownWorkspaceSection) {
    const next = new URLSearchParams(searchParams);
    const queryValue =
      sections.find((candidate) => candidate.id === section)?.queryValue ?? section;
    next.set("tab", queryValue);
    setSearchParams(next, { replace: true });
    onChange(section);
  }

  return (
    <DrawdownWorkspaceNavigationContent
      value={value}
      onChange={selectSection}
    />
  );
}

function DrawdownWorkspaceNavigationContent({
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
    if (!nextSection) return;
    onChange(nextSection.id);
    document.getElementById(`drawdown-tab-${nextSection.id}`)?.focus();
  }

  return (
    <div
      className="drawdown-workspace-navigation"
      role="tablist"
      aria-label="Detailed drawdown analysis"
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

function parseSection(value: string | null): DrawdownWorkspaceSection | null {
  switch (value) {
    case "income":
    case "balance":
    case "assumptions":
      return value;
    case "timeline":
    case "details":
      return "details";
    default:
      return null;
  }
}
