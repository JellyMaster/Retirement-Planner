import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconDefinition;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "start",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "ui-button",
    `ui-button-${variant}`,
    `ui-button-${size}`,
    fullWidth ? "ui-button-full-width" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon && iconPosition === "start" && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
      <span>{children}</span>
      {icon && iconPosition === "end" && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
    </button>
  );
}
