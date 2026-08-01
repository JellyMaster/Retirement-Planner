import type { MonteCarloDrawdownResult } from "../../engine/monte-carlo-drawdown";
import { formatCurrency } from "../../utils/formatters";

interface SustainabilityInterpretationProps {
  result: MonteCarloDrawdownResult;
}

export function SustainabilityInterpretation({
  result,
}: SustainabilityInterpretationProps) {
  const survivalPercent = Math.round(result.survivalProbability * 100);
  const reliabilityPercent = Math.round(
    result.incomeReliabilityProbability * 100,
  );

  let headline = "Your retirement income needs attention.";
  let summary =
    "A meaningful proportion of simulated retirement paths run short before the selected end age. Review spending, retirement timing or contributions in Improve my plan.";

  if (result.survivalProbability >= 0.9 && result.incomeReliabilityProbability >= 0.9) {
    headline = "Your retirement plan looks resilient.";
    summary =
      "Most simulated paths remain funded and meet the selected income goal throughout retirement.";
  } else if (
    result.survivalProbability >= 0.7 &&
    result.incomeReliabilityProbability >= 0.7
  ) {
    headline = "Your plan has a reasonable foundation, with some risk.";
    summary =
      "Most paths remain funded, but weaker market sequences can still create income shortfalls or earlier depletion.";
  }

  return (
    <div className="retirement-sustainability-interpretation">
      <div>
        <strong>{headline}</strong>
        <p>{summary}</p>
      </div>
      <div className="retirement-sustainability-interpretation-stats">
        <span>{survivalPercent}% funded to age {result.endAge}</span>
        <span>{reliabilityPercent}% meet income every year</span>
        {result.medianTotalIncomeShortfall > 0 && (
          <span>
            Median lifetime shortfall {formatCurrency(result.medianTotalIncomeShortfall)}
          </span>
        )}
      </div>
    </div>
  );
}
