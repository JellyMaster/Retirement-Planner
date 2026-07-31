import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownInsightsProps {
  result: DrawdownResult;
}

export function DrawdownInsights({ result }: DrawdownInsightsProps) {
  const shortfallAge = result.incomeTargetMode === "net"
    ? result.firstNetIncomeShortfallAge
    : result.firstShortfallAge;

  return (
    <section className="panel dashboard-insights" aria-labelledby="drawdown-insights-heading">
      <div className="panel-heading dashboard-panel-heading">
        <div>
          <p className="panel-eyebrow">At a glance</p>
          <h2 id="drawdown-insights-heading">Key insights</h2>
        </div>
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
        <Insight title={`${formatCurrency(result.totalIncomeTax)} projected lifetime income tax`} />
        <Insight title={`${formatCurrency(result.finalBalance)} remaining at planning age`} />
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
