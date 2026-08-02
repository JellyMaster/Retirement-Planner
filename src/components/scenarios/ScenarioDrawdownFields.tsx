import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import {
  CurrencyInput,
  FormField,
  NumberInput,
  PercentageInput,
} from "../forms";

interface ScenarioDrawdownFieldsProps {
  idPrefix: string;
  retirementAge: number;
  value: ScenarioDrawdownPreferences;
  onChange: (value: ScenarioDrawdownPreferences) => void;
}

export function ScenarioDrawdownFields({
  idPrefix,
  retirementAge,
  value,
  onChange,
}: ScenarioDrawdownFieldsProps) {
  function update<K extends keyof ScenarioDrawdownPreferences>(
    field: K,
    nextValue: ScenarioDrawdownPreferences[K],
  ) {
    onChange({ ...value, [field]: nextValue });
  }

  const planningAgeError =
    value.planningAge <= retirementAge
      ? "Planning age must be later than retirement age."
      : value.planningAge > 120
        ? "Planning age must be 120 or below."
        : undefined;

  return (
    <fieldset className="scenario-edit-section">
      <legend>Retirement income</legend>
      <p className="scenario-edit-section-copy">
        Choose how this plan will be used in Drawdown. These settings travel with
        the scenario and can be changed later.
      </p>

      <div
        className="scenario-drawdown-strategy"
        role="radiogroup"
        aria-label="Retirement income approach"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value.withdrawalStrategy === "target-income"}
          className={
            value.withdrawalStrategy === "target-income"
              ? "scenario-drawdown-option is-selected"
              : "scenario-drawdown-option"
          }
          onClick={() => update("withdrawalStrategy", "target-income")}
        >
          <strong>Target annual income</strong>
          <span>Calculate the pension withdrawal needed for a chosen income.</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value.withdrawalStrategy === "percentage"}
          className={
            value.withdrawalStrategy === "percentage"
              ? "scenario-drawdown-option is-selected"
              : "scenario-drawdown-option"
          }
          onClick={() => update("withdrawalStrategy", "percentage")}
        >
          <strong>Percentage withdrawal</strong>
          <span>Take a percentage of the remaining pension each year.</span>
        </button>
      </div>

      <div className="scenario-edit-grid">
        <FormField
          id={`${idPrefix}-planningAge`}
          label="Plan retirement income to age"
          hint="The final age included in the drawdown projection."
          error={planningAgeError}
        >
          {(id, describedBy) => (
            <NumberInput
              id={id}
              aria-describedby={describedBy}
              value={value.planningAge}
              min={Math.min(120, retirementAge + 1)}
              max={120}
              suffix="years"
              error={Boolean(planningAgeError)}
              onValueChange={(nextValue) =>
                update("planningAge", nextValue ?? 95)
              }
            />
          )}
        </FormField>

        {value.withdrawalStrategy === "target-income" ? (
          <>
            <div className="form-field scenario-edit-field-wide">
              <span className="form-field-label">Income target basis</span>
              <div
                className="income-target-toggle"
                role="group"
                aria-label="Income target basis"
              >
                <button
                  type="button"
                  className={
                    value.incomeTargetMode === "net"
                      ? "income-target-option income-target-option-active"
                      : "income-target-option"
                  }
                  aria-pressed={value.incomeTargetMode === "net"}
                  onClick={() => update("incomeTargetMode", "net")}
                >
                  Net spendable income
                </button>
                <button
                  type="button"
                  className={
                    value.incomeTargetMode === "gross"
                      ? "income-target-option income-target-option-active"
                      : "income-target-option"
                  }
                  aria-pressed={value.incomeTargetMode === "gross"}
                  onClick={() => update("incomeTargetMode", "gross")}
                >
                  Gross income
                </button>
              </div>
            </div>

            <FormField
              id={`${idPrefix}-desiredAnnualIncome`}
              label={
                value.incomeTargetMode === "net"
                  ? "Desired net annual income"
                  : "Desired gross annual income"
              }
            >
              {(id, describedBy) => (
                <CurrencyInput
                  id={id}
                  aria-describedby={describedBy}
                  value={value.desiredAnnualIncome}
                  min={0}
                  step={500}
                  onValueChange={(nextValue) =>
                    update("desiredAnnualIncome", nextValue ?? 0)
                  }
                />
              )}
            </FormField>
          </>
        ) : (
          <FormField
            id={`${idPrefix}-withdrawalRate`}
            label="Annual withdrawal rate"
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={value.withdrawalRate}
                min={0}
                max={100}
                step={0.1}
                onValueChange={(nextValue) =>
                  update("withdrawalRate", nextValue ?? 0)
                }
              />
            )}
          </FormField>
        )}

        <FormField
          id={`${idPrefix}-taxFreeCash`}
          label="Tax-free cash at retirement"
          optional
        >
          {(id, describedBy) => (
            <CurrencyInput
              id={id}
              aria-describedby={describedBy}
              value={value.taxFreeCash}
              min={0}
              step={1_000}
              onValueChange={(nextValue) =>
                update("taxFreeCash", nextValue ?? 0)
              }
            />
          )}
        </FormField>
      </div>
    </fieldset>
  );
}
