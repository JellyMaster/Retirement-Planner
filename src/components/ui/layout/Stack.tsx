import type { HTMLAttributes, ReactNode } from "react";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: "small" | "medium" | "large" | "xlarge";
  align?: "stretch" | "start" | "center" | "end";
}

export function Stack({ children, gap = "medium", align = "stretch", className = "", ...props }: StackProps) {
  return <div className={["ui-stack", `ui-stack-gap-${gap}`, `ui-stack-align-${align}`, className].filter(Boolean).join(" ")} {...props}>{children}</div>;
}
