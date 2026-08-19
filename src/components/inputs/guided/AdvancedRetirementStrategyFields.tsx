import { useState, type ReactNode } from "react";

import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import type { WithdrawalStrategy } from "../../../engine/drawdown/models/DrawdownInputs";
import { usePensionProjection } from "../../../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
import { CurrencyInput, FormField, NumberInput, PercentageInput } from "../../forms";
import { useScenarios } from "../../scenarios/ScenarioContext";
import { ScenarioSpendingPhaseFields } from "../../scenarios/ScenarioSpendingPhaseFields";

const STANDARD_LUMP_SUM_ALLOWANCE = 268_275;
const TAX_FREE_CASH_RATE = 0.25;

type StrategySection =
  | "income"
  | "state-pension"
  | "tax-free-cash"
  | "ending-pot"
  | "spending";

type EndingPotChoice = "zero" | "ten-percent" | "custom" | "preserve";

interface AdvancedRetirementStrategyFieldsProps {
  idPrefix: string;
  retirementAge: number;
  value: ScenarioDrawdownPreferences;
  onChange: (value: ScenarioDrawdownPreferences) => void;
}

export function AdvancedRetirementStrategyFields({
  idPrefix,
  retirementAge,
  value,
  onChange,
}: AdvancedRetirementStrategyFieldsProps) {
  const { activeScenario } = useScenarios();
  const [retirementGoals, setRetirementGoals] = useStoredRetirementGoals();
  const [openSection, setOpenSection] = useState<StrategySection | null>(null);
  const projection = usePensionProjection(activeScenario.inputs);

  const projectedPension = projection.hasErrors
    ? 0
    : Math.max(0, projection.projection.finalBalance.real);
  const maximumTaxFreeCash = Math.floor(
    Math.min(projectedPension * TAX_FREE_CASH_RATE, STANDARD_LUMP_SUM_ALLOWANCE),
  );
  const usesMaximumTaxFreeCash =
    value.taxFreeCashMode === "maximum" ||
    (value.taxFreeCashMode === undefined && value.taxFreeCash === 0);
  const hasCustomSpending = Boolean(value.spendingPhases?.length);
  const spendingPattern = hasCustomSpending
    ? value.withdrawalStrategy === "percentage"
      ? "Custom withdrawal-rate pattern"
      : "Custom spending plan"
    : value.withdrawalStrategy === "percentage"
      ? "One withdrawal rate throughout"
      : "Level spending";

  const endingBalanceMode = value.endingBalanceMode ?? "preserve";
  const endingBalancePercentage = value.endingBalancePercentage ?? 1;
  const endingPotChoice: EndingPotChoice =
    endingBalanceMode === "spend-to-zero"
      ? "zero"
      : endingBalanceMode === "preserve"
        ? "preserve"
        : Math.abs(endingBalancePercentage - 0.1) < 0.0001
          ? "ten-percent"
          : "custom";
  const endingPotSummary =
    endingPotChoice === "zero"
      ? "Spend the pension to £0"
      : endingPotChoice === "preserve"
        ? "Preserve the retirement pot"
        : endingPotChoice === "ten-percent"
          ? "Keep 10% of the retirement pot"
          : `Keep ${formatPercentage(endingBalancePercentage)} of the retirement pot`;

  function update<K extends keyof ScenarioDrawdownPreferences>(
    field: K,
    nextValue: ScenarioDrawdownPreferences[K],
  ) {
    let next = { ...value, [field]: nextValue };

    if (field === "desiredAnnualIncome" && next.spendingPhases?.length) {
      next = {
        ...next,
        spendingPhases: next.spendingPhases.map((phase, index) =>
          index === 0 ? { ...phase, annualIncome: nextValue as number } : phase,
        ),
      };
    }

    onChange(next);

    if (field === "desiredAnnualIncome") {
      setRetirementGoals({
        ...retirementGoals,
        desiredAnnualIncome: nextValue as number,
      });
    }
  }

  function selectIncomeStrategy(strategy: WithdrawalStrategy) {
    if (strategy === "target-income") {
      onChange({
        ...value,
        withdrawalStrategy: strategy,
        incomeTargetMode: "net",
      });
      return;
    }

    onChange({ ...value, withdrawalStrategy: strategy });
  }

  function updateRetirementGoal<K extends keyof typeof retirementGoals>(
    field: K,
    nextValue: (typeof retirementGoals)[K],
  ) {
    setRetirementGoals({ ...retirementGoals, [field]: nextValue });
  }

  function toggle(section: StrategySection) {
    setOpenSection((current) => (current === section ? null : section));
  }

  function setTaxFreeCashChoice(choice: "maximum" | "custom" | "none") {
    if (choice === "maximum") {
      onChange({ ...value, taxFreeCashMode: "maximum", taxFreeCash: 0 });
      return;
    }

    if (choice === "none") {
      onChange({ ...value, taxFreeCashMode: "custom", taxFreeCash: 0 });
      return;
    }

    onChange({
      ...value,
      taxFreeCashMode: "custom",
      taxFreeCash:
        value.taxFreeCash > 0
          ? value.taxFreeCash
          : Math.min(10_000, maximumTaxFreeCash),
    });
  }

  function setEndingPotChoice(choice: EndingPotChoice) {
    if (choice === "zero") {
      onChange({
        ...value,
        endingBalanceMode: "spend-to-zero",
        endingBalancePercentage: 0,
      });
      return;
    }

    if (choice === "preserve") {
      onChange({
        ...value,
        endingBalanceMode: "preserve",
        endingBalancePercentage: 1,
      });
      return;
    }

    if (choice === "ten-percent") {
      onChange({
        ...value,
        endingBalanceMode: "percentage",
        endingBalancePercentage: 0.1,
      });
      return;
    }

    onChange({
      ...value,
      endingBalanceMode: "percentage",
      endingBalancePercentage:
        endingBalanceMode === "percentage" &&
        endingBalancePercentage > 0 &&
        Math.abs(endingBalancePercentage - 0.1) >= 0.0001
          ? endingBalancePercentage
          : 0.25,
    });
  }

  function enableCustomSpending() {
    if (value.spendingPhases?.length) return;

    onChange({
      ...value,
      spendingPhases: [
        {
          startAge: retirementAge,
          annualIncome: value.desiredAnnualIncome,
          withdrawalRate: value.withdrawalRate,
          label: "Active retirement",
        },
      ],
    });
  }

  const taxFreeCashChoice = usesMaximumTaxFreeCash
    ? "maximum"
    : value.taxFreeCash > 0
      ? "custom"
      : "none";

  return (
    <div className="advanced-retirement-strategy">
      <div className="advanced-settings-subheading advanced-retirement-strategy-heading">
        <strong>Choose how your retirement income should be modelled</strong>
        <p>
          These settings describe how you expect to use your pension. Most people only
          need to review them once.
        </p>
      </div>

      <StrategyCard
        title="Income strategy"
        summary={
          value.withdrawalStrategy === "target-income"
            ? `Target spending · ${formatCurrency(value.desiredAnnualIncome)}/year`
            : `${formatPercentage(value.withdrawalRate)} of the remaining pension each year`
        }
        open={openSection === "income"}
        onToggle={() => toggle("income")}
      >
        <div
          className="retirement-strategy-choice-grid"
          role="radiogroup"
          aria-label="Income strategy"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "target-income"}
            className={value.withdrawalStrategy === "target-income" ? "is-selected" : undefined}
            onClick={() => selectIncomeStrategy("target-income")}
          >
            <strong>Spend a target amount each year</strong>
            <span>Plan around the net amount you would like available to spend.</span>
            <small>Recommended for most plans</small>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "percentage"}
            className={value.withdrawalStrategy === "percentage" ? "is-selected" : undefined}
            onClick={() => selectIncomeStrategy("percentage")}
          >
            <strong>Withdraw a percentage of the pension</strong>
            <span>Income rises and falls with the remaining pension value.</span>
          </button>
        </div>

        <div className="retirement-strategy-fields">
          {value.withdrawalStrategy === "target-income" ? (
            <FormField
              id={`${idPrefix}-desiredAnnualIncome`}
              label="Desired annual spending"
              hint="The net amount you would like available to spend each year, in today's money."
            >
              {(id, describedBy) => (
                <CurrencyInput
                  id={id}
                  aria-describedby={describedBy}
                  value={value.desiredAnnualIncome}
                  min={0}
                  step={500}
                  onValueChange={(next) => update("desiredAnnualIncome", next ?? 0)}
                />
              )}
            </FormField>
          ) : (
            <FormField
              id={`${idPrefix}-withdrawalRate`}
              label="Annual withdrawal rate"
              hint="The percentage of the remaining pension withdrawn each year."
            >
              {(id, describedBy) => (
                <PercentageInput
                  id={id}
                  aria-describedby={describedBy}
                  value={value.withdrawalRate}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={(next) => update("withdrawalRate", next ?? 0)}
                />
              )}
            </FormField>
          )}
        </div>
      </StrategyCard>

      <StrategyCard
        title="State Pension"
        summary={
          retirementGoals.includeStatePension
            ? `Included from age ${retirementGoals.statePensionAge} · ${formatCurrency(retirementGoals.statePensionAnnualAmount)}/year`
            : "Not included"
        }
        open={openSection === "state-pension"}
        onToggle={() => toggle("state-pension")}
      >
        <div
          className="retirement-strategy-choice-grid"
          role="radiogroup"
          aria-label="State Pension choice"
        >
          <button
            type="button"
            role="radio"
            aria-checked={retirementGoals.includeStatePension}
            className={retirementGoals.includeStatePension ? "is-selected" : undefined}
            onClick={() => updateRetirementGoal("includeStatePension", true)}
          >
            <strong>Include State Pension</strong>
            <span>Include the expected State Pension once it begins.</span>
            <small>Default</small>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!retirementGoals.includeStatePension}
            className={!retirementGoals.includeStatePension ? "is-selected" : undefined}
            onClick={() => updateRetirementGoal("includeStatePension", false)}
          >
            <strong>Do not include State Pension</strong>
            <span>Model retirement income using the private pension only.</span>
          </button>
        </div>

        {retirementGoals.includeStatePension && (
          <div className="retirement-strategy-fields">
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
                  onValueChange={(next) =>
                    updateRetirementGoal("statePensionAnnualAmount", next ?? 0)
                  }
                />
              )}
            </FormField>
            <FormField
              id={`${idPrefix}-statePensionAge`}
              label="State Pension starts at age"
              hint="The age when State Pension begins in the projection."
            >
              {(id, describedBy) => (
                <NumberInput
                  id={id}
                  aria-describedby={describedBy}
                  value={retirementGoals.statePensionAge}
                  min={55}
                  max={100}
                  suffix="years"
                  onValueChange={(next) =>
                    updateRetirementGoal(
                      "statePensionAge",
                      next ?? retirementGoals.statePensionAge,
                    )
                  }
                />
              )}
            </FormField>
          </div>
        )}
      </StrategyCard>

      <StrategyCard
        title="Tax-free cash"
        summary={
          usesMaximumTaxFreeCash
            ? `Maximum available · currently ${formatCurrency(maximumTaxFreeCash)}`
            : value.taxFreeCash > 0
              ? `Custom amount · ${formatCurrency(value.taxFreeCash)}`
              : "No tax-free cash"
        }
        open={openSection === "tax-free-cash"}
        onToggle={() => toggle("tax-free-cash")}
      >
        <div
          className="retirement-strategy-choice-grid is-three"
          role="radiogroup"
          aria-label="Tax-free cash choice"
        >
          <button
            type="button"
            role="radio"
            aria-checked={taxFreeCashChoice === "maximum"}
            className={taxFreeCashChoice === "maximum" ? "is-selected" : undefined}
            onClick={() => setTaxFreeCashChoice("maximum")}
          >
            <strong>Take maximum available</strong>
            <span>
              Uses up to 25% of the pension being accessed, subject to the modelled
              allowance.
            </span>
            <small>Default</small>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={taxFreeCashChoice === "custom"}
            className={taxFreeCashChoice === "custom" ? "is-selected" : undefined}
            onClick={() => setTaxFreeCashChoice("custom")}
          >
            <strong>Choose a custom amount</strong>
            <span>Take less than the illustrated maximum.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={taxFreeCashChoice === "none"}
            className={taxFreeCashChoice === "none" ? "is-selected" : undefined}
            onClick={() => setTaxFreeCashChoice("none")}
          >
            <strong>Take no tax-free cash</strong>
            <span>Leave the full pension invested for retirement income.</span>
          </button>
        </div>

        {taxFreeCashChoice === "custom" && (
          <div className="retirement-strategy-fields">
            <FormField
              id={`${idPrefix}-taxFreeCash`}
              label="Custom tax-free cash amount"
              hint={`Enter up to the illustrated maximum of ${formatCurrency(maximumTaxFreeCash)}.`}
            >
              {(id, describedBy) => (
                <CurrencyInput
                  id={id}
                  aria-describedby={describedBy}
                  value={value.taxFreeCash}
                  min={0}
                  max={maximumTaxFreeCash}
                  step={100}
                  onValueChange={(next) =>
                    update(
                      "taxFreeCash",
                      Math.min(Math.max(0, next ?? 0), maximumTaxFreeCash),
                    )
                  }
                />
              )}
            </FormField>
          </div>
        )}
        <p className="advanced-plan-note">
          The illustrated maximum is currently {formatCurrency(maximumTaxFreeCash)},
          based on the projected pension at retirement and the modelled lump-sum
          allowance.
        </p>
      </StrategyCard>

      <StrategyCard
        title="Pot at the end"
        summary={endingPotSummary}
        open={openSection === "ending-pot"}
        onToggle={() => toggle("ending-pot")}
      >
        <div
          className="retirement-strategy-choice-grid is-two-by-two"
          role="radiogroup"
          aria-label="Pension pot at the end of the plan"
        >
          <button
            type="button"
            role="radio"
            aria-checked={endingPotChoice === "zero"}
            className={endingPotChoice === "zero" ? "is-selected" : undefined}
            onClick={() => setEndingPotChoice("zero")}
          >
            <strong>Spend the pension to £0</strong>
            <span>Use the full retirement pot across the planning period.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={endingPotChoice === "ten-percent"}
            className={endingPotChoice === "ten-percent" ? "is-selected" : undefined}
            onClick={() => setEndingPotChoice("ten-percent")}
          >
            <strong>Keep 10%</strong>
            <span>Finish with 10% of the pension available for drawdown at retirement.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={endingPotChoice === "custom"}
            className={endingPotChoice === "custom" ? "is-selected" : undefined}
            onClick={() => setEndingPotChoice("custom")}
          >
            <strong>Keep a custom percentage</strong>
            <span>Choose how much of the retirement drawdown pot you want left.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={endingPotChoice === "preserve"}
            className={endingPotChoice === "preserve" ? "is-selected" : undefined}
            onClick={() => setEndingPotChoice("preserve")}
          >
            <strong>Preserve the retirement pot</strong>
            <span>Finish with the same pension value that was available for drawdown at retirement.</span>
            <small>Default</small>
          </button>
        </div>

        {endingPotChoice === "custom" && (
          <div className="retirement-strategy-fields">
            <FormField
              id={`${idPrefix}-endingBalancePercentage`}
              label="Percentage of retirement pot to keep"
              hint="This percentage is based on the pension available for drawdown at retirement, after tax-free cash."
            >
              {(id, describedBy) => (
                <PercentageInput
                  id={id}
                  aria-describedby={describedBy}
                  value={endingBalancePercentage}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(next) =>
                    onChange({
                      ...value,
                      endingBalanceMode: "percentage",
                      endingBalancePercentage: Math.min(1, Math.max(0, next ?? 0)),
                    })
                  }
                />
              )}
            </FormField>
          </div>
        )}

        <p className="advanced-plan-note">
          This sets the pension reserve you want left at the planning age. It is anchored
          to the pension available for drawdown at retirement and does not grow with
          inflation.
        </p>
      </StrategyCard>

      <StrategyCard
        title="Spending pattern"
        summary={spendingPattern}
        open={openSection === "spending"}
        onToggle={() => toggle("spending")}
      >
        <div
          className="retirement-strategy-choice-grid"
          role="radiogroup"
          aria-label="Spending pattern"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!hasCustomSpending}
            className={!hasCustomSpending ? "is-selected" : undefined}
            onClick={() => update("spendingPhases", undefined)}
          >
            <strong>
              {value.withdrawalStrategy === "percentage"
                ? "Keep one withdrawal rate"
                : "Keep spending level"}
            </strong>
            <span>
              {value.withdrawalStrategy === "percentage"
                ? "Use the same percentage withdrawal rate throughout retirement."
                : "Use the same spending target throughout retirement."}
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={hasCustomSpending}
            className={hasCustomSpending ? "is-selected" : undefined}
            onClick={enableCustomSpending}
          >
            <strong>
              {value.withdrawalStrategy === "percentage"
                ? "Use different withdrawal rates"
                : "Create a custom spending plan"}
            </strong>
            <span>
              {value.withdrawalStrategy === "percentage"
                ? "Set different percentage withdrawal rates at different stages of retirement."
                : "Set different spending targets at different stages of retirement."}
            </span>
          </button>
        </div>

        {hasCustomSpending && (
          <div className="retirement-strategy-spending-editor">
            <ScenarioSpendingPhaseFields
              idPrefix={`${idPrefix}-spending`}
              retirementAge={retirementAge}
              value={value}
              onChange={onChange}
              showEnableToggle={false}
            />
          </div>
        )}
      </StrategyCard>
    </div>
  );
}

function StrategyCard({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className={`retirement-strategy-card${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="retirement-strategy-card-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>
          <strong>{title}</strong>
          <small>{summary}</small>
        </span>
        <span className="essential-plan-card-chevron" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="retirement-strategy-card-body">{children}</div>}
    </article>
  );
}
