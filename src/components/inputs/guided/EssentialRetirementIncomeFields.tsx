import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import {
  getRetirementLivingStandards,
  type RetirementLivingStandardLevel,
} from "../../../engine/drawdown/retirementLivingStandards";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
import { CurrencyInput, FormField } from "../../forms";

interface EssentialRetirementIncomeFieldsProps {
  idPrefix: string;
  value: ScenarioDrawdownPreferences;
  onChange: (value: ScenarioDrawdownPreferences) => void;
}

const LIFESTYLE_COPY: Record<
  RetirementLivingStandardLevel,
  { title: string; description: string }
> = {
  minimum: {
    title: "Minimum",
    description: "Covers essential needs with some room for everyday leisure.",
  },
  moderate: {
    title: "Moderate",
    description: "Provides more financial security and flexibility for leisure and holidays.",
  },
  comfortable: {
    title: "Comfortable",
    description: "Allows greater flexibility for travel, leisure and larger discretionary spending.",
  },
};

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
  const incomeGoalSource = value.retirementIncomeGoalSource ?? "custom";
  const household = value.retirementLivingStandardsHousehold ?? "one-person";
  const region = value.retirementLivingStandardsRegion ?? "uk";
  const livingStandards = getRetirementLivingStandards(household, region);

  function applyDesiredIncome(
    desiredAnnualIncome: number,
    updates: Partial<ScenarioDrawdownPreferences>,
  ) {
    onChange({
      ...value,
      withdrawalStrategy: "target-income",
      incomeTargetMode: "net",
      desiredAnnualIncome,
      ...updates,
    });
    setRetirementGoals({
      ...retirementGoals,
      desiredAnnualIncome,
    });
  }

  function updateDesiredIncome(nextValue: number | undefined) {
    const desiredAnnualIncome = Math.max(0, nextValue ?? 0);
    applyDesiredIncome(desiredAnnualIncome, {
      retirementIncomeGoalSource: "custom",
      customDesiredAnnualIncome: desiredAnnualIncome,
    });
  }

  function selectCustomIncomeGoal() {
    const customDesiredAnnualIncome =
      value.customDesiredAnnualIncome ?? value.desiredAnnualIncome;
    applyDesiredIncome(customDesiredAnnualIncome, {
      retirementIncomeGoalSource: "custom",
      customDesiredAnnualIncome,
    });
  }

  function selectLivingStandardsGoal() {
    onChange({
      ...value,
      retirementIncomeGoalSource: "living-standard",
      customDesiredAnnualIncome:
        value.retirementIncomeGoalSource === "custom"
          ? value.desiredAnnualIncome
          : value.customDesiredAnnualIncome ?? value.desiredAnnualIncome,
    });
  }

  function selectLifestyle(level: RetirementLivingStandardLevel) {
    applyDesiredIncome(livingStandards[level], {
      retirementIncomeGoalSource: "living-standard",
      retirementLivingStandardsLevel: level,
      customDesiredAnnualIncome:
        value.customDesiredAnnualIncome ?? value.desiredAnnualIncome,
    });
  }

  return (
    <div className="essential-retirement-income-fields">
      <div className="essential-retirement-income-intro">
        <strong>How would you like to set your retirement income goal?</strong>
        <p>
          Enter your own annual spending target, or use a Retirement Living Standard
          as a starting point for the lifestyle you would like in retirement.
        </p>
      </div>

      {usesAdvancedSpendingPlan && (
        <div className="essential-retirement-income-note" role="note">
          <strong>Advanced retirement spending is controlling this plan.</strong>
          <span>{advancedSpendingSummary}</span>
          <span>
            Change this under <strong>Advanced → Retirement strategy</strong>. The
            simple retirement income goal is disabled while the advanced plan is active.
          </span>
        </div>
      )}

      <div
        className="essential-retirement-income-source"
        role="radiogroup"
        aria-label="Retirement income goal source"
      >
        <button
          type="button"
          role="radio"
          aria-checked={incomeGoalSource === "custom"}
          className={incomeGoalSource === "custom" ? "is-selected" : undefined}
          disabled={usesAdvancedSpendingPlan}
          onClick={selectCustomIncomeGoal}
        >
          <strong>I know how much I want to spend</strong>
          <span>Enter the annual amount you would like available after tax.</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={incomeGoalSource === "living-standard"}
          className={incomeGoalSource === "living-standard" ? "is-selected" : undefined}
          disabled={usesAdvancedSpendingPlan}
          onClick={selectLivingStandardsGoal}
        >
          <strong>Use Retirement Living Standards</strong>
          <span>Choose a lifestyle benchmark to set the annual income target.</span>
        </button>
      </div>

      {incomeGoalSource === "custom" ? (
        <FormField
          id={`${idPrefix}-desiredAnnualIncome`}
          label="Desired annual retirement income"
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
              value={value.customDesiredAnnualIncome ?? value.desiredAnnualIncome}
              min={0}
              step={500}
              disabled={usesAdvancedSpendingPlan}
              onValueChange={updateDesiredIncome}
            />
          )}
        </FormField>
      ) : (
        <div className="essential-retirement-lifestyle-picker">
          <div>
            <strong>Which retirement lifestyle would you like?</strong>
            <p>
              Choose the benchmark that best matches the retirement you want to plan for.
            </p>
          </div>
          <div
            className="essential-retirement-lifestyle-options"
            role="radiogroup"
            aria-label="Retirement lifestyle standard"
          >
            {(["minimum", "moderate", "comfortable"] as const).map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={value.retirementLivingStandardsLevel === level}
                className={
                  value.retirementLivingStandardsLevel === level ? "is-selected" : undefined
                }
                disabled={usesAdvancedSpendingPlan}
                onClick={() => selectLifestyle(level)}
              >
                <strong>{LIFESTYLE_COPY[level].title}</strong>
                <span>{LIFESTYLE_COPY[level].description}</span>
                <small>{formatCurrency(livingStandards[level])}/year</small>
              </button>
            ))}
          </div>
          {value.retirementLivingStandardsLevel && (
            <div className="essential-retirement-lifestyle-summary" role="note">
              <strong>
                {LIFESTYLE_COPY[value.retirementLivingStandardsLevel].title} lifestyle selected
              </strong>
              <span>
                The plan is using {formatCurrency(value.desiredAnnualIncome)} a year in
                today&apos;s money, based on the current {household === "one-person" ? "one-person" : "two-person"}{" "}
                {region === "london" ? "London" : "UK"} Retirement Living Standard.
              </span>
              <span>You can switch back to your own amount without losing it.</span>
            </div>
          )}
        </div>
      )}

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
