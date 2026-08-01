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

  return (
    <section className="drawdown-summary-ribbon" aria-label="Drawdown summary">
      <article className={isSustainable ? "drawdown-summary-item status-good" : "drawdown-summary-item status-warning"}>
        <span className="drawdown-summary-icon" aria-hidden="true">
          {isSustainable ? <CircleCheck size={19} /> : <CircleAlert size={19} />}
        </span>
        <span>
          <small>Plan status</small>
          <strong>{isSustainable ? "Income target funded" : "Review required"}</strong>
          <em>{result.depletionAge === null ? `Modelled through age ${inputs.endAge}` : `Pension depletes at age ${result.depletionAge}`}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><Coins size={19} /></span>
        <span>
          <small>Final pension balance</small>
          <strong>{formatCurrency(display.finalBalance)}</strong>
          <em>At age {inputs.endAge}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><ReceiptText size={19} /></span>
        <span>
          <small>Lifetime net income</small>
          <strong>{formatCurrency(display.totalNetIncome)}</strong>
          <em>{formatCurrency(display.totalIncomeTax)} estimated tax</em>
        </span>
      </article>

      <article className={shortfall > 0 ? "drawdown-summary-item status-danger" : "drawdown-summary-item status-good"}>
        <span className="drawdown-summary-icon" aria-hidden="true"><Landmark size={19} /></span>
        <span>
          <small>Lifetime shortfall</small>
          <strong>{formatCurrency(shortfall)}</strong>
          <em>{shortfall > 0 ? "Across the planning period" : "No modelled income gap"}</em>
        </span>
      </article>
    </section>
  );
}
