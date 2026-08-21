import type { ReactNode } from "react";

interface DrawdownExplorerPanelProps {
  eyebrow: string;
  title: string;
  description: string;
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
  return (
    <section className="panel drawdown-explorer-panel">
      <header className="drawdown-explorer-panel-heading">
        <p className="panel-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
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
