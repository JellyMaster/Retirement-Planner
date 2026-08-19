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

type StrategySection = "income" | "spending" | "sources";

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
  const taxFreeCashChoice = usesMaximumTaxFreeCash
    ? "maximum"
    : value.taxFreeCash > 0
      ? "custom"
      : "none";
  const hasCustomSpending = Boolean(value.spendingPhases?.length);

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
    onChange({
      ...value,
      withdrawalStrategy: strategy,
      ...(strategy === "target-income" ? { incomeTargetMode: "net" as const } : {}),
    });
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

  const incomeSummary =
    value.withdrawalStrategy === "target-income"
      ? `Stable income · ${formatCurrency(value.desiredAnnualIncome)}/year target`
      : `Flexible income · ${formatPercentage(value.withdrawalRate)}/year`;

  const spendingSummary = hasCustomSpending
    ? value.withdrawalStrategy === "percentage"
      ? "Different withdrawal rates through retirement"
      : "Different spending stages through retirement"
    : "Keep it broadly consistent";

  const sourcesSummary = [
    retirementGoals.includeStatePension ? "State Pension included" : "No State Pension",
    usesMaximumTaxFreeCash
      ? "Maximum tax-free cash"
      : value.taxFreeCash > 0
        ? "Custom tax-free cash"
        : "No tax-free cash",
  ].join(" · ");

  return (
    <div className="advanced-retirement-strategy">
      <div className="advanced-settings-subheading advanced-retirement-strategy-heading">
        <strong>Make the key retirement drawdown decisions</strong>
        <p>
          Answer the questions below in everyday terms. The planner uses your choices to
          configure the drawdown model behind the scenes.
        </p>
      </div>

      <StrategyCard
        title="How should your retirement income work?"
        summary={incomeSummary}
        open={openSection === "income"}
        onToggle={() => toggle("income")}
      >
        <div
          className="retirement-strategy-choice-grid"
          role="radiogroup"
          aria-label="How should your retirement income work?"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "target-income"}
            className={value.withdrawalStrategy === "target-income" ? "is-selected" : undefined}
            onClick={() => selectIncomeStrategy("target-income")}
          >
            <strong>Stable income</strong>
            <span>
              Aim for a chosen amount of spendable income. Pension withdrawals adjust to
              help meet that target.
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value.withdrawalStrategy === "percentage"}
            className={value.withdrawalStrategy === "percentage" ? "is-selected" : undefined}
            onClick={() => selectIncomeStrategy("percentage")}
          >
            <strong>Flexible income</strong>
            <span>
              Withdraw a percentage of the remaining pension. Your income can rise or
              fall as the pension value changes.
            </span>
          </button>
        </div>

        {value.withdrawalStrategy === "target-income" ? (
          <div className="retirement-strategy-current-choice" role="note">
            <strong>Your income goal is {formatCurrency(value.desiredAnnualIncome)}/year.</strong>
            <span>
              Change the amount or choose a Retirement Living Standard in the Essential
              Retirement income section.
            </span>
          </div>
        ) : (
          <div className="retirement-strategy-fields">
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
          </div>
        )}
      </StrategyCard>

      <StrategyCard
        title="Will your spending change during retirement?"
        summary={spendingSummary}
        open={openSection === "spending"}
        onToggle={() => toggle("spending")}
      >
        <div
          className="retirement-strategy-choice-grid"
          role="radiogroup"
          aria-label="Will your spending change during retirement?"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!hasCustomSpending}
            className={!hasCustomSpending ? "is-selected" : undefined}
            onClick={() => update("spendingPhases", undefined)}
          >
            <strong>Keep it broadly consistent</strong>
            <span>
              {value.withdrawalStrategy === "percentage"
                ? "Use the same withdrawal percentage throughout retirement."
                : "Keep the same spending goal throughout retirement."}
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={hasCustomSpending}
            className={hasCustomSpending ? "is-selected" : undefined}
            onClick={enableCustomSpending}
          >
            <strong>Use different stages of retirement</strong>
            <span>
              {value.withdrawalStrategy === "percentage"
                ? "Set different withdrawal rates for different stages of retirement."
                : "Plan for spending to change as your retirement lifestyle changes."}
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

      <StrategyCard
        title="What income and cash should the plan include?"
        summary={sourcesSummary}
        open={openSection === "sources"}
        onToggle={() => toggle("sources")}
      >
        <section className="retirement-strategy-source-section">
          <div className="advanced-settings-subheading">
            <strong>Should we include your State Pension?</strong>
            <p>
              Include it if you expect to receive State Pension as part of your retirement
              income.
            </p>
          </div>
          <div
            className="retirement-strategy-choice-grid"
            role="radiogroup"
            aria-label="Should we include your State Pension?"
          >
            <button
              type="button"
              role="radio"
              aria-checked={retirementGoals.includeStatePension}
              className={retirementGoals.includeStatePension ? "is-selected" : undefined}
              onClick={() => updateRetirementGoal("includeStatePension", true)}
            >
              <strong>Yes, include it</strong>
              <span>Use State Pension as an income source once it begins.</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!retirementGoals.includeStatePension}
              className={!retirementGoals.includeStatePension ? "is-selected" : undefined}
              onClick={() => updateRetirementGoal("includeStatePension", false)}
            >
              <strong>No, leave it out</strong>
              <span>Model retirement using the private pension without State Pension.</span>
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
        </section>

        <section className="retirement-strategy-source-section">
          <div className="advanced-settings-subheading">
            <strong>Would you like to take tax-free cash when you retire?</strong>
            <p>
              Choose whether the illustration takes the maximum available, a custom
              amount, or leaves the pension invested.
            </p>
          </div>
          <div
            className="retirement-strategy-choice-grid is-three"
            role="radiogroup"
            aria-label="Would you like to take tax-free cash when you retire?"
          >
            <button
              type="button"
              role="radio"
              aria-checked={taxFreeCashChoice === "maximum"}
              className={taxFreeCashChoice === "maximum" ? "is-selected" : undefined}
              onClick={() => setTaxFreeCashChoice("maximum")}
            >
              <strong>Take the maximum</strong>
              <span>Use the maximum illustrated tax-free cash available at retirement.</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={taxFreeCashChoice === "custom"}
              className={taxFreeCashChoice === "custom" ? "is-selected" : undefined}
              onClick={() => setTaxFreeCashChoice("custom")}
            >
              <strong>Choose an amount</strong>
              <span>Take less than the illustrated maximum.</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={taxFreeCashChoice === "none"}
              className={taxFreeCashChoice === "none" ? "is-selected" : undefined}
              onClick={() => setTaxFreeCashChoice("none")}
            >
              <strong>Leave it invested</strong>
              <span>Take no tax-free cash in this illustration.</span>
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
            The illustrated maximum is currently {formatCurrency(maximumTaxFreeCash)}.
          </p>
        </section>
      </StrategyCard>

      <div className="retirement-strategy-what-if-note" role="note">
        <strong>What if your priorities conflict?</strong>
        <p>
          Questions such as spending the pension to £0, keeping a percentage of the pot,
          preserving the retirement value, or testing different market outcomes are best
          explored as alternatives rather than baked into the core plan. Use What If? to
          compare those trade-offs without changing your saved retirement strategy.
        </p>
      </div>
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
