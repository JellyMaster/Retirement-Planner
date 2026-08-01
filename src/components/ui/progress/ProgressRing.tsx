import type { HTMLAttributes, ReactNode } from "react";

export type ProgressTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type ProgressRingSize = "small" | "medium" | "large";

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: ReactNode;
  helper?: ReactNode;
  tone?: ProgressTone;
  size?: ProgressRingSize;
  valueFormatter?: (value: number, max: number) => ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  label,
  helper,
  tone = "accent",
  size = "medium",
  valueFormatter,
  className = "",
  ...props
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.max(0, Math.min(safeMax, value));
  const percentage = (safeValue / safeMax) * 100;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={["ui-progress-ring", `ui-progress-ring-${tone}`, `ui-progress-ring-${size}`, className]
        .filter(Boolean)
        .join(" ")}
      role="progressbar"
      aria-label={typeof label === "string" ? label : "Progress"}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      aria-valuetext={`${Math.round(safeValue)} out of ${safeMax}`}
      {...props}
    >
      <svg viewBox="0 0 124 124" aria-hidden="true">
        <circle className="ui-progress-ring-track" cx="62" cy="62" r={radius} />
        <circle
          className="ui-progress-ring-value"
          cx="62"
          cy="62"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="ui-progress-ring-copy">
        <strong>{valueFormatter ? valueFormatter(safeValue, safeMax) : Math.round(safeValue)}</strong>
        {!valueFormatter && <span>/{safeMax}</span>}
        {label && <small>{label}</small>}
        {helper && <em>{helper}</em>}
      </div>
    </div>
  );
}
