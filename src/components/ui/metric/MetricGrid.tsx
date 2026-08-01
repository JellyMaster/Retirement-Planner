import type { HTMLAttributes, ReactNode } from "react";

export interface MetricGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function MetricGrid({
  children,
  columns = 4,
  className = "",
  ...props
}: MetricGridProps) {
  return (
    <div
      className={["ui-metric-grid", `ui-metric-grid-${columns}`, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
