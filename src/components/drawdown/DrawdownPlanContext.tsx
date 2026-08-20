import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

interface DrawdownPlanContextProps {
  activePlanName: string;
  value: DrawdownInputs;
}

export function DrawdownPlanContext({
  activePlanName,
  value,
}: DrawdownPlanContextProps) {
  return (
    <details className="drawdown-plan-context drawdown-plan-context-collapsible ui-disclosure">
      <summary className="drawdown-plan-context-summary ui-disclosure-trigger">
        <div className="drawdown-plan-context-summary-copy">
          <p className="panel-eyebrow">Active retirement plan</p>
          <h2>{activePlanName}</h2>
        </div>

        <div className="drawdown-plan-context-summary-values" aria-label="Active plan summary">
          <SummaryValue label="Retirement" value={`Age ${value.retirementAge}`} />
          <SummaryValue
            label="Income strategy"
            value={
              value.withdrawalStrategy === "target-income"
                ? "Stable income"
                : `${formatPercentage(value.withdrawalRate)} flexible income`
            }
          />
          <SummaryValue
            label="State Pension"
            value={value.annualStatePension > 0 ? "Included" : "Not included"}
          />
          <SummaryValue
            label="Tax-free cash"
            value={value.taxFreeCash > 0 ? formatCurrency(value.taxFreeCash) : "None"}
          />
        </div>

        <span className="drawdown-plan-context-toggle-label" aria-hidden="true">
          <span className="when-closed">Show details</span>
          <span className="when-open">Hide details</span>
          <ExpandCollapseIndicator />
        </span>
      </summary>

      <div className="drawdown-plan-context-expanded">
        <p className="drawdown-plan-context-help">
          These saved plan values and income choices are used for the drawdown projection below.
          Make changes from My Plan so every part of the planner continues to use the same plan.
        </p>

        <div className="drawdown-plan-context-sections">
          <section
            className="drawdown-plan-details-summary"
            aria-labelledby="drawdown-plan-details-title"
          >
            <h3 id="drawdown-plan-details-title">Plan values and assumptions</h3>
            <dl className="drawdown-plan-context-grid">
              <ContextValue
                label="Pension at retirement"
                value={formatCurrency(value.startingBalance)}
              />
              <ContextValue
                label="Retirement age"
                value={`Age ${value.retirementAge}`}
              />
              <ContextValue label="Plan runs to" value={`Age ${value.endAge}`} />
              <ContextValue
                label="Expected return"
                value={formatPercentage(value.annualReturn)}
              />
              <ContextValue
                label="Inflation"
                value={formatPercentage(value.inflationRate)}
              />
              <ContextValue
                label="Annual fee"
                value={formatPercentage(value.annualFee)}
              />
            </dl>
          </section>

          <section
            className="drawdown-income-strategy-summary"
            aria-labelledby="drawdown-income-strategy-title"
          >
            <div className="drawdown-income-strategy-heading">
              <div>
                <p className="panel-eyebrow">Retirement income</p>
                <h3 id="drawdown-income-strategy-title">
                  {value.withdrawalStrategy === "target-income"
                    ? "Stable retirement income"
                    : "Flexible percentage withdrawals"}
                </h3>
              </div>
              <span className="drawdown-plan-context-strategy">
                {value.withdrawalStrategy === "target-income"
                  ? value.incomeTargetMode === "net"
                    ? "Net income target"
                    : "Gross income target"
                  : `${formatPercentage(value.withdrawalRate)} each year`}
              </span>
            </div>

            {value.withdrawalStrategy === "target-income" ? (
              <dl className="drawdown-income-breakdown">
                <ContextValue
                  label="Annual income target"
                  value={`${formatCurrency(value.desiredAnnualIncome)} a year`}
                  emphasis
                />
                <ContextValue
                  label="Target basis"
                  value={
                    value.incomeTargetMode === "net"
                      ? "Spendable income after tax"
                      : "Income before tax"
                  }
                />
                <ContextValue
                  label="State Pension contribution"
                  value={
                    value.annualStatePension > 0
                      ? `${formatCurrency(value.annualStatePension)} a year from age ${value.statePensionAge}`
                      : "Not included"
                  }
                />
                <ContextValue
                  label="Private pension role"
                  value={
                    value.annualStatePension > 0
                      ? "Provides the remaining income needed to reach the target"
                      : "Provides the full modelled income target"
                  }
                />
              </dl>
            ) : (
              <dl className="drawdown-income-breakdown">
                <ContextValue
                  label="Annual withdrawal"
                  value={`${formatPercentage(value.withdrawalRate)} of the remaining pension pot`}
                  emphasis
                />
                <ContextValue
                  label="Income basis"
                  value="Varies with the pension balance each year"
                />
                <ContextValue
                  label="State Pension"
                  value={
                    value.annualStatePension > 0
                      ? `${formatCurrency(value.annualStatePension)} a year from age ${value.statePensionAge}, paid in addition`
                      : "Not included"
                  }
                />
                <ContextValue
                  label="Tax-free cash"
                  value={
                    value.taxFreeCash > 0
                      ? `${formatCurrency(value.taxFreeCash)} taken at retirement`
                      : "None selected"
                  }
                />
              </dl>
            )}

            {value.withdrawalStrategy === "target-income" && (
              <div className="drawdown-income-tax-free-cash">
                <span>Tax-free cash at retirement</span>
                <strong>
                  {value.taxFreeCash > 0
                    ? formatCurrency(value.taxFreeCash)
                    : "None selected"}
                </strong>
              </div>
            )}
          </section>
        </div>
      </div>
    </details>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <span className="drawdown-plan-context-summary-value">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function ContextValue({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "is-emphasised" : undefined}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
