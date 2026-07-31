import type { InputHTMLAttributes } from "react";

import { NumberInput } from "./NumberInput";

export interface CurrencyInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "prefix"
  > {
  value: number | "";
  onValueChange: (value: number | undefined) => void;
  currencySymbol?: string;
  error?: boolean;
}

export function CurrencyInput({
  value,
  onValueChange,
  currencySymbol = "£",
  error = false,
  step = 1,
  min = 0,
  inputMode = "decimal",
  ...inputProps
}: CurrencyInputProps) {
  return (
    <NumberInput
      {...inputProps}
      value={value}
      min={min}
      step={step}
      inputMode={inputMode}
      prefix={currencySymbol}
      error={error}
      onValueChange={onValueChange}
    />
  );
}
