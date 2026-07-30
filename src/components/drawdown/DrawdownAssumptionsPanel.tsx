import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownAssumptionsPanelProps {
  inputs: DrawdownInputs;
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
      label: "Annual income ceiling",
      value: formatCurrency(inputs.desiredAnnualIncome),
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
              Withdraw only the amount needed to reach the annual income ceiling.
            </li>
            <li>Apply investment growth to the remaining pension balance.</li>
            <li>Deduct the annual pension fee after growth.</li>
          </ol>
        </div>
      </div>

      <div className="drawdown-basis-note" role="note">
        <strong>Money basis:</strong> balances are projected in nominal pounds.
        The desired-income ceiling remains fixed, while State Pension increases
        using the inflation assumption and therefore reduces the private-pension
        withdrawal over time.
      </div>
    </section>
  );
}
