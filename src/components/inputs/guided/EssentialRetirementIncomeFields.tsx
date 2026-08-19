import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
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
  const usesMaximumTaxFreeCash = value.taxFreeCashMode === "maximum";
  const usesAdvancedSpendingPlan =
    value.withdrawalStrategy === "percentage" || Boolean(value.spendingPhases?.length);
  const advancedSpendingSummary = createAdvancedSpendingSummary(value);

  function updateDesiredIncome(nextValue: number | undefined) {
    const desiredAnnualIncome = Math.max(0, nextValue ?? 0);
    const next: ScenarioDrawdownPreferences = {
      ...value,
      withdrawalStrategy: "target-income",
      incomeTargetMode: "net",
      desiredAnnualIncome,
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

      {usesAdvancedSpendingPlan && (
        <div className="essential-retirement-income-note" role="note">
          <strong>Advanced retirement spending is controlling this plan.</strong>
          <span>{advancedSpendingSummary}</span>
          <span>
            Change this under <strong>Advanced → Retirement strategy</strong>. The
            simple annual spending field is disabled while the advanced plan is active.
          </span>
        </div>
      )}

      <FormField
        id={`${idPrefix}-desiredAnnualIncome`}
        label="Desired annual spending"
        hint={
          usesAdvancedSpendingPlan
            ? "This simple spending target is not used while an advanced spending plan is active."
            : "The amount you want available to spend after tax, in today's money."
        }
      >
        {(id, describedBy) => (
          <CurrencyInput
            id={id}
            aria-describedby={describedBy}
            value={value.desiredAnnualIncome}
            min={0}
            step={500}
            disabled={usesAdvancedSpendingPlan}
            onValueChange={updateDesiredIncome}
          />
        )}
      </FormField>

      <div className="essential-retirement-defaults" id={`${idPrefix}-statePension`}>
        <div className="essential-retirement-default-item">
          <span
            className={`essential-retirement-default-badge ${retirementGoals.includeStatePension ? "is-enabled" : "is-disabled"}`}
          >
            <strong>State Pension</strong>
            <small>{retirementGoals.includeStatePension ? "Included" : "Not included"}</small>
          </span>
          <div className="essential-retirement-default-copy">
            <strong>State Pension assumption</strong>
            <p>
              {retirementGoals.includeStatePension
                ? `The plan currently uses ${formatCurrency(retirementGoals.statePensionAnnualAmount)} a year from age ${retirementGoals.statePensionAge}, based on the State Pension value stored in today’s money. The actual cash amount you receive may be higher by then because State Pension rates can be uprated over time, including under the triple lock while that policy remains in place.`
                : "State Pension is currently switched off for this plan."}
            </p>
          </div>
        </div>

        <div className="essential-retirement-default-item">
          <span
            className={`essential-retirement-default-badge ${usesMaximumTaxFreeCash ? "is-enabled" : "is-disabled"}`}
          >
            <strong>25% tax-free cash</strong>
            <small>{usesMaximumTaxFreeCash ? "Maximum included" : "Default changed"}</small>
          </span>
          <div className="essential-retirement-default-copy">
            <strong>Tax-free cash assumption</strong>
            <p>
              {usesMaximumTaxFreeCash
                ? "The plan assumes you take the maximum illustrated tax-free cash available from your pension when you retire. This is normally up to 25% of the pension being accessed, subject to the tax-free lump-sum allowance and your individual circumstances."
                : "The default maximum tax-free cash assumption has been changed for this plan."}
            </p>
          </div>
        </div>

        <p className="essential-retirement-defaults-help">
          You can change the State Pension amount, age and inclusion, or change or switch off the tax-free cash assumption, under <strong>Advanced → Retirement strategy</strong>.
        </p>
      </div>
    </div>
  );
}

function createAdvancedSpendingSummary(value: ScenarioDrawdownPreferences): string {
  const phases = value.spendingPhases ?? [];

  if (value.withdrawalStrategy === "percentage") {
    if (phases.length === 0) {
      return `The plan withdraws ${formatPercentage(value.withdrawalRate)} of the remaining pension each year.`;
    }

    const phaseSummary = phases
      .map(
        (phase) =>
          `${formatPercentage(phase.withdrawalRate ?? value.withdrawalRate)} from age ${phase.startAge}`,
      )
      .join(" · ");

    return `Custom percentage spending plan: ${phaseSummary}.`;
  }

  if (phases.length > 0) {
    const phaseSummary = phases
      .map((phase) => `${formatCurrency(phase.annualIncome)} from age ${phase.startAge}`)
      .join(" · ");

    return `Custom spending plan: ${phaseSummary}.`;
  }

  return "The advanced retirement strategy is controlling the spending plan.";
}
