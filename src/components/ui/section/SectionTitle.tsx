import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

export interface SectionTitleProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: IconDefinition;
  action?: ReactNode;
  titleId?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function SectionTitle({ title, description, eyebrow, icon, action, titleId, headingLevel = 2, className = "" }: SectionTitleProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <header className={["ui-section-title", className].filter(Boolean).join(" ")}>
      <div className="ui-section-title-main">
        {icon && <span className="ui-section-title-icon" aria-hidden="true"><FontAwesomeIcon icon={icon} /></span>}
        <div className="ui-section-title-copy">
          {eyebrow && <p className="ui-section-title-eyebrow">{eyebrow}</p>}
          <Heading id={titleId} className="ui-section-title-heading">{title}</Heading>
          {description && <div className="ui-section-title-description">{description}</div>}
        </div>
      </div>
      {action && <div className="ui-section-title-action">{action}</div>}
    </header>
  );
}
