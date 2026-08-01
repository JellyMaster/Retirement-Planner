import type { HTMLAttributes, ReactNode } from "react";

export type CardTone = "default" | "subtle" | "accent" | "success" | "warning" | "danger";
export type CardPadding = "none" | "small" | "medium" | "large";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "article" | "div";
  tone?: CardTone;
  padding?: CardPadding;
  interactive?: boolean;
}

export function Card({
  as: Component = "section",
  children,
  className = "",
  tone = "default",
  padding = "medium",
  interactive = false,
  ...props
}: CardProps) {
  const classes = [
    "ui-card",
    `ui-card-${tone}`,
    `ui-card-padding-${padding}`,
    interactive ? "ui-card-interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
