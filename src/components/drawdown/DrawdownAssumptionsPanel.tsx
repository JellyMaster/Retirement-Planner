import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownAssumptionsPanelProps {
  inputs: DrawdownInputs;
  displayMode: MoneyDisplayMode;
}

function formatPercentage(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function DrawdownAssumptionsPanel({
  inputs,
  displayMode,
}: DrawdownAssumptionsPanelProps) {
  const projectionYears = Math.max(0, inputs.endAge - inputs.retirementAge);

  const assumptions = [
    {
      label: "Starting pension",
      value: formatCurrency(inputs.startingBalance),
    },
    {
      label: "Retirement period",
      value: `${inputs.retirementAge} to ${inputs.endAge} (${projectionYears} years)`,
    },
    {
      label: "Withdrawal strategy",
      value: inputs.withdrawalStrategy === "percentage" ? "Percentage of pension" : "Target annual income",
    },
    {
      label: inputs.withdrawalStrategy === "percentage"
        ? "Annual withdrawal rate"
        : inputs.incomeTargetMode === "net" ? "Net income target" : "Gross income target",
      value: inputs.withdrawalStrategy === "percentage"
        ? formatPercentage(inputs.withdrawalRate)
        : formatCurrency(inputs.desiredAnnualIncome),
    },
    {
      label: "State Pension",
      value: `${formatCurrency(inputs.annualStatePension)} from age ${inputs.statePensionAge}`,
    },
    {
      label: "Investment return",
      value: formatPercentage(inputs.annualReturn),
    },
    {
      label: "State Pension increase",
      value: formatPercentage(inputs.inflationRate),
    },
    {
      label: "Annual pension fee",
      value: formatPercentage(inputs.annualFee),
    },
    {
      label: "Tax-free cash",
      value: formatCurrency(inputs.taxFreeCash),
    },
  ];

  return (
    <section className="panel drawdown-assumptions-panel">
      <div className="panel-heading">
        <p className="panel-eyebrow">Calculation basis</p>
        <h2>How this projection is calculated</h2>
        <p>
          A transparent summary of the assumptions and yearly calculation order
          currently used by the drawdown engine.
        </p>
      </div>

      <div className="drawdown-assumptions-layout">
        <dl className="drawdown-assumptions-list">
          {assumptions.map((assumption) => (
            <div className="drawdown-assumption-row" key={assumption.label}>
              <dt>{assumption.label}</dt>
              <dd>{assumption.value}</dd>
            </div>
          ))}
        </dl>

        <div className="drawdown-method-card">
          <h3>Yearly calculation order</h3>
          <ol className="drawdown-method-list">
            <li>Apply any tax-free cash before the first projection year.</li>
            <li>Calculate the State Pension available at that age.</li>
            <li>
              {inputs.withdrawalStrategy === "percentage"
                ? `Withdraw ${formatPercentage(inputs.withdrawalRate)} of that year's opening pension balance.`
                : inputs.incomeTargetMode === "net"
                  ? "Solve for the gross pension withdrawal needed to reach the net spendable-income target after tax."
                  : "Withdraw only the amount needed to reach the gross annual income target."}
            </li>
            <li>
              Calculate income tax using the 2026/27 England, Wales and Northern Ireland rules.
            </li>
            <li>Apply investment growth to the remaining pension balance.</li>
            <li>Deduct the annual pension fee after growth.</li>
          </ol>
        </div>
      </div>

      <div className="drawdown-basis-note" role="note">
        <strong>Money basis:</strong> calculations remain in nominal pounds. Results are currently displayed in {displayMode === "today" ? "today&apos;s money using the first modelled drawdown year as the base and the inflation assumption" : "projected future pounds"}.
        {inputs.withdrawalStrategy === "percentage"
          ? `The pension withdrawal is recalculated each year as ${formatPercentage(inputs.withdrawalRate)} of the opening pension balance, so private-pension income can rise or fall. State Pension is added separately.`
          : `The desired-income target is treated as ${inputs.incomeTargetMode === "net" ? "net spendable income" : "gross income"}. State Pension increases using the inflation assumption and therefore reduces the private-pension withdrawal required over time.`} State Pension and private-pension withdrawals
        are treated as taxable income; the initial tax-free cash amount is excluded
        from annual income.
      </div>
    </section>
  );
}
