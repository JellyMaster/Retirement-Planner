import type { HTMLAttributes, ReactNode } from "react";

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  minItemWidth?: "small" | "medium" | "large";
}

export function DashboardGrid({ children, columns = 2, minItemWidth = "medium", className = "", ...props }: DashboardGridProps) {
  return <div className={["ui-dashboard-grid", `ui-dashboard-grid-${columns}`, `ui-dashboard-grid-min-${minItemWidth}`, className].filter(Boolean).join(" ")} {...props}>{children}</div>;
}
