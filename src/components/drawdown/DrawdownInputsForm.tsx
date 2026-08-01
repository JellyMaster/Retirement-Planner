import type { ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownInputErrors } from "../../engine/drawdown/validators/DrawdownInputsValidator";
import { AppIcons } from "../../icons";

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

  function updatePercentage(
    field: "withdrawalRate",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onChange(field, Number((event.target.valueAsNumber / 100).toFixed(8)));
  }

  return (
    <section className="panel drawdown-editor-panel drawdown-editor-panel-compact">
      <div className="drawdown-editor-heading">
        <div className="drawdown-editor-title-group">
          <span className="drawdown-editor-title-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.money} />
          </span>
          <div>
            <p className="drawdown-editor-kicker">Drawdown choices</p>
            <h2>How will you take income?</h2>
            <p>Adjust only the choices that belong to the retirement-income plan.</p>
          </div>
        </div>

        <button
          type="button"
          className="reset-button drawdown-editor-reset"
          onClick={onReset}
        >
          Reset choices
        </button>
      </div>

      <div className="drawdown-choice-fields">
        <fieldset className="withdrawal-strategy-selector form-field form-field-wide">
          <legend>
            <span className="strategy-question">Income approach</span>
            <span className="strategy-question-help">
              Choose a target income or a percentage-based withdrawal.
            </span>
          </legend>

          <div
            className="withdrawal-strategy-grid"
            role="radiogroup"
            aria-label="Income approach"
          >
            <button
              type="button"
              role="radio"
              aria-checked={value.withdrawalStrategy === "target-income"}
              className={`withdrawal-strategy-card${
                value.withdrawalStrategy === "target-income"
                  ? " withdrawal-strategy-card-active"
                  : ""
              }`}
              onClick={() => onChange("withdrawalStrategy", "target-income")}
            >
              <span className="withdrawal-strategy-title">Target annual income</span>
              <span className="withdrawal-strategy-description">
                The planner calculates the pension withdrawal needed to meet your
                chosen income.
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={value.withdrawalStrategy === "percentage"}
              className={`withdrawal-strategy-card${
                value.withdrawalStrategy === "percentage"
                  ? " withdrawal-strategy-card-active"
                  : ""
              }`}
              onClick={() => onChange("withdrawalStrategy", "percentage")}
            >
              <span className="withdrawal-strategy-title">Percentage withdrawal</span>
              <span className="withdrawal-strategy-description">
                Income rises and falls with the pension balance.
              </span>
            </button>
          </div>
        </fieldset>

        {value.withdrawalStrategy === "target-income" ? (
          <>
            <div className="form-field form-field-wide">
              <span className="form-field-label">Income target basis</span>
              <div
                className="income-target-toggle"
                role="group"
                aria-label="Income target basis"
              >
                <button
                  type="button"
                  className={`income-target-option${
                    value.incomeTargetMode === "net"
                      ? " income-target-option-active"
                      : ""
                  }`}
                  aria-pressed={value.incomeTargetMode === "net"}
                  onClick={() => onChange("incomeTargetMode", "net")}
                >
                  Net spendable income
                </button>
                <button
                  type="button"
                  className={`income-target-option${
                    value.incomeTargetMode === "gross"
                      ? " income-target-option-active"
                      : ""
                  }`}
                  aria-pressed={value.incomeTargetMode === "gross"}
                  onClick={() => onChange("incomeTargetMode", "gross")}
                >
                  Gross income
                </button>
              </div>
            </div>

            <NumberField
              id={createFieldId("desiredAnnualIncome")}
              label={
                value.incomeTargetMode === "net"
                  ? "Desired net annual income"
                  : "Desired gross annual income"
              }
              prefix="£"
              value={value.desiredAnnualIncome}
              min={0}
              step={500}
              error={errors.desiredAnnualIncome}
              onChange={(event) => updateNumber("desiredAnnualIncome", event)}
            />
          </>
        ) : (
          <NumberField
            id={createFieldId("withdrawalRate")}
            label="Annual withdrawal rate"
            value={Number((value.withdrawalRate * 100).toFixed(2))}
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            error={errors.withdrawalRate}
            onChange={(event) => updatePercentage("withdrawalRate", event)}
          />
        )}

        <NumberField
          id={createFieldId("taxFreeCash")}
          label="Tax-free cash at retirement"
          prefix="£"
          value={value.taxFreeCash}
          min={0}
          max={value.startingBalance}
          step={1_000}
          error={errors.taxFreeCash}
          onChange={(event) => updateNumber("taxFreeCash", event)}
        />
      </div>
    </section>
  );
}

interface NumberFieldProps {
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
