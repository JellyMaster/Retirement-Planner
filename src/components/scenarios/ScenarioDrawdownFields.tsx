import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import { useStoredRetirementGoals } from "../../hooks/useStoredRetirementGoals";
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
  const [retirementGoals, setRetirementGoals] = useStoredRetirementGoals();

  function update<K extends keyof ScenarioDrawdownPreferences>(
    field: K,
    nextValue: ScenarioDrawdownPreferences[K],
  ) {
    const next = { ...value, [field]: nextValue };
    onChange(next);

    if (field === "desiredAnnualIncome") {
      setRetirementGoals({
        ...retirementGoals,
        desiredAnnualIncome: nextValue as number,
      });
    }
  }

  function updateRetirementGoal<K extends keyof typeof retirementGoals>(
    field: K,
    nextValue: (typeof retirementGoals)[K],
  ) {
    setRetirementGoals({ ...retirementGoals, [field]: nextValue });
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
        Choose how this plan will provide retirement income, including whether
        State Pension should contribute to the plan.
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
              hint="This target is also used by the preparedness and confidence calculations."
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

      <section
        className="scenario-edit-subsection scenario-state-pension-section"
        aria-labelledby={`${idPrefix}-state-pension-heading`}
      >
        <div>
          <h3 id={`${idPrefix}-state-pension-heading`}>State Pension</h3>
          <p>
            Include an expected State Pension so the income model can reduce the
            amount needed from the private pension once it starts.
          </p>
        </div>

        <label className="retirement-goals-checkbox">
          <input
            type="checkbox"
            checked={retirementGoals.includeStatePension}
            onChange={(event) =>
              updateRetirementGoal("includeStatePension", event.target.checked)
            }
          />
          <span>Include State Pension in this retirement plan</span>
        </label>

        {retirementGoals.includeStatePension && (
          <div className="scenario-edit-grid">
            <FormField
              id={`${idPrefix}-statePensionAnnualAmount`}
              label="Expected annual State Pension"
              hint="Enter the annual amount in today's money."
            >
              {(id, describedBy) => (
                <CurrencyInput
                  id={id}
                  aria-describedby={describedBy}
                  value={retirementGoals.statePensionAnnualAmount}
                  min={0}
                  step={100}
                  onValueChange={(nextValue) =>
                    updateRetirementGoal(
                      "statePensionAnnualAmount",
                      nextValue ?? 0,
                    )
                  }
                />
              )}
            </FormField>

            <FormField
              id={`${idPrefix}-statePensionAge`}
              label="State Pension starts at age"
              hint="The age when the State Pension begins in the projection."
            >
              {(id, describedBy) => (
                <NumberInput
                  id={id}
                  aria-describedby={describedBy}
                  value={retirementGoals.statePensionAge}
                  min={55}
                  max={80}
                  suffix="years"
                  onValueChange={(nextValue) =>
                    updateRetirementGoal("statePensionAge", nextValue ?? 67)
                  }
                />
              )}
            </FormField>
          </div>
        )}
      </section>
    </fieldset>
  );
}
