import { useState, type ReactNode } from "react";

import type { ScenarioDrawdownPreferences } from "../../../domain/scenarios";
import { usePensionProjection } from "../../../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
import { CurrencyInput, FormField, NumberInput, PercentageInput } from "../../forms";
import { ScenarioSpendingPhaseFields, useScenarios } from "../../scenarios";

const STANDARD_LUMP_SUM_ALLOWANCE = 268_275;
const TAX_FREE_CASH_RATE = 0.25;

type StrategySection = "income" | "state-pension" | "tax-free-cash" | "spending";

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
  const selectedTaxFreeCash = usesMaximumTaxFreeCash
    ? maximumTaxFreeCash
    : Math.floor(Math.max(0, value.taxFreeCash));
  const spendingPattern = value.spendingPhases?.length ? "Custom spending plan" : "Level spending";

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
      taxFreeCash: value.taxFreeCash > 0 ? value.taxFreeCash : Math.min(10_000, maximumTaxFreeCash),
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
            ? `Target income · ${formatCurrency(value.desiredAnnualIncome)}/year`
            : `${formatPercentage(value.withdrawalRate)} of the remaining pension each year`
        }
        open={openSection === "income"}
        onToggle={() => toggle("income")}
      >
        <div className="retirement-strategy-choice-grid" role="radiogroup" aria-label="Income strategy">
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "target-income"}
            className={value.withdrawalStrategy === "target-income" ? "is-selected" : undefined}
            onClick={() => update("withdrawalStrategy", "target-income")}
          >
            <strong>Spend a target amount each year</strong>
            <span>Plan around the amount you would like available to spend.</span>
            <small>Recommended for most plans</small>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "percentage"}
            className={value.withdrawalStrategy === "percentage" ? "is-selected" : undefined}
            onClick={() => update("withdrawalStrategy", "percentage")}
          >
            <strong>Withdraw a percentage of the pension</strong>
            <span>Income rises and falls with the remaining pension value.</span>
          </button>
        </div>

        {value.withdrawalStrategy === "target-income" ? (
          <div className="retirement-strategy-fields">
            <div className="form-field retirement-strategy-field-wide">
              <span className="form-field-label">Income target basis</span>
              <div className="advanced-choice-toggle" role="group" aria-label="Income target basis">
                <button
                  type="button"
                  className={value.incomeTargetMode === "net" ? "is-selected" : undefined}
                  aria-pressed={value.incomeTargetMode === "net"}
                  onClick={() => update("incomeTargetMode", "net")}
                >
                  Net spendable
                </button>
                <button
                  type="button"
                  className={value.incomeTargetMode === "gross" ? "is-selected" : undefined}
                  aria-pressed={value.incomeTargetMode === "gross"}
                  onClick={() => update("incomeTargetMode", "gross")}
                >
                  Gross income
                </button>
              </div>
            </div>
            <FormField
              id={`${idPrefix}-desiredAnnualIncome`}
              label={value.incomeTargetMode === "net" ? "Desired net annual income" : "Desired gross annual income"}
              hint="This is the starting annual income target."
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
          </div>
        ) : (
          <div className="retirement-strategy-fields">
            <FormField id={`${idPrefix}-withdrawalRate`} label="Annual withdrawal rate">
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
          </div>
        )}
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
        <label className="retirement-goals-checkbox">
          <input
            type="checkbox"
            checked={retirementGoals.includeStatePension}
            onChange={(event) => updateRetirementGoal("includeStatePension", event.target.checked)}
          />
          <span>Include State Pension in this retirement plan</span>
        </label>

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
                  onValueChange={(next) => updateRetirementGoal("statePensionAnnualAmount", next ?? 0)}
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
                  onValueChange={(next) => updateRetirementGoal("statePensionAge", next ?? retirementGoals.statePensionAge)}
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
        <div className="retirement-strategy-choice-grid is-three" role="radiogroup" aria-label="Tax-free cash choice">
          <button
            type="button"
            role="radio"
            aria-checked={taxFreeCashChoice === "maximum"}
            className={taxFreeCashChoice === "maximum" ? "is-selected" : undefined}
            onClick={() => setTaxFreeCashChoice("maximum")}
          >
            <strong>Take maximum available</strong>
            <span>Uses up to 25% of the pension being accessed, subject to the modelled allowance.</span>
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
                    update("taxFreeCash", Math.min(Math.max(0, next ?? 0), maximumTaxFreeCash))
                  }
                />
              )}
            </FormField>
          </div>
        )}

        <p className="advanced-plan-note">
          The illustrated maximum is currently {formatCurrency(maximumTaxFreeCash)}, based on the projected pension at retirement and the modelled lump-sum allowance.
        </p>
      </StrategyCard>

      <StrategyCard
        title="Spending pattern"
        summary={spendingPattern}
        open={openSection === "spending"}
        onToggle={() => toggle("spending")}
      >
        <div className="retirement-strategy-choice-grid" role="radiogroup" aria-label="Spending pattern">
          <button
            type="button"
            role="radio"
            aria-checked={!value.spendingPhases?.length}
            className={!value.spendingPhases?.length ? "is-selected" : undefined}
            onClick={() => update("spendingPhases", undefined)}
          >
            <strong>Keep spending level</strong>
            <span>Use the same starting spending target throughout retirement.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={Boolean(value.spendingPhases?.length)}
            className={value.spendingPhases?.length ? "is-selected" : undefined}
            onClick={() =>
              update("spendingPhases", value.spendingPhases?.length
                ? value.spendingPhases
                : [{ startAge: retirementAge, annualIncome: value.desiredAnnualIncome }])
            }
          >
            <strong>Create a custom spending plan</strong>
            <span>Model different spending levels at different stages of retirement.</span>
          </button>
        </div>

        {Boolean(value.spendingPhases?.length) && (
          <div className="retirement-strategy-spending-editor">
            <ScenarioSpendingPhaseFields
              idPrefix={`${idPrefix}-spending`}
              retirementAge={retirementAge}
              value={value}
              onChange={onChange}
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
