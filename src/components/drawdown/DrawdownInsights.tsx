import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

export function DrawdownInsights({
  inputs,
  result,
  displayMode,
}: DrawdownInsightsProps) {
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
        />
        <Insight
          status={shortfallAge === null ? "positive" : "warning"}
          title={shortfallAge === null ? "Income target is fully funded" : `First income shortfall at age ${shortfallAge}`}
        />
        <Insight title={`${formatPercentage(result.averageEffectiveTaxRate)} average effective tax rate`} />
        <Insight title={`${formatCurrency(display.totalIncomeTax)} projected lifetime income tax`} />
        <Insight title={`${formatCurrency(display.finalBalance)} remaining at planning age`} />
      </ul>
    </section>
  );
}

function Insight({ title, status = "neutral" }: { title: string; status?: "positive" | "warning" | "neutral" }) {
  return (
    <li className={`insight-item insight-item-${status}`}>
      <span className="insight-icon" aria-hidden="true"><FontAwesomeIcon icon={status === "warning" ? AppIcons.warning : AppIcons.check} /></span>
      <span>{title}</span>
    </li>
  );
}
