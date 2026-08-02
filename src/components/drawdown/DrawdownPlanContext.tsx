import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { AppIcons } from "../../icons";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownPlanContextProps {
  activePlanName: string;
  value: DrawdownInputs;
  onEdit: () => void;
}

export function DrawdownPlanContext({
  activePlanName,
  value,
  onEdit,
}: DrawdownPlanContextProps) {
  return (
    <section
      className="drawdown-plan-context"
      aria-labelledby="drawdown-plan-context-title"
    >
      <div className="drawdown-plan-context-heading">
        <div>
          <p className="panel-eyebrow">Active retirement income plan</p>
          <div className="drawdown-plan-context-title-row">
            <h2 id="drawdown-plan-context-title">{activePlanName}</h2>
            <button
              type="button"
              className="drawdown-plan-context-edit"
              aria-label={`Edit ${activePlanName}`}
              title="Edit active plan"
              onClick={onEdit}
            >
              <FontAwesomeIcon icon={AppIcons.edit} aria-hidden="true" />
            </button>
          </div>
          <p>
            These saved plan values and income choices are used for the drawdown
            projection below.
          </p>
        </div>
      </div>

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
                  ? "Target annual income"
                  : "Percentage of pension pot"}
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
    </section>
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
