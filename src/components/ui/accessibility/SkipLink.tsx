import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  targetId?: string;
}

export function SkipLink({
  children = "Skip to main content",
  targetId = "app-main-content",
  className = "",
  ...props
}: SkipLinkProps) {
  return (
    <a
      className={["ui-skip-link", className].filter(Boolean).join(" ")}
      href={`#${targetId}`}
      {...props}
    >
      {children}
    </a>
  );
}
