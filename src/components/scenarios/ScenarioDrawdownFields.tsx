import { useState } from "react";

import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import { usePensionProjection } from "../../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../../hooks/useStoredRetirementGoals";
import { formatCurrency } from "../../utils/formatters";
import {
  CurrencyInput,
  FormField,
  NumberInput,
  PercentageInput,
} from "../forms";
import { useScenarios } from "./ScenarioContext";
import { ScenarioSpendingPhaseFields } from "./ScenarioSpendingPhaseFields";

const STANDARD_LUMP_SUM_ALLOWANCE = 268_275;
const TAX_FREE_CASH_RATE = 0.25;

type IncomeEditorSection =
  | "income-target"
  | "retirement-chapters"
  | "tax-free-cash"
  | "state-pension";

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
  const { activeScenario } = useScenarios();
  const [retirementGoals, setRetirementGoals] = useStoredRetirementGoals();
  const [activeSection, setActiveSection] =
    useState<IncomeEditorSection>("income-target");
  const activeProjection = usePensionProjection(activeScenario.inputs);
  const projectedPensionAtRetirement = activeProjection.hasErrors
    ? 0
    : Math.max(0, activeProjection.projection.finalBalance.real);
  const maximumTaxFreeCash = Math.floor(
    Math.min(
      projectedPensionAtRetirement * TAX_FREE_CASH_RATE,
      STANDARD_LUMP_SUM_ALLOWANCE,
    ),
  );
  const selectedTaxFreeCash = Math.floor(Math.max(0, value.taxFreeCash));
  const pensionRemainingAfterCash = Math.max(
    0,
    projectedPensionAtRetirement - selectedTaxFreeCash,
  );
  const sections: Array<{ id: IncomeEditorSection; label: string }> = [
    { id: "income-target", label: "Income target" },
    ...(value.withdrawalStrategy === "target-income"
      ? ([{ id: "retirement-chapters", label: "Retirement chapters" }] as const)
      : []),
    { id: "tax-free-cash", label: "Tax-free cash" },
    { id: "state-pension", label: "State Pension" },
  ];
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSection),
  );
  const visibleSection = sections[activeIndex]?.id ?? "income-target";

  function update<K extends keyof ScenarioDrawdownPreferences>(
    field: K,
    nextValue: ScenarioDrawdownPreferences[K],
  ) {
    let next = { ...value, [field]: nextValue };

    if (field === "desiredAnnualIncome" && next.spendingPhases?.length) {
      next = {
        ...next,
        spendingPhases: next.spendingPhases.map((phase, index) =>
          index === 0
            ? { ...phase, annualIncome: nextValue as number }
            : phase,
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

  function selectSection(section: IncomeEditorSection) {
    setActiveSection(section);
  }

  const planningAgeError =
    value.planningAge <= retirementAge
      ? "Planning age must be later than retirement age."
      : value.planningAge > 120
        ? "Planning age must be 120 or below."
        : undefined;

  const taxFreeCashError =
    selectedTaxFreeCash > maximumTaxFreeCash
      ? `Enter no more than the illustrated maximum of ${formatCurrency(maximumTaxFreeCash)}.`
      : undefined;

  return (
    <fieldset className="scenario-edit-section scenario-retirement-income-editor">
      <legend>Retirement income</legend>
      <p className="scenario-edit-section-copy">
        Work through one part at a time. Your changes are kept as you move between
        the sections below.
      </p>

      <div
        className="scenario-income-section-nav"
        role="tablist"
        aria-label="Retirement income sections"
      >
        {sections.map((section) => {
          const selected = section.id === visibleSection;
          return (
            <button
              key={section.id}
              type="button"
              id={`${idPrefix}-${section.id}-tab`}
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-${section.id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={selected ? "is-active" : undefined}
              onClick={() => selectSection(section.id)}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div className="scenario-income-panel-shell">
        {visibleSection === "income-target" && (
          <section
            id={`${idPrefix}-income-target-panel`}
            className="scenario-edit-subsection scenario-income-target-section"
            role="tabpanel"
            aria-labelledby={`${idPrefix}-income-target-tab`}
            tabIndex={0}
          >
            <div>
              <h3>Income approach</h3>
              <p>Choose one annual target or a percentage of the remaining pension.</p>
            </div>

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
                <span>Calculate the pension income needed for a chosen lifestyle.</span>
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
                label="End of retirement plan"
                hint="The final age included in the retirement illustration."
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
                    hint="This is the starting target for Active retirement."
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
            </div>
          </section>
        )}

        {visibleSection === "retirement-chapters" &&
          value.withdrawalStrategy === "target-income" && (
            <section
              id={`${idPrefix}-retirement-chapters-panel`}
              className="scenario-edit-subsection scenario-retirement-chapters-editor"
              role="tabpanel"
              aria-labelledby={`${idPrefix}-retirement-chapters-tab`}
              tabIndex={0}
            >
              <ScenarioSpendingPhaseFields
                idPrefix={`${idPrefix}-chapters`}
                retirementAge={retirementAge}
                value={value}
                onChange={onChange}
              />
            </section>
          )}

        {visibleSection === "tax-free-cash" && (
          <section
            id={`${idPrefix}-tax-free-cash-panel`}
            className="scenario-edit-subsection scenario-tax-free-cash-section"
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tax-free-cash-tab`}
            tabIndex={0}
          >
            <div className="scenario-tax-free-cash-heading">
              <div>
                <h3>Tax-free cash at retirement</h3>
                <p>
                  Choose any amount from £0 up to the illustrated maximum. Taking
                  cash reduces the pension left to provide retirement income.
                </p>
              </div>
              <div className="scenario-tax-free-cash-limit">
                <span>Illustrated maximum</span>
                <strong>{formatCurrency(maximumTaxFreeCash)}</strong>
                <small>
                  25% of the projected pension, capped at the standard £268,275
                  lump-sum allowance.
                </small>
              </div>
            </div>

            <FormField
              id={`${idPrefix}-taxFreeCash`}
              label="Tax-free cash amount"
              hint={`Enter a whole-pound amount up to ${formatCurrency(maximumTaxFreeCash)}.`}
              error={taxFreeCashError}
              optional
            >
              {(id, describedBy) => (
                <div className="scenario-tax-free-cash-input-row">
                  <CurrencyInput
                    id={id}
                    aria-describedby={describedBy}
                    value={selectedTaxFreeCash}
                    min={0}
                    max={maximumTaxFreeCash}
                    step={1}
                    error={Boolean(taxFreeCashError)}
                    onValueChange={(nextValue) =>
                      update(
                        "taxFreeCash",
                        Math.floor(
                          Math.min(
                            Math.max(0, nextValue ?? 0),
                            maximumTaxFreeCash,
                          ),
                        ),
                      )
                    }
                  />
                  <div className="scenario-tax-free-cash-actions">
                    <button
                      type="button"
                      className="ui-button ui-button-secondary ui-button-small"
                      disabled={maximumTaxFreeCash <= 0}
                      onClick={() => update("taxFreeCash", maximumTaxFreeCash)}
                    >
                      Use maximum
                    </button>
                    <button
                      type="button"
                      className="comparison-text-button"
                      disabled={selectedTaxFreeCash === 0}
                      onClick={() => update("taxFreeCash", 0)}
                    >
                      Take no cash
                    </button>
                  </div>
                </div>
              )}
            </FormField>

            <dl className="scenario-tax-free-cash-summary">
              <div>
                <dt>Projected pension at retirement</dt>
                <dd>{formatCurrency(projectedPensionAtRetirement)}</dd>
              </div>
              <div>
                <dt>Tax-free cash selected</dt>
                <dd>{formatCurrency(selectedTaxFreeCash)}</dd>
              </div>
              <div>
                <dt>Pension remaining for income</dt>
                <dd>{formatCurrency(pensionRemainingAfterCash)}</dd>
              </div>
            </dl>

            <p className="scenario-tax-free-cash-note">
              This uses the standard 2026/27 UK lump-sum allowance and assumes none
              has already been used. A protected allowance or previous tax-free
              withdrawals can change your personal limit, so confirm it with your
              pension provider.
            </p>
          </section>
        )}

        {visibleSection === "state-pension" && (
          <section
            id={`${idPrefix}-state-pension-panel`}
            className="scenario-edit-subsection scenario-state-pension-section"
            role="tabpanel"
            aria-labelledby={`${idPrefix}-state-pension-tab`}
            tabIndex={0}
          >
            <div>
              <h3>State Pension</h3>
              <p>
                Include an expected State Pension so the income model can reduce
                the amount needed from the private pension once it starts.
              </p>
            </div>

            <label className="retirement-goals-checkbox">
              <input
                type="checkbox"
                checked={retirementGoals.includeStatePension}
                onChange={(event) =>
                  updateRetirementGoal(
                    "includeStatePension",
                    event.target.checked,
                  )
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
                        updateRetirementGoal(
                          "statePensionAge",
                          nextValue ?? 67,
                        )
                      }
                    />
                  )}
                </FormField>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="scenario-income-panel-actions">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={activeIndex === 0}
          onClick={() => selectSection(sections[activeIndex - 1].id)}
        >
          Previous
        </button>
        <span>
          {activeIndex + 1} of {sections.length}
        </span>
        <button
          type="button"
          className="ui-button ui-button-primary"
          disabled={activeIndex === sections.length - 1}
          onClick={() => selectSection(sections[activeIndex + 1].id)}
        >
          Next
        </button>
      </div>
    </fieldset>
  );
}
