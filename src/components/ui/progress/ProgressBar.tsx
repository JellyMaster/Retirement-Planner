import type { HTMLAttributes, ReactNode } from "react";

import type { ProgressTone } from "./ProgressRing";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  tone?: ProgressTone;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  tone = "accent",
  className = "",
  ...props
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.max(0, Math.min(safeMax, value));
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className={["ui-progress-bar-group", className].filter(Boolean).join(" ")} {...props}>
      {(label || showValue) && (
        <div className="ui-progress-bar-header">
          {label && <span>{label}</span>}
          {showValue && <strong>{Math.round(safeValue)}/{safeMax}</strong>}
        </div>
      )}
      <div
        className={["ui-progress-bar", `ui-progress-bar-${tone}`].join(" ")}
        role="progressbar"
        aria-label={typeof label === "string" ? label : "Progress"}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
