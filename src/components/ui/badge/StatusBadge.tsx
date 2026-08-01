import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HTMLAttributes, ReactNode } from "react";

export type StatusBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

export type StatusBadgeSize = "small" | "medium";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: StatusBadgeTone;
  size?: StatusBadgeSize;
  icon?: IconDefinition;
}

export function StatusBadge({
  children,
  tone = "neutral",
  size = "medium",
  icon,
  className = "",
  ...props
}: StatusBadgeProps) {
  const classes = [
    "ui-status-badge",
    `ui-status-badge-${tone}`,
    `ui-status-badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {icon && (
        <FontAwesomeIcon
          className="ui-status-badge-icon"
          icon={icon}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
