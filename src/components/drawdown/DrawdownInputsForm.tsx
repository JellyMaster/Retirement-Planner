import type { ChangeEvent, ReactNode } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownInputErrors } from "../../engine/drawdown/validators/DrawdownInputsValidator";

interface DrawdownInputsFormProps {
  idPrefix?: string;
  value: DrawdownInputs;
  errors: DrawdownInputErrors;
  onChange: <K extends keyof DrawdownInputs>(
    field: K,
    value: DrawdownInputs[K],
  ) => void;
  onReset: () => void;
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function DrawdownInputsForm({
  idPrefix = "drawdown",
  value,
  errors,
  onChange,
  onReset,
}: DrawdownInputsFormProps) {
  const createFieldId = (field: string) => `${idPrefix}-${field}`;

  function updateNumber<K extends keyof DrawdownInputs>(
    field: K,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onChange(field, event.target.valueAsNumber as DrawdownInputs[K]);
  }

  function updatePercentage<K extends keyof DrawdownInputs>(
    field: K,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const percentage = event.target.valueAsNumber;
    const normalizedDecimal = Number((percentage / 100).toFixed(8));
    onChange(field, normalizedDecimal as DrawdownInputs[K]);
  }

  function displayPercentage(decimalValue: number, decimalPlaces = 4) {
    return Number((decimalValue * 100).toFixed(decimalPlaces));
  }

  return (
    <section className="panel drawdown-editor-panel">
      <div className="drawdown-editor-heading">
        <div className="drawdown-editor-title-group">
          <span className="drawdown-editor-title-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.money} /></span>
          <div>
            <p className="drawdown-editor-kicker">Drawdown settings</p>
            <h2>Retirement income</h2>
            <p>Tell us how you would like to take income in retirement.</p>
          </div>
        </div>

        <button type="button" className="reset-button drawdown-editor-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="input-sections">
        <FormSection
          step="1"
          icon={AppIcons.clock}
          title="Retirement period"
          description="Choose when drawdown begins and how long the plan should run."
        >
          <NumberField
            id={createFieldId("startingBalance")}
            label="Starting pension balance"
            prefix="£"
            value={value.startingBalance}
            min={0}
            step={1_000}
            error={errors.startingBalance}
            onChange={(event) => updateNumber("startingBalance", event)}
          />

          <NumberField
            id={createFieldId("retirementAge")}
            label="Retirement age"
            value={value.retirementAge}
            min={18}
            max={100}
            step={1}
            suffix="years"
            error={errors.retirementAge}
            onChange={(event) => updateNumber("retirementAge", event)}
          />

          <NumberField
            id={createFieldId("endAge")}
            label="Planning age"
            value={value.endAge}
            min={19}
            max={120}
            step={1}
            suffix="years"
            error={errors.endAge}
            onChange={(event) => updateNumber("endAge", event)}
          />

          <NumberField
            id={createFieldId("taxFreeCash")}
            label="Tax-free cash at retirement"
            prefix="£"
            value={value.taxFreeCash}
            min={0}
            step={1_000}
            error={errors.taxFreeCash}
            onChange={(event) => updateNumber("taxFreeCash", event)}
          />
        </FormSection>

        <FormSection
          step="2"
          icon={AppIcons.money}
          title="Retirement income"
          description="Choose how you want the planner to calculate your retirement income."
        >
          <fieldset className="withdrawal-strategy-selector form-field form-field-wide">
            <legend>
              <span className="strategy-question">How would you like to draw income?</span>
              <span className="strategy-question-help">Choose the approach that best matches your retirement plan.</span>
            </legend>
            <div className="withdrawal-strategy-grid" role="radiogroup" aria-label="How would you like to draw income?">
              <button
                type="button"
                role="radio"
                aria-checked={value.withdrawalStrategy === "target-income"}
                className={`withdrawal-strategy-card${value.withdrawalStrategy === "target-income" ? " withdrawal-strategy-card-active" : ""}`}
                onClick={() => onChange("withdrawalStrategy", "target-income")}
              >
                <span className="withdrawal-strategy-card-topline">
                  <span className="withdrawal-strategy-radio" aria-hidden="true" />
                  {value.withdrawalStrategy === "target-income" && (
                    <span className="withdrawal-strategy-selected"><FontAwesomeIcon icon={AppIcons.check} /> Selected</span>
                  )}
                </span>
                <span className="withdrawal-strategy-card-heading">
                  <span className="withdrawal-strategy-icon withdrawal-strategy-icon-target" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.goals} /></span>
                  <span className="withdrawal-strategy-title">I want a specific income each year</span>
                </span>
                <span className="withdrawal-strategy-description">
                  Set the annual amount you would like to receive. The planner calculates the pension withdrawal needed.
                </span>
                <span className="withdrawal-strategy-benefit">
                  <span className="withdrawal-strategy-benefit-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.check} /></span>
                  <span><strong>Stable, planned spending</strong><small>Predictable income each year</small></span>
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={value.withdrawalStrategy === "percentage"}
                className={`withdrawal-strategy-card${value.withdrawalStrategy === "percentage" ? " withdrawal-strategy-card-active" : ""}`}
                onClick={() => onChange("withdrawalStrategy", "percentage")}
              >
                <span className="withdrawal-strategy-card-topline">
                  <span className="withdrawal-strategy-radio" aria-hidden="true" />
                  {value.withdrawalStrategy === "percentage" && (
                    <span className="withdrawal-strategy-selected"><FontAwesomeIcon icon={AppIcons.check} /> Selected</span>
                  )}
                </span>
                <span className="withdrawal-strategy-card-heading">
                  <span className="withdrawal-strategy-icon withdrawal-strategy-icon-percentage" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.fees} /></span>
                  <span className="withdrawal-strategy-title">I want to withdraw a percentage of my pension</span>
                </span>
                <span className="withdrawal-strategy-description">
                  Choose a rate such as 4%. Your income changes each year with the opening pension balance.
                </span>
                <span className="withdrawal-strategy-benefit">
                  <span className="withdrawal-strategy-benefit-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.growth} /></span>
                  <span><strong>Flexible, balance-linked income</strong><small>Income rises and falls with your pot</small></span>
                </span>
              </button>
            </div>
          </fieldset>

          {value.withdrawalStrategy === "target-income" ? (
            <>
              <div className="form-field form-field-wide">
                <span className="form-field-label">Income target basis</span>
                <div className="income-target-toggle" role="group" aria-label="Income target basis">
                  <button
                    type="button"
                    className={`income-target-option${value.incomeTargetMode === "net" ? " income-target-option-active" : ""}`}
                    aria-pressed={value.incomeTargetMode === "net"}
                    onClick={() => onChange("incomeTargetMode", "net")}
                  >
                    Net spendable income
                  </button>
                  <button
                    type="button"
                    className={`income-target-option${value.incomeTargetMode === "gross" ? " income-target-option-active" : ""}`}
                    aria-pressed={value.incomeTargetMode === "gross"}
                    onClick={() => onChange("incomeTargetMode", "gross")}
                  >
                    Gross income
                  </button>
                </div>
                <p className="field-help">
                  {value.incomeTargetMode === "net"
                    ? "The planner increases the taxable withdrawal enough to meet this amount after tax."
                    : "Income tax is deducted from this amount, so spendable income will be lower."}
                </p>
              </div>

              <NumberField
                id={createFieldId("desiredAnnualIncome")}
                label={value.incomeTargetMode === "net" ? "Desired net annual income" : "Desired gross annual income"}
                prefix="£"
                value={value.desiredAnnualIncome}
                min={0}
                step={500}
                error={errors.desiredAnnualIncome}
                onChange={(event) => updateNumber("desiredAnnualIncome", event)}
              />
            </>
          ) : (
            <>
              <NumberField
                id={createFieldId("withdrawalRate")}
                label="Annual withdrawal rate"
                value={displayPercentage(value.withdrawalRate, 2)}
                min={0}
                max={100}
                step={0.1}
                suffix="%"
                error={errors.withdrawalRate}
                onChange={(event) => updatePercentage("withdrawalRate", event)}
              />

              <div className="withdrawal-rate-preview form-field-wide">
                <p>Estimated first-year pension withdrawal</p>
                <strong>
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
                    Math.max(0, value.startingBalance - value.taxFreeCash) * value.withdrawalRate,
                  )}
                </strong>
                <span>
                  Approximately {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
                    (Math.max(0, value.startingBalance - value.taxFreeCash) * value.withdrawalRate) / 12,
                  )} per month before tax, plus any State Pension.
                </span>
              </div>

              <div className="withdrawal-rate-guide form-field-wide" aria-label="Common withdrawal rates">
                {[0.03, 0.035, 0.04, 0.045, 0.05].map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    className={Math.abs(value.withdrawalRate - rate) < 0.00001 ? "withdrawal-rate-chip withdrawal-rate-chip-active" : "withdrawal-rate-chip"}
                    onClick={() => onChange("withdrawalRate", rate)}
                  >
                    <strong>{(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 1)}%</strong>
                    <span>{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Math.max(0, value.startingBalance - value.taxFreeCash) * rate)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <NumberField
            id={createFieldId("annualStatePension")}
            label="Annual State Pension"
            prefix="£"
            value={value.annualStatePension}
            min={0}
            step={100}
            error={errors.annualStatePension}
            onChange={(event) => updateNumber("annualStatePension", event)}
          />

          <NumberField
            id={createFieldId("statePensionAge")}
            label="State Pension age"
            value={value.statePensionAge}
            min={18}
            max={120}
            step={1}
            suffix="years"
            error={errors.statePensionAge}
            onChange={(event) => updateNumber("statePensionAge", event)}
          />
        </FormSection>

        <FormSection
          step="3"
          icon={AppIcons.growth}
          title="Investment assumptions"
          description="These assumptions drive your retirement projections."
        >
          <NumberField
            id={createFieldId("annualReturn")}
            label="Expected annual return"
            value={displayPercentage(value.annualReturn, 2)}
            min={-99.9}
            max={100}
            step={0.1}
            suffix="%"
            error={errors.annualReturn}
            onChange={(event) => updatePercentage("annualReturn", event)}
          />

          <NumberField
            id={createFieldId("inflationRate")}
            label="Expected inflation"
            value={displayPercentage(value.inflationRate, 2)}
            min={-99.9}
            max={100}
            step={0.1}
            suffix="%"
            error={errors.inflationRate}
            onChange={(event) => updatePercentage("inflationRate", event)}
          />

          <NumberField
            id={createFieldId("annualFee")}
            label="Annual pension fee"
            value={displayPercentage(value.annualFee, 4)}
            min={0}
            max={10}
            step={0.01}
            suffix="%"
            error={errors.annualFee}
            onChange={(event) => updatePercentage("annualFee", event)}
          />

          <div className="drawdown-editor-notice form-field-wide">
            <span className="drawdown-editor-notice-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.information} /></span>
            <span><strong>Important</strong>These settings can be changed at any time. Your results update automatically.</span>
          </div>
        </FormSection>
      </div>
    </section>
  );
}

function FormSection({
  step,
  icon,
  title,
  description,
  children,
}: {
  step: string;
  icon: IconDefinition;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section drawdown-editor-section">
      <div className="form-section-heading drawdown-editor-section-heading">
        <span className="drawdown-editor-step" aria-hidden="true">{step}</span>
        <span className="drawdown-editor-section-icon" aria-hidden="true"><FontAwesomeIcon icon={icon} /></span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  prefix,
  suffix,
  error,
  onChange,
}: NumberFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrapper${error ? " input-wrapper-error" : ""}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={onChange}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
