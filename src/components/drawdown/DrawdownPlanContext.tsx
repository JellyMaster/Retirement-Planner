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
          <p className="panel-eyebrow">From your active plan</p>
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
            These values come from the active plan and are used as the starting
            point for this income projection.
          </p>
        </div>
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
