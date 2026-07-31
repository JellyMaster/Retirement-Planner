import type { ChangeEvent, InputHTMLAttributes } from "react";

export interface PercentageInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  /** Decimal value used by the engine: 0.05 represents 5%. */
  value: number | "";
  onValueChange: (value: number | undefined) => void;
  error?: boolean;
  decimalPlaces?: number;
}

export function PercentageInput({
  value,
  onValueChange,
  error = false,
  decimalPlaces = 4,
  min = 0,
  step = 0.1,
  inputMode = "decimal",
  className,
  ...inputProps
}: PercentageInputProps) {
  const displayedValue =
    value === "" ? "" : Number((value * 100).toFixed(decimalPlaces));

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value === "") {
      onValueChange(undefined);
      return;
    }

    const percentage = event.target.valueAsNumber;
    if (!Number.isFinite(percentage)) {
      return;
    }

    onValueChange(Number((percentage / 100).toFixed(10)));
  }

  return (
    <div
      className={[
        "input-wrapper",
        error && "input-wrapper-error",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        {...inputProps}
        type="number"
        value={displayedValue}
        min={min}
        step={step}
        inputMode={inputMode}
        aria-invalid={error || undefined}
        onChange={handleChange}
      />

      <span className="input-suffix" aria-hidden="true">
        %
      </span>
    </div>
  );
}
