import type { ReactNode } from "react";

interface DrawdownExplorerPanelProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
}

interface DrawdownExplorerSectionProps {
  children: ReactNode;
  className?: string;
}

export function DrawdownExplorerPanel({
  eyebrow,
  title,
  description,
  children,
}: DrawdownExplorerPanelProps) {
  const hasHeading = eyebrow || title || description;

  return (
    <section className="panel drawdown-explorer-panel">
      {hasHeading && (
        <header className="drawdown-explorer-panel-heading">
          {eyebrow && <p className="panel-eyebrow">{eyebrow}</p>}
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </header>
      )}
      <div className="drawdown-explorer-panel-content">{children}</div>
    </section>
  );
}

export function DrawdownExplorerSection({
  children,
  className,
}: DrawdownExplorerSectionProps) {
  const classes = ["drawdown-explorer-section", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
