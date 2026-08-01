import { useMemo } from "react";
import { Link } from "react-router-dom";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { MonteCarloDrawdownEngine } from "../../engine/monte-carlo-drawdown";
import { AppIcons } from "../../icons";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";
import {
  Card,
  CardHeader,
  MetricCard,
  MetricGrid,
  ProgressRing,
  StatusBadge,
  type ProgressTone,
  type StatusBadgeTone,
} from "../ui";
import { createSustainabilityDrawdownInputs } from "./createSustainabilityDrawdownInputs";
import { RetirementSurvivalChart } from "./RetirementSurvivalChart";
import { SustainabilityInterpretation } from "./SustainabilityInterpretation";

interface RetirementSustainabilityDashboardProps {
  inputs: PensionInputs;
  projection: ProjectionResult;
  goals: RetirementGoals;
  simulations?: number;
  annualVolatility?: number;
  seed?: number;
  endAge?: number;
}

function getPresentation(probability: number): {
  label: string;
  badgeTone: StatusBadgeTone;
  progressTone: ProgressTone;
} {
  if (probability >= 0.9) {
    return { label: "High resilience", badgeTone: "success", progressTone: "success" };
  }
  if (probability >= 0.7) {
    return { label: "Moderate resilience", badgeTone: "warning", progressTone: "warning" };
  }
  return { label: "Lower resilience", badgeTone: "danger", progressTone: "danger" };
}

export function RetirementSustainabilityDashboard({
  inputs,
  projection,
  goals,
  simulations = 2_000,
  annualVolatility = 0.12,
  seed = 12_345,
  endAge = 95,
}: RetirementSustainabilityDashboardProps) {
  const drawdownInputs = useMemo(
    () =>
      createSustainabilityDrawdownInputs(inputs, projection, goals, {
        endAge,
      }),
    [endAge, goals, inputs, projection],
  );

  const result = useMemo(
    () =>
      new MonteCarloDrawdownEngine().calculate({
        drawdownInputs,
        simulations,
        annualVolatility,
        seed,
      }),
    [annualVolatility, drawdownInputs, seed, simulations],
  );

  const presentation = getPresentation(result.survivalProbability);
  const survivalPercent = result.survivalProbability * 100;
  const reliabilityPercent = result.incomeReliabilityProbability * 100;
  const downsideEndBalance = result.finalBalance.p10;
  const medianEndBalance = result.finalBalance.p50;

  return (
    <div className="retirement-sustainability-stack">
      <Card
        className="retirement-sustainability-dashboard"
        padding="large"
        aria-labelledby="retirement-sustainability-heading"
      >
        <div className="retirement-sustainability-hero">
          <CardHeader
            eyebrow="Retirement sustainability"
            title="Will your pension last?"
            titleId="retirement-sustainability-heading"
            description={`This models ${simulations.toLocaleString("en-GB")} retirement paths from age ${inputs.retirementAge} to ${result.endAge}, using variable annual returns and your income goal.`}
            icon={AppIcons.health}
            badge={
              <StatusBadge tone={presentation.badgeTone} icon={AppIcons.chart}>
                {presentation.label}
              </StatusBadge>
            }
          />

          <ProgressRing
            className="retirement-sustainability-ring"
            value={survivalPercent}
            label={`Funded to age ${result.endAge}`}
            tone={presentation.progressTone}
            size="large"
            valueFormatter={(value) => `${Math.round(value)}%`}
            aria-valuetext={`${Math.round(survivalPercent)} percent of simulations remained funded to age ${result.endAge}`}
          />
        </div>

        <MetricGrid columns={4}>
          <MetricCard
            label="Income reliability"
            value={`${Math.round(reliabilityPercent)}%`}
            helper="Income goal met every year"
            icon={AppIcons.money}
            tone={reliabilityPercent >= 90 ? "positive" : reliabilityPercent >= 70 ? "warning" : "negative"}
          />
          <MetricCard
            label="Median depletion age"
            value={result.medianDepletionAge === null ? `Beyond ${result.endAge}` : `Age ${Math.round(result.medianDepletionAge)}`}
            helper={result.medianDepletionAge === null ? "No median depletion within the model" : "Among paths that depleted"}
            icon={AppIcons.clock}
            tone={result.medianDepletionAge === null ? "positive" : "warning"}
          />
          <MetricCard
            label={`Median balance at ${result.endAge}`}
            value={formatCompactCurrency(medianEndBalance)}
            helper="Today's-money basis"
            icon={AppIcons.wallet}
            tone={medianEndBalance > 0 ? "positive" : "negative"}
          />
          <MetricCard
            label="Downside balance"
            value={formatCompactCurrency(downsideEndBalance)}
            helper="10th-percentile outcome"
            icon={AppIcons.warning}
            tone={downsideEndBalance > 0 ? "warning" : "negative"}
          />
        </MetricGrid>

        <SustainabilityInterpretation result={result} />

        <div className="retirement-sustainability-actions">
          <Link className="ui-button ui-button-primary ui-button-medium" to="/drawdown">
            Explore retirement income
          </Link>
          <span>
            Starting balance {formatCurrency(drawdownInputs.startingBalance)} · Target income {formatCurrency(drawdownInputs.desiredAnnualIncome)} a year
          </span>
        </div>

        <p className="retirement-sustainability-disclaimer">
          This is an illustrative stochastic model using the projected pension in today's money, a real return derived from your growth and inflation assumptions, current UK tax rules, and no tax-free cash withdrawal. It is not a forecast, guarantee or regulated financial advice.
        </p>
      </Card>

      <RetirementSurvivalChart statistics={result.ageStatistics} />
    </div>
  );
}
