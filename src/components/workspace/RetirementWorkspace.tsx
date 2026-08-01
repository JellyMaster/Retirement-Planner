import type { ReactNode } from "react";

import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { WorkspaceSection } from "./WorkspaceSection";
import {
  workspaceSections,
  type WorkspaceSectionId,
} from "./workspaceSections";

interface RetirementWorkspaceProps {
  activeSection: WorkspaceSectionId;
  onSectionChange: (section: WorkspaceSectionId) => void;
  children: ReactNode;
}

export function RetirementWorkspace({
  activeSection,
  onSectionChange,
  children,
}: RetirementWorkspaceProps) {
  const section = workspaceSections.find((item) => item.id === activeSection) ?? workspaceSections[0];

  return (
    <div className="retirement-workspace-shell">
      <WorkspaceNavigation
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      <div className="retirement-workspace-main">
        <WorkspaceSection section={section}>{children}</WorkspaceSection>
      </div>
    </div>
  );
}
