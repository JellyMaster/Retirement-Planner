import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  ariaLabel: string;
  title?: string;
  children: ReactNode;
  align?: "left" | "right";
  size?: "small" | "medium";
}

export function InfoTooltip({
  ariaLabel,
  title,
  children,
  align = "right",
  size = "small",
}: InfoTooltipProps) {
  const tooltipId = useId();

  return (
    <span className={`ui-info-tooltip ui-info-tooltip-${align}`}>
      <button
        type="button"
        className={`ui-info-tooltip-trigger ui-info-tooltip-trigger-${size}`}
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
      >
        <Info size={size === "small" ? 15 : 16} aria-hidden="true" />
      </button>
      <span id={tooltipId} className="ui-info-tooltip-panel" role="tooltip">
        {title && <strong className="ui-info-tooltip-title">{title}</strong>}
        <span className="ui-info-tooltip-content">{children}</span>
      </span>
    </span>
  );
}
