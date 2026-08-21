import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

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
  const targetLabel = inputs.withdrawalStrategy === "percentage"
    ? "Annual pension withdrawal"
    : "Your planned income";
  const targetValue = inputs.withdrawalStrategy === "percentage"
    ? formatPercentage(inputs.withdrawalRate)
    : formatCurrency(inputs.desiredAnnualIncome);

  return (
    <section className="drawdown-assumptions-panel">
      <div className="drawdown-assumptions-groups">
        <AssumptionGroup
          eyebrow="Your retirement plan"
          title="The choices your illustration starts with"
          description="These are the ages, income choices and pension values taken from your active plan."
          items={[
            {
              label: "Pension at retirement",
              value: formatCurrency(inputs.startingBalance),
              explanation: "This is the pension available when the drawdown illustration begins.",
            },
            {
              label: "Retirement period",
              value: `Age ${inputs.retirementAge} to ${inputs.endAge}`,
              explanation: `The illustration follows ${projectionYears} years of retirement after the starting age.`,
            },
            {
              label: targetLabel,
              value: targetValue,
              explanation: inputs.withdrawalStrategy === "percentage"
                ? "This percentage is recalculated from the opening pension balance each year."
                : `This is treated as ${inputs.incomeTargetMode === "net" ? "money available to spend after estimated tax" : "income before estimated tax"}.`,
            },
            {
              label: "State Pension",
              value: inputs.annualStatePension > 0
                ? `${formatCurrency(inputs.annualStatePension)} from age ${inputs.statePensionAge}`
                : "Not included",
              explanation: "When included, State Pension contributes to retirement income and can reduce how much needs to come from your private pension.",
            },
          ]}
        />

        <AssumptionGroup
          eyebrow="Investment assumptions"
          title="How your pension is expected to change"
          description="These assumptions estimate growth, rising prices and the charges taken from your pension."
          items={[
            {
              label: "Expected investment return",
              value: formatPercentage(inputs.annualReturn),
              explanation: "Used to estimate how the invested pension could grow. Actual investment returns will vary from year to year.",
            },
            {
              label: "Inflation",
              value: formatPercentage(inputs.inflationRate),
              explanation: "Used to estimate how buying power changes over time and to increase the State Pension in the illustration.",
            },
            {
              label: "Annual pension charges",
              value: formatPercentage(inputs.annualFee),
              explanation: "Charges are deducted from the pension each year after investment growth is applied.",
            },
          ]}
        />

        <AssumptionGroup
          eyebrow="Tax assumptions"
          title="How tax is estimated"
          description="Tax is illustrated using a consistent set of current rules so different retirement plans can be compared on the same basis."
          items={[
            {
              label: "Income tax rules",
              value: "2026/27 England, Wales and Northern Ireland",
              explanation: "Future tax rates, bands and allowances may change, so actual retirement tax may be different.",
            },
            {
              label: "Tax-free cash",
              value: formatCurrency(inputs.taxFreeCash),
              explanation: "Any initial tax-free cash is taken before annual retirement income is calculated and is not treated as taxable annual income.",
            },
            {
              label: "Taxable retirement income",
              value: "State Pension + private pension income",
              explanation: "The illustration estimates tax on these income sources using the modelled tax rules and allowances.",
            },
          ]}
        />

        <section className="drawdown-assumption-education" aria-labelledby="drawdown-assumption-education-title">
          <div>
            <p className="panel-eyebrow">Understanding the illustration</p>
            <h2 id="drawdown-assumption-education-title">How to read the results</h2>
            <p>These concepts help explain why the figures can look different depending on the view you choose and why real retirement outcomes will not follow a perfectly smooth path.</p>
          </div>
          <div className="drawdown-assumption-concepts">
            <Concept
              title="Today’s money"
              text="Shows future values using today’s buying power, which makes different retirement years easier to compare."
            />
            <Concept
              title="Future money"
              text="Shows the projected pound amount in each future year, including the effect of inflation."
            />
            <Concept
              title="Illustration, not prediction"
              text="The model applies the same assumptions consistently. Real investment returns, inflation, tax rules and personal circumstances will change over time."
            />
            <Concept
              title="Why pension balances can fall"
              text="A pension is there to fund retirement. A falling balance can be expected when withdrawals and charges are greater than investment growth."
            />
          </div>
        </section>
      </div>

      <aside className="drawdown-assumption-remember" role="note">
        <p className="panel-eyebrow">Key things to remember</p>
        <strong>This is an educational retirement illustration, not a guarantee or personal financial advice.</strong>
        <p>
          Use it to understand and compare retirement choices. Review your plan regularly because investment returns, inflation, tax rules and your circumstances can all change.
        </p>
      </aside>

      <details className="panel ui-disclosure drawdown-assumption-reference">
        <summary className="ui-disclosure-trigger">
          <div>
            <p className="panel-eyebrow">Calculation reference</p>
            <strong>See how each retirement year is calculated</strong>
            <small>Open this section when you want the technical calculation order behind the illustration.</small>
          </div>
          <ExpandCollapseIndicator />
        </summary>
        <div className="drawdown-assumption-reference-content">
          <ol className="drawdown-method-list">
            <li>Apply any tax-free cash before the first retirement year.</li>
            <li>Calculate the State Pension available at that age.</li>
            <li>
              {inputs.withdrawalStrategy === "percentage"
                ? `Take ${formatPercentage(inputs.withdrawalRate)} of that year's opening pension balance.`
                : inputs.incomeTargetMode === "net"
                  ? "Calculate the pension income needed to provide the planned amount after estimated tax."
                  : "Take only the pension income needed to reach the planned income before tax."}
            </li>
            <li>Estimate income tax using the modelled tax rules.</li>
            <li>Apply investment growth to the remaining pension.</li>
            <li>Deduct annual pension charges after growth.</li>
          </ol>
          <p>
            Calculations are performed in future pounds. The current display is {displayMode === "today" ? "then converted to today’s money using the inflation assumption" : "shown in projected future pounds"}.
          </p>
        </div>
      </details>
    </section>
  );
}

interface AssumptionItem {
  label: string;
  value: string;
  explanation: string;
}

function AssumptionGroup({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: AssumptionItem[];
}) {
  return (
    <section className="panel drawdown-assumption-group">
      <header>
        <p className="panel-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <dl>
        {items.map((item) => (
          <div key={item.label} className="drawdown-assumption-card">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            <p>{item.explanation}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Concept({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}
