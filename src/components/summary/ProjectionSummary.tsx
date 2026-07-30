import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import { formatCurrency } from "../../utils/formatters";

interface ProjectionSummaryProps {
  result: ProjectionResult;
}


export function ProjectionSummary({
  result,
}: ProjectionSummaryProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Your projection</h2>

        <p>
          Estimated values at retirement based on your
          current assumptions.
        </p>
      </div>

      <div className="summary-grid">
        <SummaryCard
          label="Estimated pension pot"
          value={result.finalBalance.nominal}
          secondaryValue={
            result.finalBalance.real
          }
        />

        <SummaryCard
          label="Total contributions"
          value={
            result.totalContributions.nominal
          }
          secondaryValue={
            result.totalContributions.real
          }
        />

        <SummaryCard
          label="Investment growth"
          value={
            result.totalInvestmentGrowth.nominal
          }
          secondaryValue={
            result.totalInvestmentGrowth.real
          }
        />

        <SummaryCard
          label="Total fees"
          value={result.totalFees.nominal}
          secondaryValue={
            result.totalFees.real
          }
        />
      </div>
    </section>
  );
}

interface SummaryCardProps {
  label: string;

  value: number;
  secondaryValue: number;
}

function SummaryCard({
  label,
  value,
  secondaryValue,
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <p className="summary-label">
        {label}
      </p>

      <strong className="summary-value">
        {formatCurrency(value)}
      </strong>

      <p className="summary-real-value">
        {formatCurrency(secondaryValue)} in
        today's money
      </p>
    </article>
  );
}

