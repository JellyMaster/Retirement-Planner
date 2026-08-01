import type { HTMLAttributes, ReactNode } from "react";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function VisuallyHidden({ children, className = "", ...props }: VisuallyHiddenProps) {
  return (
    <span className={["ui-visually-hidden", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}
