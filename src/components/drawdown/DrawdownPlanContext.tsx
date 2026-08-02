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
  const strategy =
    value.withdrawalStrategy === "target-income"
      ? "Target annual income"
      : "Percentage withdrawal";

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
        <span className="drawdown-plan-context-strategy">{strategy}</span>
      </div>

      <dl className="drawdown-plan-context-grid">
        <ContextValue
          label="Pension at retirement"
          value={formatCurrency(value.startingBalance)}
        />
        <ContextValue label="Retirement age" value={`Age ${value.retirementAge}`} />
        <ContextValue label="Plan runs to" value={`Age ${value.endAge}`} />
        <ContextValue
          label="State Pension"
          value={
            value.annualStatePension > 0
              ? `${formatCurrency(value.annualStatePension)} from age ${value.statePensionAge}`
              : "Not included"
          }
        />
        {value.withdrawalStrategy === "target-income" ? (
          <ContextValue
            label={
              value.incomeTargetMode === "net"
                ? "Net income target"
                : "Gross income target"
            }
            value={`${formatCurrency(value.desiredAnnualIncome)} a year`}
          />
        ) : (
          <ContextValue
            label="Withdrawal rate"
            value={formatPercentage(value.withdrawalRate)}
          />
        )}
        <ContextValue
          label="Tax-free cash"
          value={
            value.taxFreeCash > 0
              ? formatCurrency(value.taxFreeCash)
              : "None selected"
          }
        />
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
  );
}

function ContextValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
