import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { Button, Card, CardHeader, StatusBadge } from "../ui";

interface RetirementGoalsFormProps {
  value: RetirementGoals;
  onChange: (value: RetirementGoals) => void;
  compact?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function RetirementGoalsForm({
  value,
  onChange,
  compact = false,
  collapsible = false,
  defaultExpanded = false,
}: RetirementGoalsFormProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !collapsible);

  function update<K extends keyof RetirementGoals>(key: K, nextValue: RetirementGoals[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  const className = [
    "retirement-goals-form",
    compact && "retirement-goals-form-compact",
    collapsible && "retirement-goals-form-collapsible",
    isExpanded && "retirement-goals-form-expanded",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={className} padding="none" aria-labelledby="retirement-goals-heading">
      {collapsible && !isExpanded ? (
        <button
          type="button"
          className="retirement-goals-summary-button"
          aria-expanded="false"
          aria-controls="retirement-goals-editor"
          onClick={() => setIsExpanded(true)}
        >
          <span className="retirement-goals-summary-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.goals} />
          </span>

          <span className="retirement-goals-summary-copy">
            <span className="retirement-goals-summary-heading">
              <small>Retirement goals</small>
              <strong id="retirement-goals-heading">Your target</strong>
            </span>

            <span className="retirement-goals-summary-metrics">
              <span>
                <small>Annual income</small>
                <strong>{formatCurrency(value.desiredAnnualIncome)}</strong>
              </span>
              <span>
                <small>Reserve</small>
                <strong>{formatCurrency(value.emergencyReserve)}</strong>
              </span>
              <span>
                <small>State Pension</small>
                <strong>
                  {value.includeStatePension
                    ? `${formatCurrency(value.statePensionAnnualAmount)} from ${value.statePensionAge}`
                    : "Not included"}
                </strong>
              </span>
            </span>
          </span>

          <span className="retirement-goals-summary-action">
            Edit goals
            <FontAwesomeIcon icon={AppIcons.chevronDown} aria-hidden="true" />
          </span>
        </button>
      ) : (
        <div id="retirement-goals-editor">
          <CardHeader
            eyebrow="Retirement goals"
            title="Your target"
            titleId="retirement-goals-heading"
            icon={AppIcons.goals}
            description="Set the income and reserve used to assess your retirement outlook."
            badge={<StatusBadge tone="info">Planning assumptions</StatusBadge>}
          />

          <div className="retirement-goals-fields">
            <div className="retirement-goals-field">
              <label htmlFor="retirement-goals-income">Desired annual income</label>
              <div className="retirement-goals-money-input">
                <span aria-hidden="true">£</span>
                <input
                  id="retirement-goals-income"
                  type="number"
                  min="0"
                  step="500"
                  value={value.desiredAnnualIncome}
                  onChange={(event) => update("desiredAnnualIncome", Number(event.target.value))}
                />
              </div>
            </div>

            <div className="retirement-goals-field">
              <label htmlFor="retirement-goals-reserve">Emergency reserve</label>
              <div className="retirement-goals-money-input">
                <span aria-hidden="true">£</span>
                <input
                  id="retirement-goals-reserve"
                  type="number"
                  min="0"
                  step="1000"
                  value={value.emergencyReserve}
                  onChange={(event) => update("emergencyReserve", Number(event.target.value))}
                />
              </div>
            </div>

            <label className="retirement-goals-checkbox">
              <input
                type="checkbox"
                checked={value.includeStatePension}
                onChange={(event) => update("includeStatePension", event.target.checked)}
              />
              <span>Include State Pension</span>
            </label>

            {value.includeStatePension && (
              <div className="retirement-goals-state-grid">
                <div className="retirement-goals-field">
                  <label htmlFor="retirement-goals-state-pension">Annual amount</label>
                  <div className="retirement-goals-money-input">
                    <span aria-hidden="true">£</span>
                    <input
                      id="retirement-goals-state-pension"
                      type="number"
                      min="0"
                      step="100"
                      value={value.statePensionAnnualAmount}
                      onChange={(event) =>
                        update("statePensionAnnualAmount", Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="retirement-goals-field">
                  <label htmlFor="retirement-goals-state-pension-age">Starts at age</label>
                  <input
                    id="retirement-goals-state-pension-age"
                    type="number"
                    min="55"
                    max="80"
                    value={value.statePensionAge}
                    onChange={(event) => update("statePensionAge", Number(event.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="retirement-goals-footer">
            <p className="retirement-goals-help">
              Targets are shown in today&apos;s money. The health score is a planning indicator,
              not a probability or guarantee.
            </p>

            {collapsible && (
              <Button
                variant="secondary"
                size="small"
                className="retirement-goals-done-button"
                onClick={() => setIsExpanded(false)}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
