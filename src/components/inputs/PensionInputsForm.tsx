import type {
  ChangeEvent,
  ReactNode,
} from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { PensionInputErrors } from "../../validation/validatePensionInputs";

interface PensionInputsFormProps {
    idPrefix?: string;
  value: PensionInputs;
  errors: PensionInputErrors;

  onChange: (inputs: PensionInputs) => void;
  onReset: () => void;
}

type RequiredNumericField =
  | "currentAge"
  | "retirementAge"
  | "currentPot"
  | "monthlyEmployeeContribution"
  | "monthlyEmployerContribution";

type OptionalNumericField =
  | "extraContributionAge"
  | "extraMonthlyContribution";

export function PensionInputsForm({
  idPrefix = "pension",
  value,
  errors,
  onChange,
  onReset,
}: PensionInputsFormProps) {
 function createFieldId(
    fieldName: string
  ): string {
    return `${idPrefix}-${fieldName}`;
  }

  function updateRequiredNumber(
    field: RequiredNumericField,
    event: ChangeEvent<HTMLInputElement>
  ) {
    onChange({
      ...value,
      [field]: event.target.valueAsNumber,
    });
  }

  function updateOptionalNumber(
    field: OptionalNumericField,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const rawValue = event.target.value;

    onChange({
      ...value,
      [field]:
        rawValue === ""
          ? undefined
          : Number(rawValue),
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <h2>Your details</h2>

          <p>
            Enter your current pension information and
            planning assumptions.
          </p>
        </div>

        <button
          type="button"
          className="reset-button"
          onClick={onReset}
        >
          Reset defaults
        </button>
      </div>

      <div className="input-sections">
        <FormSection
          title="Personal details"
          description="Your current age and planned retirement age."
        >
          <NumberField
            id={createFieldId("currentAge")}
            label="Current age"
            value={value.currentAge}
            min={18}
            max={100}
            error={errors.currentAge}
            onChange={(event) =>
              updateRequiredNumber(
                "currentAge",
                event
              )
            }
          />

          <NumberField
            id={createFieldId("retirementAge")}
            label="Retirement age"
            value={value.retirementAge}
            min={18}
            max={100}
            error={errors.retirementAge}
            onChange={(event) =>
              updateRequiredNumber(
                "retirementAge",
                event
              )
            }
          />
        </FormSection>

        <FormSection
          title="Current pension"
          description="Your pension balance and regular monthly contributions."
        >
          <NumberField
            id={createFieldId("currentPot")}
            label="Current pension pot"
            prefix="£"
            value={value.currentPot}
            min={0}
            step={100}
            error={errors.currentPot}
            onChange={(event) =>
              updateRequiredNumber(
                "currentPot",
                event
              )
            }
          />

          <NumberField
           id={createFieldId(
  "employeeContribution"
)}
            label="Your monthly contribution"
            prefix="£"
            value={
              value.monthlyEmployeeContribution
            }
            min={0}
            step={10}
            error={
              errors.monthlyEmployeeContribution
            }
            onChange={(event) =>
              updateRequiredNumber(
                "monthlyEmployeeContribution",
                event
              )
            }
          />

          <NumberField
           id={createFieldId(
  "employerContribution"
)}
            label="Employer monthly contribution"
            prefix="£"
            value={
              value.monthlyEmployerContribution
            }
            min={0}
            step={10}
            error={
              errors.monthlyEmployerContribution
            }
            onChange={(event) =>
              updateRequiredNumber(
                "monthlyEmployerContribution",
                event
              )
            }
          />
        </FormSection>

        <FormSection
          title="Investment assumptions"
          description="Expected return, pension fees and inflation."
        >
          <PercentageField
            id={createFieldId("annualReturn")}
            label="Expected annual return"
            value={value.annualReturn}
            max={20}
            error={errors.annualReturn}
            onChange={(annualReturn) =>
              onChange({
                ...value,
                annualReturn,
              })
            }
          />

          <PercentageField
            id={createFieldId("annualFee")}
            label="Annual pension fee"
            value={value.annualFee}
            max={5}
            step={0.01}
            error={errors.annualFee}
            onChange={(annualFee) =>
              onChange({
                ...value,
                annualFee,
              })
            }
          />

          <PercentageField
           id={createFieldId("inflation")}
            label="Expected inflation"
            value={value.inflation}
            max={15}
            error={errors.inflation}
            onChange={(inflation) =>
              onChange({
                ...value,
                inflation,
              })
            }
          />
        </FormSection>

        <FormSection
          title="Contribution changes"
          description="Model annual increases or additional monthly payments."
        >
          <PercentageField
          id={createFieldId(
  "contributionIncrease"
)}
            label="Annual contribution increase"
            value={
              value.annualContributionIncrease
            }
            max={20}
            error={
              errors.annualContributionIncrease
            }
            onChange={(
              annualContributionIncrease
            ) =>
              onChange({
                ...value,
                annualContributionIncrease,
              })
            }
          />

          <NumberField
            id={createFieldId(
  "extraContributionAge"
)}
            label="Extra contribution starts at age"
            value={
              value.extraContributionAge ?? ""
            }
            min={value.currentAge}
            max={value.retirementAge}
            error={errors.extraContributionAge}
            onChange={(event) =>
              updateOptionalNumber(
                "extraContributionAge",
                event
              )
            }
          />

          <NumberField
           id={createFieldId(
  "extraMonthlyContribution"
)}
            label="Extra monthly contribution"
            prefix="£"
            value={
              value.extraMonthlyContribution ?? ""
            }
            min={0}
            step={10}
            error={
              errors.extraMonthlyContribution
            }
            onChange={(event) =>
              updateOptionalNumber(
                "extraMonthlyContribution",
                event
              )
            }
          />
        </FormSection>
      </div>
    </section>
  );
}

interface FormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="form-section">
      <div className="form-section-heading">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <div className="form-grid">
        {children}
      </div>
    </section>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;

  value: number | "";

  prefix?: string;
  error?: string;

  min?: number;
  max?: number;
  step?: number;

  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}

function NumberField({
  id,
  label,
  value,
  prefix,
  error,
  min,
  max,
  step = 1,
  onChange,
}: NumberFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <div
        className={
          error
            ? "input-wrapper input-wrapper-error"
            : "input-wrapper"
        }
      >
        {prefix && (
          <span
            className="input-prefix"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : undefined
          }
          onChange={onChange}
        />
      </div>

      {error && (
        <p
          id={errorId}
          className="field-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface PercentageFieldProps {
  id: string;
  label: string;

  value: number;

  error?: string;

  min?: number;
  max?: number;
  step?: number;

  onChange: (value: number) => void;
}

function PercentageField({
  id,
  label,
  value,
  error,
  min = 0,
  max,
  step = 0.1,
  onChange,
}: PercentageFieldProps) {
  const errorId = `${id}-error`;

  const displayedValue = Number(
    (value * 100).toFixed(4)
  );

  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const percentage =
      event.target.valueAsNumber;

    if (Number.isNaN(percentage)) {
      return;
    }

    const decimalValue = Number(
      (percentage / 100).toFixed(10)
    );

    onChange(decimalValue);
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <div
        className={
          error
            ? "input-wrapper input-wrapper-error"
            : "input-wrapper"
        }
      >
        <input
          id={id}
          type="number"
          value={displayedValue}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : undefined
          }
          onChange={handleChange}
        />

        <span
          className="input-suffix"
          aria-hidden="true"
        >
          %
        </span>
      </div>

      {error && (
        <p
          id={errorId}
          className="field-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}