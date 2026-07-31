import { useId, type InputHTMLAttributes } from "react";

export interface ToggleSwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "onChange"
  > {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  className,
  id,
  ...inputProps
}: ToggleSwitchProps) {
  const generatedId = useId();
  const inputId = id ?? `toggle-${generatedId.replace(/:/g, "")}`;

  return (
    <label
      className={["toggle-switch-field", className].filter(Boolean).join(" ")}
      htmlFor={inputId}
    >
      <span className="toggle-switch-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>

      <span className="toggle-switch-control">
        <input
          {...inputProps}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span className="toggle-switch-track" aria-hidden="true">
          <span className="toggle-switch-thumb" />
        </span>
      </span>
    </label>
  );
}
