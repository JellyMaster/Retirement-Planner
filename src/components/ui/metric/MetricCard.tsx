import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HTMLAttributes, ReactNode } from "react";

import { Card, type CardTone } from "../card";

export type MetricCardTone = "neutral" | "positive" | "warning" | "negative" | "accent";

export interface MetricCardProps extends HTMLAttributes<HTMLElement> {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon?: IconDefinition;
  tone?: MetricCardTone;
  trend?: ReactNode;
  compact?: boolean;
}

function getCardTone(tone: MetricCardTone): CardTone {
  if (tone === "positive") return "success";
  if (tone === "warning") return "warning";
  if (tone === "negative") return "danger";
  if (tone === "accent") return "accent";
  return "subtle";
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "neutral",
  trend,
  compact = false,
  className = "",
  ...props
}: MetricCardProps) {
  return (
    <Card
      as="article"
      className={["ui-metric-card", `ui-metric-card-${tone}`, compact ? "ui-metric-card-compact" : "", className]
        .filter(Boolean)
        .join(" ")}
      padding={compact ? "small" : "medium"}
      tone={getCardTone(tone)}
      {...props}
    >
      <div className="ui-metric-card-heading">
        {icon && (
          <span className="ui-metric-card-icon" aria-hidden="true">
            <FontAwesomeIcon icon={icon}   />
          </span>
        )}
        <span className="ui-metric-card-label">{label}</span>
      </div>

      <div className="ui-metric-card-value">{value}</div>

      {(helper || trend) && (
        <div className="ui-metric-card-footer">
          {helper && <span className="ui-metric-card-helper">{helper}</span>}
          {trend && <span className="ui-metric-card-trend">{trend}</span>}
        </div>
      )}
    </Card>
  );
}
