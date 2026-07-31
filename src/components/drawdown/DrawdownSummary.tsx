import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { getDisplaySummary, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownSummaryProps {
  result: DrawdownResult;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

export function DrawdownSummary({ result, inflationRate, displayMode }: DrawdownSummaryProps) {
  const display = getDisplaySummary(result, inflationRate, displayMode);
  const basisDetail = displayMode === "today" ? "Shown in today's money." : "Shown in projected future pounds.";
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Drawdown outcome</h2>
        <p>Estimated retirement income, tax and pension sustainability. {basisDetail}</p>
      </div>

      <div className="summary-grid">
        <SummaryCard
          label="Withdrawal strategy"
          value={result.withdrawalStrategy === "percentage" ? `${formatPercentage(result.withdrawalRate)} of pension` : "Target annual income"}
          detail={result.withdrawalStrategy === "percentage" ? "Recalculated from each year's opening balance." : "A fixed annual income amount is requested."}
        />
        <SummaryCard label="Balance at planning age" value={formatCurrency(display.finalBalance)} />
        <SummaryCard label="Gross retirement income" value={formatCurrency(display.totalGrossIncome)} />
        <SummaryCard label="Income tax" value={formatCurrency(display.totalIncomeTax)} />
        <SummaryCard label="Net retirement income" value={formatCurrency(display.totalNetIncome)} />
        <SummaryCard label="Average effective tax rate" value={formatPercentage(result.averageEffectiveTaxRate)} />
        <SummaryCard label="Pension withdrawals" value={formatCurrency(display.totalPensionWithdrawals)} />
        <SummaryCard label="State Pension received" value={formatCurrency(display.totalStatePensionIncome)} />
        <SummaryCard label="Investment growth" value={formatCurrency(display.totalInvestmentGrowth)} />
        <SummaryCard label="Total fees" value={formatCurrency(display.totalFees)} />
        <SummaryCard
          label="Pension depletion"
          value={result.depletionAge === null ? "Not depleted" : `Age ${result.depletionAge}`}
          detail={result.depletionAge === null ? "The pension lasts through the modelled period." : "The pension reaches zero during the modelled period."}
        />
        {result.withdrawalStrategy === "target-income" && (result.incomeTargetMode === "gross" ? (
          <SummaryCard
            label="First gross-income shortfall"
            value={result.firstShortfallAge === null ? "No shortfall" : `Age ${result.firstShortfallAge}`}
            detail={display.totalIncomeShortfall > 0 ? `${formatCurrency(display.totalIncomeShortfall)} total shortfall` : "The gross income target is fully funded."}
          />
        ) : (
          <SummaryCard
            label="First net-income shortfall"
            value={result.firstNetIncomeShortfallAge === null ? "No shortfall" : `Age ${result.firstNetIncomeShortfallAge}`}
            detail={display.totalNetIncomeShortfall > 0 ? `${formatCurrency(display.totalNetIncomeShortfall)} total shortfall` : "The net spendable-income target is fully funded."}
          />
        ))}
        <SummaryCard label="Tax-free cash taken" value={formatCurrency(display.taxFreeCashTaken)} />
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article className="summary-card">
      <p className="summary-label">{label}</p>
      <strong className="summary-value">{value}</strong>
      {detail && <p className="summary-real-value">{detail}</p>}
    </article>
  );
}
