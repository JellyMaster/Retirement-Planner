import type { HTMLAttributes, ReactNode } from "react";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}

export function ButtonGroup({ children, align = "start", wrap = true, className = "", ...props }: ButtonGroupProps) {
  return (
    <div className={["ui-button-group", `ui-button-group-${align}`, wrap ? "ui-button-group-wrap" : "", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
