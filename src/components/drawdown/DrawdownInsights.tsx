import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { AppIcons } from "../../icons";
import {
  getDisplaySummary,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { InfoTooltip } from "../ui";

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
          <h2 id="drawdown-insights-heading">Key observations</h2>
        </div>
        <span className="drawdown-insights-money-basis">
          {displayMode === "today" ? "Today’s money" : "Future money"}
        </span>
      </div>
      <ul className="insights-list">
        <Insight
          status={result.depletionAge === null ? "positive" : "warning"}
          title={result.depletionAge === null ? "Pension lasts throughout the plan" : `Pension depletes at age ${result.depletionAge}`}
          warningReason={result.depletionAge === null ? undefined : `Based on your current assumptions, your pension is projected to run out at age ${result.depletionAge}, before the end of your planning period.`}
          warningActions={result.depletionAge === null ? undefined : [
            "Retirement income target",
            "Retirement age",
            "Tax-free cash amount",
            "Withdrawal strategy",
          ]}
        />
        <Insight
          status={shortfallAge === null ? "positive" : "warning"}
          title={shortfallAge === null ? "Income target is fully funded" : `First income shortfall at age ${shortfallAge}`}
          warningReason={shortfallAge === null ? undefined : `Based on your current assumptions, your pension can no longer fully provide your chosen retirement income from age ${shortfallAge}. This does not mean your pension has run out — it means the amount available to spend would fall below your target unless something changes.`}
          warningActions={shortfallAge === null ? undefined : [
            "Retirement income target",
            "Retirement age",
            "Tax-free cash amount",
            "Withdrawal strategy",
          ]}
        />
        <Insight title={`${formatPercentage(result.averageEffectiveTaxRate)} average effective tax rate`} />
        <Insight title={`${formatCurrency(display.totalIncomeTax)} projected lifetime income tax`} />
        <Insight title={`${formatCurrency(display.finalBalance)} remaining at planning age`} />
      </ul>
    </section>
  );
}

function Insight({
  title,
  status = "neutral",
  warningReason,
  warningActions,
}: {
  title: string;
  status?: InsightStatus;
  warningReason?: string;
  warningActions?: string[];
}) {
  const hasWarningTooltip = status === "warning" && warningReason;

  return (
    <li className={`insight-item insight-item-${status}${hasWarningTooltip ? " insight-item-has-tooltip" : ""}`}>
      <span className="insight-icon" aria-hidden="true">
        <FontAwesomeIcon icon={status === "warning" ? AppIcons.warning : AppIcons.check} />
      </span>
      <span className="insight-title">{title}</span>
      {hasWarningTooltip && (
        <InfoTooltip
          ariaLabel={`Explain why ${title.toLowerCase()} needs attention`}
          title="Why am I seeing this?"
        >
          <span>{warningReason}</span>
          {warningActions && warningActions.length > 0 && (
            <span className="insight-warning-tooltip-actions">
              <b>Things you could review</b>
              <ul>
                {warningActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </span>
          )}
        </InfoTooltip>
      )}
    </li>
  );
}
