
import type { ProjectionResult } from "../../engine/models/ProjectionResult";

interface ScenarioSummaryCardProps {
  title: string;
  result: ProjectionResult;
  retirementAge: number;
  monthlyContribution: number;
  difference?: number;
}

import { formatCurrency } from "../../utils/formatters";

export function ScenarioSummaryCard({
  title,
  result,
  retirementAge,
  monthlyContribution,
  difference,
}: ScenarioSummaryCardProps) {
  return (
    <article className="scenario-summary-card">
      <div className="scenario-summary-heading">
        <div>
          <p className="scenario-label">Scenario</p>
          <h3>{title}</h3>
        </div>

        {difference !== undefined && (
          <DifferenceBadge value={difference} />
        )}
      </div>

      <div className="scenario-primary-result">
        <span>Projected pension</span>

        <strong>
          {formatCurrency(result.finalBalance.nominal)}
        </strong>
      </div>

      <dl className="scenario-stat-list">
        <ScenarioStat
          label="Retirement age"
          value={String(retirementAge)}
        />

        <ScenarioStat
          label="Monthly contribution"
          value={formatCurrency(
            monthlyContribution
          )}
        />

        <ScenarioStat
          label="Total contributions"
          value={formatCurrency(
            result.totalContributions.nominal
          )}
        />

        <ScenarioStat
          label="Investment growth"
          value={formatCurrency(
            result.totalInvestmentGrowth.nominal
          )}
        />

        <ScenarioStat
          label="Total fees"
          value={formatCurrency(
            result.totalFees.nominal  
          )}
        />
      </dl>
    </article>
  );
}

interface ScenarioStatProps {
  label: string;
  value: string;
}

function ScenarioStat({
  label,
  value,
}: ScenarioStatProps) {
  return (
    <div className="scenario-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

interface DifferenceBadgeProps {
  value: number;
}

function DifferenceBadge({
  value,
}: DifferenceBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const className = [
    "scenario-difference",
    isPositive
      ? "scenario-difference-positive"
      : "",
    isNegative
      ? "scenario-difference-negative"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className}>
      {isPositive ? "+" : ""}
      {formatCurrency(value)}
    </span>
  );
}


