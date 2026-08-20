import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Info } from "lucide-react";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { AppIcons } from "../../icons";
import {
  getDisplaySummary,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownInsightsProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

type InsightStatus = "positive" | "warning" | "neutral";

export function DrawdownInsights({ inputs, result, displayMode }: DrawdownInsightsProps) {
  const display = getDisplaySummary(result, inputs.inflationRate, displayMode);
  const shortfallAge = result.incomeTargetMode === "net"
    ? result.firstNetIncomeShortfallAge
    : result.firstShortfallAge;

  return (
    <section className="panel dashboard-insights" aria-labelledby="drawdown-insights-heading">
      <div className="panel-heading dashboard-panel-heading">
        <div>
          <p className="panel-eyebrow">At a glance</p>
          <h2 id="drawdown-insights-heading">What this means</h2>
        </div>
        <span className="drawdown-insights-money-basis">
          {displayMode === "today" ? "Today’s money" : "Future money"}
        </span>
      </div>
      <ul className="insights-list">
        <Insight
          status={result.depletionAge === null ? "positive" : "warning"}
          title={result.depletionAge === null ? "Pension lasts throughout the plan" : `Pension depletes at age ${result.depletionAge}`}
          warningExplanation={result.depletionAge === null ? undefined : "Your pension is projected to reach zero before the end of your planning period under the current assumptions. You may wish to review your retirement income target, retirement age, tax-free cash or withdrawal strategy."}
        />
        <Insight
          status={shortfallAge === null ? "positive" : "warning"}
          title={shortfallAge === null ? "Income target is fully funded" : `First income shortfall at age ${shortfallAge}`}
          warningExplanation={shortfallAge === null ? undefined : `From age ${shortfallAge}, the model cannot fully meet your selected retirement income target. This does not necessarily mean you have no retirement income, but one or more years are projected to fall below your target. Review your income target, withdrawal strategy, tax-free cash or retirement timing to explore the impact.`}
        />
        <Insight title={`${formatPercentage(result.averageEffectiveTaxRate)} average effective tax rate`} />
        <Insight title={`${formatCurrency(display.totalIncomeTax)} projected lifetime income tax`} />
        <Insight title={`${formatCurrency(display.finalBalance)} remaining at planning age`} />
      </ul>
    </section>
  );
}

function Insight({ title, status = "neutral", warningExplanation }: {
  title: string;
  status?: InsightStatus;
  warningExplanation?: string;
}) {
  const tooltipId = useId();

  return (
    <li className={`insight-item insight-item-${status}${status === "warning" ? " insight-item-has-tooltip" : ""}`}>
      <span className="insight-icon" aria-hidden="true">
        <FontAwesomeIcon icon={status === "warning" ? AppIcons.warning : AppIcons.check} />
      </span>
      <span className="insight-title">{title}</span>
      {status === "warning" && warningExplanation && (
        <span className="insight-warning-tooltip">
          <button
            type="button"
            className="insight-warning-tooltip-trigger"
            aria-label={`Explain why ${title.toLowerCase()} needs attention`}
            aria-describedby={tooltipId}
          >
            <Info size={15} aria-hidden="true" />
          </button>
          <span id={tooltipId} className="insight-warning-tooltip-panel" role="tooltip">
            <strong>Why this needs attention</strong>
            <span>{warningExplanation}</span>
          </span>
        </span>
      )}
    </li>
  );
}
