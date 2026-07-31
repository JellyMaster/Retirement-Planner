import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { getDisplaySummary, getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownSustainabilityDashboardProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

type SustainabilityStatus = "strong" | "watch" | "risk";

interface SustainabilityAssessment {
  status: SustainabilityStatus;
  label: string;
  summary: string;
  score: number;
}

function assessSustainability(result: DrawdownResult): SustainabilityAssessment {
  if (result.withdrawalStrategy === "percentage") {
    const reserveRatio = result.balanceAfterTaxFreeCash <= 0 ? 0 : Math.min(1, result.finalBalance / result.balanceAfterTaxFreeCash);
    const score = Math.round(Math.max(0, Math.min(100, 70 + (reserveRatio * 30))));
    return {
      status: result.depletionAge === null ? "strong" : "watch",
      label: result.depletionAge === null ? "Responsive income" : "Needs monitoring",
      summary: result.depletionAge === null
        ? "Withdrawals adjust with the pension balance, so income can rise or fall while preserving flexibility."
        : "The selected percentage eventually exhausts the pension under these assumptions.",
      score,
    };
  }
  const targetShortfall = result.incomeTargetMode === "net"
    ? result.totalNetIncomeShortfall
    : result.totalIncomeShortfall;
  const fundedYears = result.years.filter((year) => (
    result.incomeTargetMode === "net" ? year.netIncomeShortfall === 0 : year.incomeShortfall === 0
  )).length;
  const coverage = result.years.length === 0 ? 0 : fundedYears / result.years.length;
  const endingReserveRatio = result.balanceAfterTaxFreeCash <= 0
    ? 0
    : Math.min(1, result.finalBalance / result.balanceAfterTaxFreeCash);

  const score = Math.round(Math.max(0, Math.min(100,
    (coverage * 80) + (result.depletionAge === null ? 10 : 0) + (endingReserveRatio * 10),
  )));

  if (result.depletionAge === null && targetShortfall === 0) {
    return {
      status: "strong",
      label: "Sustainable",
      summary: "The selected income target is funded throughout the full planning period.",
      score,
    };
  }

  if (coverage >= 0.8) {
    return {
      status: "watch",
      label: "Needs monitoring",
      summary: "Most retirement years are funded, but the plan develops a later-life income gap.",
      score,
    };
  }

  return {
    status: "risk",
    label: "Action required",
    summary: "The current withdrawal plan creates a material income shortfall during retirement.",
    score,
  };
}

export function DrawdownSustainabilityDashboard({
  inputs,
  result,
  inflationRate,
  displayMode,
}: DrawdownSustainabilityDashboardProps) {
  const assessment = assessSustainability(result);
  const display = getDisplaySummary(result, inflationRate, displayMode);
  const displayYears = getDisplayYears(result.years, inflationRate, displayMode);
  const shortfallSelector = result.incomeTargetMode === "net"
    ? (year: (typeof displayYears)[number]) => year.netIncomeShortfall
    : (year: (typeof displayYears)[number]) => year.incomeShortfall;
  const fundedYears = displayYears.filter((year) => shortfallSelector(year) === 0).length;
  const totalYears = displayYears.length;
  const firstGapAge = result.incomeTargetMode === "net"
    ? result.firstNetIncomeShortfallAge
    : result.firstShortfallAge;
  const lowestBalance = displayYears.reduce(
    (lowest, year) => Math.min(lowest, year.closingBalance),
    displayYears[0]?.closingBalance ?? display.finalBalance,
  );
  const targetCoverage = totalYears === 0 ? 0 : fundedYears / totalYears;
  const planningEndAge = inputs.endAge;
  const pensionWithdrawals = displayYears.map((year) => year.pensionWithdrawal);
  const firstYearWithdrawal = pensionWithdrawals[0] ?? 0;
  const averageWithdrawal = pensionWithdrawals.length === 0 ? 0 : pensionWithdrawals.reduce((total, value) => total + value, 0) / pensionWithdrawals.length;
  const lowestWithdrawal = pensionWithdrawals.length === 0 ? 0 : Math.min(...pensionWithdrawals);
  const highestWithdrawal = pensionWithdrawals.length === 0 ? 0 : Math.max(...pensionWithdrawals);

  return (
    <section className={`panel drawdown-health-dashboard drawdown-health-${assessment.status}`} aria-labelledby="drawdown-health-heading">
      <div className="drawdown-health-hero">
        <div>
          <p className="panel-eyebrow">Retirement sustainability</p>
          <div className="drawdown-health-title-row">
            <h2 id="drawdown-health-heading">{assessment.label}</h2>
            <span className={`drawdown-health-badge drawdown-health-badge-${assessment.status}`}>
              {assessment.score}/100
            </span>
          </div>
          <p>{assessment.summary}</p>
        </div>

        <div className="drawdown-health-score" aria-label={`Sustainability score ${assessment.score} out of 100`}>
          <strong>{assessment.score}</strong>
          <span>out of 100</span>
        </div>
      </div>

      <div className="drawdown-health-progress" aria-hidden="true">
        <span style={{ width: `${assessment.score}%` }} />
      </div>

      <div className="drawdown-health-metrics">
        {result.withdrawalStrategy === "percentage" ? (
          <>
            <HealthMetric
              label="Withdrawal rate"
              value={formatPercentage(result.withdrawalRate)}
              detail="Applied to each year's opening pension balance"
            />
            <HealthMetric
              label="First-year withdrawal"
              value={formatCurrency(firstYearWithdrawal)}
              detail={`${formatCurrency(firstYearWithdrawal / 12)} per month before tax`}
            />
            <HealthMetric
              label="Average annual withdrawal"
              value={formatCurrency(averageWithdrawal)}
              detail="Across the full projection"
            />
            <HealthMetric
              label="Withdrawal range"
              value={`${formatCurrency(lowestWithdrawal)} – ${formatCurrency(highestWithdrawal)}`}
              detail="Income varies with portfolio value"
            />
          </>
        ) : (
          <>
            <HealthMetric
              label="Income funded"
              value={`${fundedYears} of ${totalYears} years`}
              detail={`${formatPercentage(targetCoverage)} target coverage`}
            />
            <HealthMetric
              label="Income sustainability"
              value={firstGapAge === null ? `Through age ${planningEndAge}` : `Until age ${firstGapAge - 1}`}
              detail={firstGapAge === null ? "No modelled income shortfall" : `First shortfall at age ${firstGapAge}`}
            />
          </>
        )}
        <HealthMetric
          label="Final portfolio"
          value={formatCurrency(display.finalBalance)}
          detail={result.depletionAge === null ? `Remaining at age ${planningEndAge}` : `Portfolio depleted at age ${result.depletionAge}`}
        />
        <HealthMetric
          label="Lowest balance"
          value={formatCurrency(lowestBalance)}
          detail="Lowest year-end pension value"
        />
        <HealthMetric
          label="Lifetime net income"
          value={formatCurrency(display.totalNetIncome)}
          detail={`${formatCurrency(display.totalIncomeTax)} estimated income tax`}
        />
        <HealthMetric
          label="Legacy reserve"
          value={formatCurrency(display.finalBalance)}
          detail={display.finalBalance > 0 ? "Potential balance remaining" : "No pension balance remaining"}
        />
      </div>

      <p className="drawdown-health-note">
        This is a deterministic illustration based on the selected assumptions, not a probability of success.
      </p>
    </section>
  );
}

function HealthMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="drawdown-health-metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
