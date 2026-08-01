import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";

export interface WorkspaceSummaryMetric {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "positive" | "warning" | "negative";
  icon: IconDefinition;
}

interface WorkspaceSummaryRibbonProps {
  readinessScore: number;
  confidenceProbability: number;
  projectedPot: number;
  illustratedIncome: number;
  retirementAge: number;
}

function scoreTone(score: number): WorkspaceSummaryMetric["tone"] {
  if (score >= 100) return "positive";
  if (score >= 85) return "warning";
  return "negative";
}

function confidenceTone(probability: number): WorkspaceSummaryMetric["tone"] {
  if (probability >= 0.9) return "positive";
  if (probability >= 0.7) return "warning";
  return "negative";
}

export function WorkspaceSummaryRibbon({
  readinessScore,
  confidenceProbability,
  projectedPot,
  illustratedIncome,
  retirementAge,
}: WorkspaceSummaryRibbonProps) {
  const metrics: WorkspaceSummaryMetric[] = [
    {
      label: "Readiness",
      value: `${readinessScore}/100`,
      helper: readinessScore >= 100 ? "Target covered" : "Income coverage",
      tone: scoreTone(readinessScore),
      icon: AppIcons.health,
    },
    {
      label: "Confidence",
      value: `${Math.round(confidenceProbability * 100)}%`,
      helper: "Simulated paths reaching target",
      tone: confidenceTone(confidenceProbability),
      icon: AppIcons.chartLine,
    },
    {
      label: "Projected pot",
      value: formatCompactCurrency(projectedPot),
      helper: "Today's money",
      icon: AppIcons.pension,
    },
    {
      label: "Illustrated income",
      value: formatCompactCurrency(illustratedIncome),
      helper: `${formatCurrency(illustratedIncome / 12)} per month`,
      icon: AppIcons.money,
    },
    {
      label: "Retirement age",
      value: String(retirementAge),
      helper: "Current plan",
      icon: AppIcons.calendar,
    },
  ];

  return (
    <section className="workspace-summary-ribbon" aria-label="Retirement plan summary">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className={`workspace-summary-metric workspace-summary-metric-${metric.tone ?? "neutral"}`}
        >
          <span className="workspace-summary-metric-icon" aria-hidden="true">
            <FontAwesomeIcon icon={metric.icon} />
          </span>
          <span>
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
            {metric.helper && <em>{metric.helper}</em>}
          </span>
        </article>
      ))}
    </section>
  );
}
