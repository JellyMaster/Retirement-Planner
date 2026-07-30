import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownSummaryProps {
  result: DrawdownResult;
}

export function DrawdownSummary({ result }: DrawdownSummaryProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Drawdown outcome</h2>
        <p>Estimated retirement income and pension sustainability.</p>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Balance at planning age" value={formatCurrency(result.finalBalance)} />
        <SummaryCard label="Pension withdrawals" value={formatCurrency(result.totalPensionWithdrawals)} />
        <SummaryCard label="State Pension income" value={formatCurrency(result.totalStatePensionIncome)} />
        <SummaryCard label="Investment growth" value={formatCurrency(result.totalInvestmentGrowth)} />
        <SummaryCard label="Total fees" value={formatCurrency(result.totalFees)} />
        <SummaryCard
          label="Pension depletion"
          value={result.depletionAge === null ? "Not depleted" : `Age ${result.depletionAge}`}
          detail={result.depletionAge === null ? "The pension lasts through the modelled period." : "The pension reaches zero during the modelled period."}
        />
        <SummaryCard
          label="First income shortfall"
          value={result.firstShortfallAge === null ? "No shortfall" : `Age ${result.firstShortfallAge}`}
          detail={result.totalIncomeShortfall > 0 ? `${formatCurrency(result.totalIncomeShortfall)} total shortfall` : "The desired income is fully funded."}
        />
        <SummaryCard label="Tax-free cash taken" value={formatCurrency(result.taxFreeCashTaken)} />
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
