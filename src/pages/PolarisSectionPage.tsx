import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface PolarisSectionPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  primaryAction?: {
    label: string;
    to: string;
  };
}

export function PolarisSectionPage({
  eyebrow,
  title,
  description,
  children,
  primaryAction,
}: PolarisSectionPageProps) {
  return (
    <main className="polaris-section-page">
      <header className="polaris-section-hero">
        <p className="planner-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>

        {primaryAction ? (
          <NavLink className="ui-button ui-button-primary" to={primaryAction.to}>
            {primaryAction.label}
          </NavLink>
        ) : null}
      </header>

      {children ? <div className="polaris-section-content">{children}</div> : null}
    </main>
  );
}
