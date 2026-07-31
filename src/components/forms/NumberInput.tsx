import type { ChangeEvent, InputHTMLAttributes } from "react";

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "prefix"
  > {
  value: number | "";
  onValueChange: (value: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  error?: boolean;
}

export function NumberInput({
  value,
  onValueChange,
  prefix,
  suffix,
  error = false,
  className,
  ...inputProps
}: NumberInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    onValueChange(nextValue === "" ? undefined : event.target.valueAsNumber);
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
      {prefix && (
        <span className="input-prefix" aria-hidden="true">
          {prefix}
        </span>
      )}

      <input
        {...inputProps}
        type="number"
        value={value}
        aria-invalid={error || undefined}
        onChange={handleChange}
      />

      {suffix && (
        <span className="input-suffix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  );
}
