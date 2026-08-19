import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { defaultPensionInputs } from "../../../config/defaultPensionInputs";
import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../../../domain/scenarios";
import type { PensionInputs } from "../../../engine/models/PensionInputs";
import { useStoredRetirementGoals } from "../../../hooks/useStoredRetirementGoals";
import { AppIcons } from "../../../icons";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
import type { PensionInputErrors } from "../../../validation/validatePensionInputs";
import {
  CurrencyInput,
  FormField,
  NumberInput,
  PercentageInput,
} from "../../forms";
import { ScenarioDrawdownFields, useScenarios } from "../../scenarios";
import { EssentialRetirementIncomeFields } from "./EssentialRetirementIncomeFields";

interface EssentialAdvancedPensionInputsFormProps {
  idPrefix?: string;
  value: PensionInputs;
  errors: PensionInputErrors;
  onChange: (inputs: PensionInputs) => void;
  onReset: () => void;
}

type EssentialSection = "retirement" | "pension" | "income";
type AdvancedSection = "assumptions" | "contributions" | "strategy";
type RequiredNumberField =
  | "currentAge"
  | "retirementAge"
  | "currentPot"
  | "monthlyEmployeeContribution"
  | "monthlyEmployerContribution";
type OptionalNumberField = "extraContributionAge" | "extraMonthlyContribution";
type PercentageField =
  | "annualReturn"
  | "annualFee"
  | "inflation"
  | "annualContributionIncrease";

export function EssentialAdvancedPensionInputsForm({
  idPrefix = "pension",
  value,
  errors,
  onChange,
  onReset,
}: EssentialAdvancedPensionInputsFormProps) {
  const { activeScenario, updateScenarioPlan } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const [drawdown, setDrawdown] = useState<ScenarioDrawdownPreferences>(() => ({
    ...(activeScenario.drawdown ?? createDefaultScenarioDrawdownPreferences()),
  }));
  const [openEssential, setOpenEssential] = useState<EssentialSection | null>(
    "retirement",
  );
  const [openAdvanced, setOpenAdvanced] = useState<AdvancedSection | null>(null);
  const [futureSavingEnabled, setFutureSavingEnabled] = useState(
    () =>
      value.annualContributionIncrease > 0 ||
      value.extraContributionAge !== undefined ||
      value.extraMonthlyContribution !== undefined,
  );

  const totalMonthly =
    value.monthlyEmployeeContribution + value.monthlyEmployerContribution;
  const planningAgeValid =
    drawdown.planningAge > value.retirementAge && drawdown.planningAge <= 120;
  const retirementComplete =
    !errors.currentAge && !errors.retirementAge && planningAgeValid;
  const pensionComplete =
    !errors.currentPot &&
    !errors.monthlyEmployeeContribution &&
    !errors.monthlyEmployerContribution;
  const incomeComplete = planningAgeValid && drawdown.desiredAnnualIncome >= 0;
  const essentialComplete = retirementComplete && pensionComplete && incomeComplete;
  const usesMaximumTaxFreeCash =
    drawdown.taxFreeCashMode === "maximum" ||
    (drawdown.taxFreeCashMode === undefined && drawdown.taxFreeCash === 0);
  const taxFreeCashSummary = usesMaximumTaxFreeCash
    ? "25% tax-free cash included"
    : drawdown.taxFreeCash > 0
      ? "Custom tax-free cash included"
      : "No tax-free cash";
  const futureSavingSummary = futureSavingEnabled
    ? createFutureSavingSummary(value)
    : "No future changes planned";

  function fieldId(name: string) {
    return `${idPrefix}-${name}`;
  }

  function updateRequired(field: RequiredNumberField, next: number | undefined) {
    onChange({ ...value, [field]: next ?? Number.NaN });
  }

  function updateOptional(field: OptionalNumberField, next: number | undefined) {
    onChange({ ...value, [field]: next });
  }

  function updatePercentage(field: PercentageField, next: number | undefined) {
    onChange({ ...value, [field]: next ?? Number.NaN });
  }

  function updateDrawdown(next: ScenarioDrawdownPreferences) {
    setDrawdown(next);
    updateScenarioPlan(activeScenario.id, activeScenario.inputs, next);
  }

  function toggleEssential(section: EssentialSection) {
    setOpenEssential((current) => (current === section ? null : section));
  }

  function toggleAdvanced(section: AdvancedSection) {
    setOpenAdvanced((current) => (current === section ? null : section));
  }

  function setMaximumTaxFreeCash(enabled: boolean) {
    updateDrawdown({
      ...drawdown,
      taxFreeCashMode: enabled ? "maximum" : "custom",
      taxFreeCash: enabled ? drawdown.taxFreeCash : 0,
    });
  }

  function restorePlanningAssumptions() {
    onChange({
      ...value,
      annualReturn: defaultPensionInputs.annualReturn,
      annualFee: defaultPensionInputs.annualFee,
      inflation: defaultPensionInputs.inflation,
    });
  }

  function setFutureSavingChanges(enabled: boolean) {
    setFutureSavingEnabled(enabled);
    if (enabled) return;

    onChange({
      ...value,
      annualContributionIncrease: 0,
      extraContributionAge: undefined,
      extraMonthlyContribution: undefined,
    });
  }

  return (
    <section id="guided-pension-form" className="essential-plan-editor panel">
      <header className="essential-plan-editor-header">
        <div>
          <p className="planner-eyebrow">Build your retirement plan</p>
          <h2>Start with what matters</h2>
          <p>
            Complete the essentials first. Advanced settings are there when you want to
            fine-tune the model.
          </p>
        </div>
        <button type="button" className="reset-button" onClick={onReset}>
          Reset plan
        </button>
      </header>

      <section className="essential-plan-group" aria-labelledby="essential-plan-title">
        <div className="essential-plan-group-heading">
          <div>
            <p className="planner-eyebrow">Essential</p>
            <h3 id="essential-plan-title">The information needed for your plan</h3>
          </div>
          <span
            className={
              essentialComplete
                ? "essential-plan-status is-complete"
                : "essential-plan-status"
            }
          >
            {essentialComplete ? "Ready" : "Needs attention"}
          </span>
        </div>

        <EssentialCard
          title="You & retirement"
          summary={`Age ${safeNumber(value.currentAge)} → retire ${safeNumber(value.retirementAge)} → plan to ${drawdown.planningAge}`}
          icon={AppIcons.user}
          complete={retirementComplete}
          open={openEssential === "retirement"}
          ariaLabel="You and retirement"
          onToggle={() => toggleEssential("retirement")}
        >
          <FormField
            id={fieldId("currentAge")}
            label="Current age"
            hint="Your age today."
            error={errors.currentAge}
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.currentAge) ? value.currentAge : ""}
                min={18}
                max={100}
                suffix="years"
                error={Boolean(errors.currentAge)}
                onValueChange={(next) => updateRequired("currentAge", next)}
              />
            )}
          </FormField>
          <FormField
            id={fieldId("retirementAge")}
            label="Retirement age"
            hint="When you expect regular pension contributions to stop."
            error={errors.retirementAge}
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.retirementAge) ? value.retirementAge : ""}
                min={18}
                max={100}
                suffix="years"
                error={Boolean(errors.retirementAge)}
                onValueChange={(next) => updateRequired("retirementAge", next)}
              />
            )}
          </FormField>
          <FormField
            id={fieldId("planningAge")}
            label="Plan income to age"
            hint="How long should this retirement plan provide income?"
            error={
              !planningAgeValid
                ? "Planning age must be after retirement and no more than 120."
                : undefined
            }
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={drawdown.planningAge}
                min={value.retirementAge + 1}
                max={120}
                suffix="years"
                error={!planningAgeValid}
                onValueChange={(next) =>
                  updateDrawdown({
                    ...drawdown,
                    planningAge: next ?? drawdown.planningAge,
                  })
                }
              />
            )}
          </FormField>
        </EssentialCard>

        <EssentialCard
          title="Your pension"
          summary={`${formatCurrency(value.currentPot)} saved · ${formatCurrency(totalMonthly)}/month`}
          icon={AppIcons.pension}
          complete={pensionComplete}
          open={openEssential === "pension"}
          ariaLabel="Your pension"
          onToggle={() => toggleEssential("pension")}
        >
          <FormField
            id={fieldId("currentPot")}
            label="Current pension pot"
            hint="The combined value of pensions included in this plan."
            error={errors.currentPot}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.currentPot) ? value.currentPot : ""}
                step={100}
                error={Boolean(errors.currentPot)}
                onValueChange={(next) => updateRequired("currentPot", next)}
              />
            )}
          </FormField>
          <FormField
            id={fieldId("employeeContribution")}
            label="Your monthly contribution"
            hint="The amount paid from you each month."
            error={errors.monthlyEmployeeContribution}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.monthlyEmployeeContribution)
                    ? value.monthlyEmployeeContribution
                    : ""
                }
                step={10}
                error={Boolean(errors.monthlyEmployeeContribution)}
                onValueChange={(next) =>
                  updateRequired("monthlyEmployeeContribution", next)
                }
              />
            )}
          </FormField>
          <FormField
            id={fieldId("employerContribution")}
            label="Employer monthly contribution"
            hint="The amount your employer pays in each month."
            error={errors.monthlyEmployerContribution}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.monthlyEmployerContribution)
                    ? value.monthlyEmployerContribution
                    : ""
                }
                step={10}
                error={Boolean(errors.monthlyEmployerContribution)}
                onValueChange={(next) =>
                  updateRequired("monthlyEmployerContribution", next)
                }
              />
            )}
          </FormField>
        </EssentialCard>

        <EssentialCard
          title="Retirement income"
          summary={`${formatCurrency(drawdown.desiredAnnualIncome)}/year spending target · ${retirementGoals.includeStatePension ? "State Pension included" : "State Pension not included"} · ${taxFreeCashSummary}`}
          icon={AppIcons.money}
          complete={incomeComplete}
          open={openEssential === "income"}
          ariaLabel="Retirement income"
          onToggle={() => toggleEssential("income")}
        >
          <EssentialRetirementIncomeFields
            idPrefix={fieldId("essential-income")}
            value={drawdown}
            onChange={updateDrawdown}
          />
        </EssentialCard>
      </section>

      <section className="advanced-plan-group" aria-labelledby="advanced-plan-title">
        <div className="essential-plan-group-heading">
          <div>
            <p className="planner-eyebrow">Advanced</p>
            <h3 id="advanced-plan-title">Fine-tune how the plan is modelled</h3>
            <p>You do not need to review these every time you use the planner.</p>
          </div>
        </div>

        <AdvancedCard
          title="Investment assumptions"
          summary={`${formatPercentage(value.annualReturn)} return · ${formatPercentage(value.inflation)} inflation · ${formatPercentage(value.annualFee)} fee`}
          icon={AppIcons.growth}
          open={openAdvanced === "assumptions"}
          ariaLabel="Investment assumptions"
          onToggle={() => toggleAdvanced("assumptions")}
        >
          <div className="advanced-settings-intro">
            <div>
              <strong>Planning assumptions</strong>
              <p>
                These figures drive the long-term illustration. They are assumptions,
                not predictions, and can be changed to explore different outcomes.
              </p>
            </div>
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-small"
              onClick={restorePlanningAssumptions}
            >
              Restore planning assumptions
            </button>
          </div>

          <FormField
            id={fieldId("annualReturn")}
            label="Expected annual return"
            hint="Investment growth before pension fees."
            error={errors.annualReturn}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.annualReturn) ? value.annualReturn : ""}
                max={20}
                step={0.1}
                error={Boolean(errors.annualReturn)}
                onValueChange={(next) => updatePercentage("annualReturn", next)}
              />
            )}
          </FormField>
          <FormField
            id={fieldId("inflation")}
            label="Expected inflation"
            hint="Used to show values in today's money."
            error={errors.inflation}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.inflation) ? value.inflation : ""}
                max={15}
                step={0.1}
                error={Boolean(errors.inflation)}
                onValueChange={(next) => updatePercentage("inflation", next)}
              />
            )}
          </FormField>
          <FormField
            id={fieldId("annualFee")}
            label="Annual pension fee"
            hint="Fund, platform and administration charges combined."
            error={errors.annualFee}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.annualFee) ? value.annualFee : ""}
                max={5}
                step={0.01}
                decimalPlaces={4}
                error={Boolean(errors.annualFee)}
                onValueChange={(next) => updatePercentage("annualFee", next)}
              />
            )}
          </FormField>
        </AdvancedCard>

        <AdvancedCard
          title="Future saving changes"
          summary={futureSavingSummary}
          icon={AppIcons.plus}
          open={openAdvanced === "contributions"}
          ariaLabel="Future saving changes"
          onToggle={() => toggleAdvanced("contributions")}
        >
          <div className="advanced-settings-intro advanced-future-saving-intro">
            <div>
              <strong>Do you expect your pension saving to change in future?</strong>
              <p>
                Keep this off if you want the projection to use your current monthly
                contributions throughout the saving period.
              </p>
            </div>
            <div
              className="advanced-choice-toggle"
              role="group"
              aria-label="Future saving changes"
            >
              <button
                type="button"
                className={!futureSavingEnabled ? "is-selected" : undefined}
                aria-pressed={!futureSavingEnabled}
                onClick={() => setFutureSavingChanges(false)}
              >
                No
              </button>
              <button
                type="button"
                className={futureSavingEnabled ? "is-selected" : undefined}
                aria-pressed={futureSavingEnabled}
                onClick={() => setFutureSavingChanges(true)}
              >
                Yes
              </button>
            </div>
          </div>

          {futureSavingEnabled && (
            <>
              <div className="advanced-settings-subheading">
                <strong>How might saving change?</strong>
                <p>
                  You can model contributions rising each year, an extra monthly amount
                  later, or both.
                </p>
              </div>
              <FormField
                id={fieldId("contributionIncrease")}
                label="Annual contribution increase"
                hint="For example, contributions rising with salary. Leave at 0% if they stay flat."
                error={errors.annualContributionIncrease}
              >
                {(id, describedBy) => (
                  <PercentageInput
                    id={id}
                    aria-describedby={describedBy}
                    value={
                      Number.isFinite(value.annualContributionIncrease)
                        ? value.annualContributionIncrease
                        : ""
                    }
                    max={20}
                    step={0.1}
                    error={Boolean(errors.annualContributionIncrease)}
                    onValueChange={(next) =>
                      updatePercentage("annualContributionIncrease", next)
                    }
                  />
                )}
              </FormField>
              <FormField
                id={fieldId("extraContributionAge")}
                label="Start extra saving at age"
                hint="Only needed if you plan to add another monthly amount later."
                error={errors.extraContributionAge}
                optional
              >
                {(id, describedBy) => (
                  <NumberInput
                    id={id}
                    aria-describedby={describedBy}
                    value={value.extraContributionAge ?? ""}
                    min={value.currentAge}
                    max={Math.max(value.currentAge, value.retirementAge - 1)}
                    suffix="years"
                    error={Boolean(errors.extraContributionAge)}
                    onValueChange={(next) => updateOptional("extraContributionAge", next)}
                  />
                )}
              </FormField>
              <FormField
                id={fieldId("extraMonthlyContribution")}
                label="Extra monthly contribution"
                hint="The additional monthly amount from the age above."
                error={errors.extraMonthlyContribution}
                optional
              >
                {(id, describedBy) => (
                  <CurrencyInput
                    id={id}
                    aria-describedby={describedBy}
                    value={value.extraMonthlyContribution ?? ""}
                    step={10}
                    error={Boolean(errors.extraMonthlyContribution)}
                    onValueChange={(next) =>
                      updateOptional("extraMonthlyContribution", next)
                    }
                  />
                )}
              </FormField>
            </>
          )}
        </AdvancedCard>

        <AdvancedCard
          title="Retirement strategy"
          summary="Withdrawal approach, spending chapters, tax-free cash and State Pension details"
          icon={AppIcons.settings}
          open={openAdvanced === "strategy"}
          ariaLabel="Retirement strategy"
          onToggle={() => toggleAdvanced("strategy")}
        >
          <p className="advanced-plan-note">
            These settings are optional refinements. Use them when you want more
            control over how retirement income is modelled.
          </p>
          <label className="retirement-goals-checkbox">
            <input
              type="checkbox"
              checked={usesMaximumTaxFreeCash}
              onChange={(event) => setMaximumTaxFreeCash(event.target.checked)}
            />
            <span>Take the maximum illustrated 25% tax-free cash at retirement</span>
          </label>
          <p className="advanced-plan-note">
            {usesMaximumTaxFreeCash
              ? "The amount automatically follows the projected pension at retirement, subject to the modelled lump-sum allowance. Switch this off before entering a custom amount below."
              : "Maximum tax-free cash is switched off. Use the Tax-free cash section below to choose no cash or a custom amount."}
          </p>
          <ScenarioDrawdownFields
            idPrefix={fieldId("drawdown")}
            retirementAge={value.retirementAge}
            value={drawdown}
            onChange={updateDrawdown}
          />
        </AdvancedCard>
      </section>
    </section>
  );
}

function EssentialCard({
  title,
  summary,
  icon,
  complete,
  open,
  ariaLabel,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  icon: (typeof AppIcons)[keyof typeof AppIcons];
  complete: boolean;
  open: boolean;
  ariaLabel: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className={`essential-plan-card${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="essential-plan-card-toggle"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="essential-plan-card-icon" aria-hidden="true">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="essential-plan-card-copy">
          <strong>{title}</strong>
          <small>{summary}</small>
        </span>
        <span
          className={`essential-plan-card-state${complete ? " is-complete" : ""}`}
        >
          {complete ? "Complete" : "Review"}
        </span>
        <span aria-hidden="true" className="essential-plan-card-chevron">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="essential-plan-card-fields">{children}</div>}
    </article>
  );
}

function AdvancedCard({
  title,
  summary,
  icon,
  open,
  ariaLabel,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  icon: (typeof AppIcons)[keyof typeof AppIcons];
  open: boolean;
  ariaLabel: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className={`advanced-plan-card${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="advanced-plan-card-toggle"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="essential-plan-card-icon" aria-hidden="true">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="essential-plan-card-copy">
          <strong>{title}</strong>
          <small>{summary}</small>
        </span>
        <span aria-hidden="true" className="essential-plan-card-chevron">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="essential-plan-card-fields">{children}</div>}
    </article>
  );
}

function createFutureSavingSummary(value: PensionInputs): string {
  const summaries: string[] = [];
  if (value.annualContributionIncrease > 0) {
    summaries.push(`${formatPercentage(value.annualContributionIncrease)} annual increase`);
  }
  if (value.extraMonthlyContribution && value.extraMonthlyContribution > 0) {
    summaries.push(
      `${formatCurrency(value.extraMonthlyContribution)}/month extra from age ${value.extraContributionAge ?? "—"}`,
    );
  }
  return summaries.length > 0 ? summaries.join(" · ") : "Future changes enabled";
}

function safeNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : "—";
}
