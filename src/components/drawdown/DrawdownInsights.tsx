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
          <h2 id="drawdown-insights-heading">What your plan is telling you</h2>
        </div>
        <span className="drawdown-insights-money-basis">
          {displayMode === "today" ? "Today’s money" : "Future money"}
        </span>
      </div>
      <ul className="insights-list">
        <Insight
          status={result.depletionAge === null ? "positive" : "warning"}
          title={result.depletionAge === null ? `Your pension is expected to last through age ${inputs.endAge}` : `Your pension is expected to run out around age ${result.depletionAge}`}
          warningReason={result.depletionAge === null ? undefined : `Based on your current assumptions, your pension is expected to be exhausted around age ${result.depletionAge}. If this happened, you would need another source of income to continue meeting your planned spending.`}
          warningActions={result.depletionAge === null ? undefined : [
            "Your planned retirement income",
            "When you retire",
            "How much tax-free cash you take",
            "How you take money from your pension",
          ]}
        />
        <Insight
          status={shortfallAge === null ? "positive" : "warning"}
          title={shortfallAge === null ? "Your planned income is fully supported" : `Your planned income may no longer be fully achievable from age ${shortfallAge}`}
          warningReason={shortfallAge === null ? undefined : `Your pension is still expected to have money remaining, but it may not be able to provide the level of income you've chosen from age ${shortfallAge}. This is different from your pension running out completely.`}
          warningActions={shortfallAge === null ? undefined : [
            "Your planned retirement income",
            "When you retire",
            "How much tax-free cash you take",
            "How you take money from your pension",
          ]}
        />
        <Insight title={`${formatPercentage(result.averageEffectiveTaxRate)} of your gross retirement income is paid in tax on average`} />
        <Insight title={`${formatCurrency(display.totalIncomeTax)} estimated tax across the illustration`} />
        <Insight title={`${formatCurrency(display.finalBalance)} could be left in your pension at age ${inputs.endAge}`} />
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
