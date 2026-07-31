import { useId, type ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  children: ReactNode | ((fieldId: string, describedBy?: string) => ReactNode);
  id?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
}

export function FormField({
  label,
  children,
  id,
  hint,
  error,
  optional = false,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `form-field-${generatedId.replace(/:/g, "")}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={["form-field", error && "form-field-invalid", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="form-field-label-row">
        <label htmlFor={fieldId}>{label}</label>
        {optional && <span className="form-field-optional">Optional</span>}
      </div>

      {typeof children === "function"
        ? children(fieldId, describedBy)
        : children}

      {hint && (
        <p id={hintId} className="form-field-hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
