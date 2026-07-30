import type { ChangeEvent, ReactNode } from "react";

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
    onChange(field, (event.target.valueAsNumber / 100) as DrawdownInputs[K]);
  }

  return (
    <section className="panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <h2>Drawdown assumptions</h2>
          <p>
            Enter the pension balance, retirement income and economic assumptions
            used in the projection.
          </p>
        </div>

        <button type="button" className="reset-button" onClick={onReset}>
          Reset defaults
        </button>
      </div>

      <div className="input-sections">
        <FormSection
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
          title="Retirement income"
          description="Choose whether the annual target is before or after income tax."
        >
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
          title="Investment assumptions"
          description="Returns, inflation and fees are entered as annual percentages."
        >
          <NumberField
            id={createFieldId("annualReturn")}
            label="Expected annual return"
            value={value.annualReturn * 100}
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
            value={value.inflationRate * 100}
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
            value={value.annualFee * 100}
            min={0}
            max={10}
            step={0.01}
            suffix="%"
            error={errors.annualFee}
            onChange={(event) => updatePercentage("annualFee", event)}
          />
        </FormSection>
      </div>
    </section>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section">
      <div className="form-section-heading">
        <h3>{title}</h3>
        <p>{description}</p>
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
