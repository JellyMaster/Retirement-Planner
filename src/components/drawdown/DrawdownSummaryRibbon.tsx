import { CircleAlert, CircleCheck, Coins, Landmark, ReceiptText } from "lucide-react";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { getDisplaySummary, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownSummaryRibbonProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

export function DrawdownSummaryRibbon({
  inputs,
  result,
  displayMode,
}: DrawdownSummaryRibbonProps) {
  const display = getDisplaySummary(result, inputs.inflationRate, displayMode);
  const shortfall = result.incomeTargetMode === "net"
    ? display.totalNetIncomeShortfall
    : display.totalIncomeShortfall;
  const isSustainable = result.depletionAge === null && shortfall === 0;
  const averageAnnualNetIncome = result.years.length > 0
    ? display.totalNetIncome / result.years.length
    : 0;

  return (
    <section className="drawdown-summary-ribbon" aria-label="Retirement plan summary">
      <article className={isSustainable ? "drawdown-summary-item status-good" : "drawdown-summary-item status-warning"}>
        <span className="drawdown-summary-icon" aria-hidden="true">
          {isSustainable ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
        </span>
        <span>
          <small>Plan status</small>
          <strong>{isSustainable ? "On track" : "Review needed"}</strong>
          <em>{result.depletionAge === null ? `Through age ${inputs.endAge}` : `Pension used by age ${result.depletionAge}`}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><Coins size={18} /></span>
        <span>
          <small>Final pension</small>
          <strong>{formatCurrency(display.finalBalance)}</strong>
          <em>At age {inputs.endAge}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><ReceiptText size={18} /></span>
        <span>
          <small>Average net income</small>
          <strong>{formatCurrency(averageAnnualNetIncome)}</strong>
          <em>{displayMode === "today" ? "Today’s money" : "Future money"}</em>
        </span>
      </article>

      <article className={shortfall > 0 ? "drawdown-summary-item status-danger" : "drawdown-summary-item status-good"}>
        <span className="drawdown-summary-icon" aria-hidden="true"><Landmark size={18} /></span>
        <span>
          <small>Lifetime shortfall</small>
          <strong>{formatCurrency(shortfall)}</strong>
          <em>{shortfall > 0 ? "Across retirement" : "No income gap"}</em>
        </span>
      </article>
    </section>
  );
}
