import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  createDefaultScenarioDrawdownPreferences,
  type Scenario,
  type ScenarioDrawdownPreferences,
} from "../../domain/scenarios";
import type { PensionInputs } from "../../engine/models/PensionInputs";
import { AppIcons } from "../../icons";
import {
  hasPensionInputErrors,
  validatePensionInputs,
} from "../../validation/validatePensionInputs";
import {
  CurrencyInput,
  FormField,
  NumberInput,
  PercentageInput,
} from "../forms";
import { ScenarioDrawdownFields } from "./ScenarioDrawdownFields";
import { ScenarioSpendingPhaseFields } from "./ScenarioSpendingPhaseFields";

interface ScenarioEditModalProps {
  scenario: Scenario;
  onClose: () => void;
  onSave: (
    inputs: PensionInputs,
    drawdown: ScenarioDrawdownPreferences,
  ) => void;
}

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

function hasDrawdownErrors(
  value: ScenarioDrawdownPreferences,
  retirementAge: number,
): boolean {
  const invalidPhases = value.spendingPhases?.some(
    (phase, index, phases) =>
      !Number.isInteger(phase.startAge) ||
      phase.startAge < retirementAge ||
      phase.startAge >= value.planningAge ||
      !Number.isFinite(phase.annualIncome) ||
      phase.annualIncome < 0 ||
      (index > 0 && phase.startAge <= phases[index - 1].startAge),
  );

  return (
    !Number.isFinite(value.planningAge) ||
    value.planningAge <= retirementAge ||
    value.planningAge > 120 ||
    !Number.isFinite(value.withdrawalRate) ||
    value.withdrawalRate < 0 ||
    value.withdrawalRate > 1 ||
    !Number.isFinite(value.desiredAnnualIncome) ||
    value.desiredAnnualIncome < 0 ||
    !Number.isFinite(value.taxFreeCash) ||
    value.taxFreeCash < 0 ||
    invalidPhases === true
  );
}

export function ScenarioEditModal({
  scenario,
  onClose,
  onSave,
}: ScenarioEditModalProps) {
  const [inputs, setInputs] = useState<PensionInputs>(() => ({
    ...scenario.inputs,
  }));
  const [drawdown, setDrawdown] = useState<ScenarioDrawdownPreferences>(() => ({
    ...(scenario.drawdown ?? createDefaultScenarioDrawdownPreferences()),
  }));
  const errors = useMemo(() => validatePensionInputs(inputs), [inputs]);
  const hasErrors = useMemo(
    () =>
      hasPensionInputErrors(errors) ||
      hasDrawdownErrors(drawdown, inputs.retirementAge),
    [drawdown, errors, inputs.retirementAge],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function updateRequired(field: RequiredNumberField, value: number | undefined) {
    setInputs((current) => ({
      ...current,
      [field]: value ?? Number.NaN,
    }));
  }

  function updateOptional(field: OptionalNumberField, value: number | undefined) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  function updatePercentage(field: PercentageField, value: number | undefined) {
    setInputs((current) => ({
      ...current,
      [field]: value ?? Number.NaN,
    }));
  }

  function fieldId(name: string) {
    return `scenario-edit-${scenario.id}-${name}`;
  }

  return (
    <div
      className="scenario-edit-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="scenario-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scenario-edit-title"
      >
        <header className="scenario-edit-header">
          <div>
            <p className="planner-eyebrow">Edit plan</p>
            <h2 id="scenario-edit-title">{scenario.name}</h2>
            <p>
              Update accumulation assumptions and how this plan will provide
              retirement income. Changes are saved together.
            </p>
          </div>
          <button
            type="button"
            className="scenario-edit-close"
            aria-label="Close plan editor"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={AppIcons.minus} aria-hidden="true" />
          </button>
        </header>

        <div className="scenario-edit-body">
          <fieldset className="scenario-edit-section">
            <legend>Timeline and pension</legend>
            <div className="scenario-edit-grid">
              <FormField id={fieldId("currentAge")} label="Current age" error={errors.currentAge}>
                {(id, describedBy) => (
                  <NumberInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.currentAge) ? inputs.currentAge : ""} min={18} max={100} suffix="years" error={Boolean(errors.currentAge)} onValueChange={(value) => updateRequired("currentAge", value)} />
                )}
              </FormField>
              <FormField id={fieldId("retirementAge")} label="Retirement age" error={errors.retirementAge}>
                {(id, describedBy) => (
                  <NumberInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.retirementAge) ? inputs.retirementAge : ""} min={18} max={100} suffix="years" error={Boolean(errors.retirementAge)} onValueChange={(value) => updateRequired("retirementAge", value)} />
                )}
              </FormField>
              <FormField id={fieldId("currentPot")} label="Current pension pot" error={errors.currentPot}>
                {(id, describedBy) => (
                  <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.currentPot) ? inputs.currentPot : ""} step={100} error={Boolean(errors.currentPot)} onValueChange={(value) => updateRequired("currentPot", value)} />
                )}
              </FormField>
              <FormField id={fieldId("employeeContribution")} label="Your monthly contribution" error={errors.monthlyEmployeeContribution}>
                {(id, describedBy) => (
                  <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.monthlyEmployeeContribution) ? inputs.monthlyEmployeeContribution : ""} step={10} error={Boolean(errors.monthlyEmployeeContribution)} onValueChange={(value) => updateRequired("monthlyEmployeeContribution", value)} />
                )}
              </FormField>
              <FormField id={fieldId("employerContribution")} label="Employer monthly contribution" error={errors.monthlyEmployerContribution}>
                {(id, describedBy) => (
                  <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.monthlyEmployerContribution) ? inputs.monthlyEmployerContribution : ""} step={10} error={Boolean(errors.monthlyEmployerContribution)} onValueChange={(value) => updateRequired("monthlyEmployerContribution", value)} />
                )}
              </FormField>
            </div>
          </fieldset>

          <fieldset className="scenario-edit-section">
            <legend>Assumptions</legend>
            <div className="scenario-edit-grid">
              <FormField id={fieldId("annualReturn")} label="Expected annual return" error={errors.annualReturn}>
                {(id, describedBy) => (
                  <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.annualReturn) ? inputs.annualReturn : ""} max={20} step={0.1} error={Boolean(errors.annualReturn)} onValueChange={(value) => updatePercentage("annualReturn", value)} />
                )}
              </FormField>
              <FormField id={fieldId("annualFee")} label="Annual pension fee" error={errors.annualFee}>
                {(id, describedBy) => (
                  <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.annualFee) ? inputs.annualFee : ""} max={5} step={0.01} decimalPlaces={4} error={Boolean(errors.annualFee)} onValueChange={(value) => updatePercentage("annualFee", value)} />
                )}
              </FormField>
              <FormField id={fieldId("inflation")} label="Expected inflation" error={errors.inflation}>
                {(id, describedBy) => (
                  <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.inflation) ? inputs.inflation : ""} max={15} step={0.1} error={Boolean(errors.inflation)} onValueChange={(value) => updatePercentage("inflation", value)} />
                )}
              </FormField>
              <FormField id={fieldId("contributionIncrease")} label="Annual contribution increase" error={errors.annualContributionIncrease}>
                {(id, describedBy) => (
                  <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(inputs.annualContributionIncrease) ? inputs.annualContributionIncrease : ""} max={20} step={0.1} error={Boolean(errors.annualContributionIncrease)} onValueChange={(value) => updatePercentage("annualContributionIncrease", value)} />
                )}
              </FormField>
            </div>
          </fieldset>

          <fieldset className="scenario-edit-section">
            <legend>Future contribution change</legend>
            <div className="scenario-edit-grid">
              <FormField id={fieldId("extraContributionAge")} label="Extra contribution age" error={errors.extraContributionAge} optional>
                {(id, describedBy) => (
                  <NumberInput id={id} aria-describedby={describedBy} value={inputs.extraContributionAge ?? ""} min={inputs.currentAge} max={Math.max(inputs.currentAge, inputs.retirementAge - 1)} suffix="years" error={Boolean(errors.extraContributionAge)} onValueChange={(value) => updateOptional("extraContributionAge", value)} />
                )}
              </FormField>
              <FormField id={fieldId("extraMonthlyContribution")} label="Extra monthly contribution" error={errors.extraMonthlyContribution} optional>
                {(id, describedBy) => (
                  <CurrencyInput id={id} aria-describedby={describedBy} value={inputs.extraMonthlyContribution ?? ""} step={10} error={Boolean(errors.extraMonthlyContribution)} onValueChange={(value) => updateOptional("extraMonthlyContribution", value)} />
                )}
              </FormField>
            </div>
          </fieldset>

          <ScenarioDrawdownFields
            idPrefix={fieldId("drawdown")}
            retirementAge={inputs.retirementAge}
            value={drawdown}
            onChange={setDrawdown}
          />

          {drawdown.withdrawalStrategy === "target-income" && (
            <ScenarioSpendingPhaseFields
              idPrefix={fieldId("spending-phases")}
              retirementAge={inputs.retirementAge}
              value={drawdown}
              onChange={setDrawdown}
            />
          )}
        </div>

        <footer className="scenario-edit-actions">
          <span role="status">
            {hasErrors
              ? "Correct the highlighted fields before saving."
              : "Plan is ready to save."}
          </span>
          <div>
            <button type="button" className="ui-button ui-button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-button ui-button-primary"
              disabled={hasErrors}
              onClick={() => onSave({ ...inputs }, { ...drawdown })}
            >
              Save changes
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
