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

      <div className="essential-state-pension" id={`${idPrefix}-statePension`}>
        <strong>State Pension included</strong>
        <p>
          {retirementGoals.includeStatePension
            ? `The plan includes ${formatCurrency(retirementGoals.statePensionAnnualAmount)}/year from age ${retirementGoals.statePensionAge}. You can change or switch this off under Advanced → Retirement strategy.`
            : "State Pension has been switched off in Advanced retirement settings."}
        </p>
      </div>

      <div className="essential-retirement-income-note" role="note">
        <strong>25% tax-free cash is included by default.</strong>
        <span>
          The model will use the maximum illustrated tax-free amount available from
          the pension at retirement. You can change or switch this off under Advanced
          → Retirement strategy.
        </span>
      </div>
    </div>
  );
}
