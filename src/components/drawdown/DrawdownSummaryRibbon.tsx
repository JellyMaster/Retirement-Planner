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
          <small>Your plan</small>
          <strong>{isSustainable ? "Looks on track" : "Worth reviewing"}</strong>
          <em>{result.depletionAge === null ? `Your pension lasts through age ${inputs.endAge}` : `Your pension may run out around age ${result.depletionAge}`}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><Coins size={18} /></span>
        <span>
          <small>Money left in your pension</small>
          <strong>{formatCurrency(display.finalBalance)}</strong>
          <em>At age {inputs.endAge}</em>
        </span>
      </article>

      <article className="drawdown-summary-item">
        <span className="drawdown-summary-icon" aria-hidden="true"><ReceiptText size={18} /></span>
        <span>
          <small>Average money available to spend</small>
          <strong>{formatCurrency(averageAnnualNetIncome)}/year</strong>
          <em>{displayMode === "today" ? "In today’s money" : "In future money"}</em>
        </span>
      </article>

      <article className={shortfall > 0 ? "drawdown-summary-item status-danger" : "drawdown-summary-item status-good"}>
        <span className="drawdown-summary-icon" aria-hidden="true"><Landmark size={18} /></span>
        <span>
          <small>Planned income gap</small>
          <strong>{formatCurrency(shortfall)}</strong>
          <em>{shortfall > 0 ? "Across your retirement illustration" : "Your planned income is fully supported"}</em>
        </span>
      </article>
    </section>
  );
}
