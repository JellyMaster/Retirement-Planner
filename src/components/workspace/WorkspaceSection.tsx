import type { ReactNode } from "react";

import type { WorkspaceSectionDefinition } from "./workspaceSections";

interface WorkspaceSectionProps {
  section: WorkspaceSectionDefinition;
  children: ReactNode;
}

export function WorkspaceSection({ section, children }: WorkspaceSectionProps) {
  return (
    <section
      id={`workspace-panel-${section.id}`}
      className="workspace-section"
      role="tabpanel"
      aria-labelledby={`workspace-tab-${section.id}`}
      tabIndex={0}
    >
      <header className="workspace-section-header">
        <p className="planner-eyebrow">{section.label}</p>
        <h2>{section.question}</h2>
      </header>
      <div className="workspace-section-content">{children}</div>
    </section>
  );
}
