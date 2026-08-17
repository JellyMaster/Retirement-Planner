import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { formatCurrency } from "../../../utils/formatters";
import { CurrencyInput, FormField } from "../../forms";

interface EssentialRetirementIncomeFieldsProps {
  idPrefix: string;
  value: ScenarioDrawdownPreferences;
  onChange: (value: ScenarioDrawdownPreferences) => void;
}

export function EssentialRetirementIncomeFields({
  idPrefix,
  value,
  onChange,
}: EssentialRetirementIncomeFieldsProps) {
  const [retirementGoals, setRetirementGoals] = useStoredRetirementGoals();
  const usesAdvancedPercentageStrategy = value.withdrawalStrategy === "percentage";
  const usesMaximumTaxFreeCash = value.taxFreeCashMode === "maximum";

  function updateDesiredIncome(nextValue: number | undefined) {
    const desiredAnnualIncome = Math.max(0, nextValue ?? 0);
    const next: ScenarioDrawdownPreferences = {
      ...value,
      withdrawalStrategy: "target-income",
      incomeTargetMode: "net",
      desiredAnnualIncome,
      spendingPhases: value.spendingPhases?.length
        ? value.spendingPhases.map((phase, index) =>
            index === 0 ? { ...phase, annualIncome: desiredAnnualIncome } : phase,
          )
        : value.spendingPhases,
    };

    onChange(next);
    setRetirementGoals({
      ...retirementGoals,
      desiredAnnualIncome,
    });
  }

  return (
    <div className="essential-retirement-income-fields">
      <div className="essential-retirement-income-intro">
        <strong>What would you like to spend each year in retirement?</strong>
        <p>
          Enter the amount you would like available to spend, in today&apos;s money.
          The planner will work out how much needs to come from your pension.
        </p>
      </div>

      {usesAdvancedPercentageStrategy && (
        <div className="essential-retirement-income-note" role="note">
          <strong>Advanced percentage withdrawal is currently active.</strong>
          <span>
            Changing the spending target below will switch this plan back to the
            simpler net annual income approach.
          </span>
        </div>
      )}

      <FormField
        id={`${idPrefix}-desiredAnnualIncome`}
        label="Desired annual spending"
        hint="The amount you want available to spend after tax, in today's money."
      >
        {(id, describedBy) => (
          <CurrencyInput
            id={id}
            aria-describedby={describedBy}
            value={value.desiredAnnualIncome}
            min={0}
            step={500}
            onValueChange={updateDesiredIncome}
          />
        )}
      </FormField>

      <div className="essential-retirement-defaults" id={`${idPrefix}-statePension`}>
        <div className="essential-retirement-default-badges" aria-label="Retirement income defaults">
          <span
            className={`essential-retirement-default-badge ${retirementGoals.includeStatePension ? "is-enabled" : "is-disabled"}`}
          >
            <strong>State Pension</strong>
            <small>{retirementGoals.includeStatePension ? "Included" : "Not included"}</small>
          </span>
          <span
            className={`essential-retirement-default-badge ${usesMaximumTaxFreeCash ? "is-enabled" : "is-disabled"}`}
          >
            <strong>25% tax-free cash</strong>
            <small>{usesMaximumTaxFreeCash ? "Maximum included" : "Default changed"}</small>
          </span>
        </div>

        <p className="essential-retirement-defaults-copy">
          {retirementGoals.includeStatePension
            ? `The plan currently uses ${formatCurrency(retirementGoals.statePensionAnnualAmount)} a year from age ${retirementGoals.statePensionAge}, based on the State Pension value stored in today’s money. The actual cash amount you receive may be higher by then because State Pension rates can be uprated over time, including under the triple lock while that policy remains in place. You can change the State Pension amount, age, inclusion and tax-free cash choices under Advanced → Retirement strategy.`
            : "State Pension is currently switched off. You can change the State Pension amount, age, inclusion and tax-free cash choices under Advanced → Retirement strategy."}
        </p>
      </div>
    </div>
  );
}
