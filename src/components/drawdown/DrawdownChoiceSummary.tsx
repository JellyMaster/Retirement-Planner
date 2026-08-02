import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownChoiceSummaryProps {
  value: DrawdownInputs;
  onEdit: () => void;
}

export function DrawdownChoiceSummary({
  value,
  onEdit,
}: DrawdownChoiceSummaryProps) {
  const strategy =
    value.withdrawalStrategy === "target-income"
      ? "Target annual income"
      : "Percentage withdrawal";

  return (
    <section
      className="drawdown-choice-summary"
      aria-labelledby="drawdown-choice-summary-title"
    >
      <div>
        <p className="panel-eyebrow">Retirement income plan</p>
        <h2 id="drawdown-choice-summary-title">{strategy}</h2>
        <p>
          These choices are saved with the active plan. Edit the plan to change
          how retirement income is modelled.
        </p>
      </div>

      <dl>
        {value.withdrawalStrategy === "target-income" ? (
          <div>
            <dt>{value.incomeTargetMode === "net" ? "Net income target" : "Gross income target"}</dt>
            <dd>{formatCurrency(value.desiredAnnualIncome)} a year</dd>
          </div>
        ) : (
          <div>
            <dt>Withdrawal rate</dt>
            <dd>{formatPercentage(value.withdrawalRate)}</dd>
          </div>
        )}
        <div>
          <dt>Tax-free cash</dt>
          <dd>{value.taxFreeCash > 0 ? formatCurrency(value.taxFreeCash) : "None selected"}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="ui-button ui-button-secondary ui-button-small"
        onClick={onEdit}
      >
        Edit income plan
      </button>
    </section>
  );
}
