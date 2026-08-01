import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { KeyboardEvent } from "react";

import {
  workspaceSections,
  type WorkspaceSectionId,
} from "./workspaceSections";

interface WorkspaceNavigationProps {
  activeSection: WorkspaceSectionId;
  onSectionChange: (section: WorkspaceSectionId) => void;
}

export function WorkspaceNavigation({
  activeSection,
  onSectionChange,
}: WorkspaceNavigationProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % workspaceSections.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + workspaceSections.length) % workspaceSections.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = workspaceSections.length - 1;
    }

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextSection = workspaceSections[nextIndex];
    onSectionChange(nextSection.id);

    window.requestAnimationFrame(() => {
      document.getElementById(`workspace-tab-${nextSection.id}`)?.focus();
    });
  }

  return (
    <nav className="workspace-navigation" aria-label="Retirement planning workspace">
      <div className="workspace-navigation-list" role="tablist" aria-orientation="vertical">
        {workspaceSections.map((section, index) => {
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              type="button"
              id={`workspace-tab-${section.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`workspace-panel-${section.id}`}
              tabIndex={isActive ? 0 : -1}
              className={isActive ? "workspace-navigation-item active" : "workspace-navigation-item"}
              onClick={() => onSectionChange(section.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="workspace-navigation-icon" aria-hidden="true">
                <FontAwesomeIcon icon={section.icon} />
              </span>
              <span className="workspace-navigation-copy">
                <strong>{section.label}</strong>
                <small>{section.question}</small>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
