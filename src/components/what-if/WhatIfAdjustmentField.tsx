import type { ReactNode } from "react";

interface WhatIfAdjustmentFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  impact?: string;
  tone?: "positive" | "negative" | "neutral";
}

export function WhatIfAdjustmentField({
  label,
  description,
  children,
  impact,
  tone = "neutral",
}: WhatIfAdjustmentFieldProps) {
  return (
    <div className="custom-what-if-field">
      <div className="custom-what-if-field-heading">
        <div>
          <label>{label}</label>
          {description ? <p>{description}</p> : null}
        </div>
        {impact ? (
          <span className={`custom-what-if-field-impact custom-what-if-field-impact-${tone}`}>
            {impact}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
