import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface RetirementKpiGridProps {
  projectedPot: number;
  estimatedIncome: number;
  annualGap: number;
  retirementAge: number;
  yearsToRetirement: number;
}

interface RetirementKpi {
  label: string;
  value: string;
  detail: string;
  icon: IconDefinition;
  tone?: "positive" | "negative" | "neutral";
}

export function RetirementKpiGrid({
  projectedPot,
  estimatedIncome,
  annualGap,
  retirementAge,
  yearsToRetirement,
}: RetirementKpiGridProps) {
  const targetDetail =
    annualGap >= 0
      ? `${formatCurrency(annualGap)} above your annual target`
      : `${formatCurrency(Math.abs(annualGap))} below your annual target`;

  const kpis: RetirementKpi[] = [
    {
      label: "Projected pension",
      value: formatCurrency(projectedPot),
      detail: "Estimated value in today’s money",
      icon: AppIcons.pension,
    },
    {
      label: "Illustrated income",
      value: `${formatCurrency(estimatedIncome)} / year`,
      detail: targetDetail,
      icon: AppIcons.money,
      tone: annualGap >= 0 ? "positive" : "negative",
    },
    {
      label: "Planned retirement",
      value: `Age ${retirementAge}`,
      detail:
        yearsToRetirement === 1
          ? "1 year from your current age"
          : `${yearsToRetirement} years from your current age`,
      icon: AppIcons.calendar,
    },
    {
      label: "Target position",
      value: annualGap >= 0 ? "Target covered" : "Target shortfall",
      detail: targetDetail,
      icon: annualGap >= 0 ? AppIcons.success : AppIcons.warning,
      tone: annualGap >= 0 ? "positive" : "negative",
    },
  ];

  return (
    <div className="retirement-overview-kpi-grid">
      {kpis.map((kpi) => (
        <article
          className={`retirement-overview-kpi retirement-overview-kpi-${kpi.tone ?? "neutral"}`}
          key={kpi.label}
        >
          <span className="retirement-overview-kpi-icon" aria-hidden="true">
            <FontAwesomeIcon icon={kpi.icon} />
          </span>
          <div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.detail}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
