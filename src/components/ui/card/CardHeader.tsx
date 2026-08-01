import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: IconDefinition;
  badge?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  titleId?: string;
  className?: string;
}

export function CardHeader({
  title,
  description,
  eyebrow,
  icon,
  badge,
  action,
  headingLevel = 2,
  titleId,
  className = "",
}: CardHeaderProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  const headingProps: HTMLAttributes<HTMLHeadingElement> = {
    id: titleId,
    className: "ui-card-header-title",
  };

  return (
    <header className={["ui-card-header", className].filter(Boolean).join(" ")}>
      <div className="ui-card-header-main">
        {icon && (
          <span className="ui-card-header-icon" aria-hidden="true">
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <div className="ui-card-header-copy">
          {eyebrow && <p className="ui-card-header-eyebrow">{eyebrow}</p>}

          <div className="ui-card-header-title-row">
            <Heading {...headingProps}>{title}</Heading>
            {badge}
          </div>

          {description && (
            <div className="ui-card-header-description">{description}</div>
          )}
        </div>
      </div>

      {action && <div className="ui-card-header-action">{action}</div>}
    </header>
  );
}
