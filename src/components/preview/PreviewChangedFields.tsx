import type { PensionInputs } from "../../engine/models/PensionInputs";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { VisuallyHidden } from "../ui";

interface PreviewChangedFieldsProps {
  baseline: PensionInputs;
  preview: PensionInputs;
}

interface ChangedField {
  key: keyof PensionInputs;
  label: string;
  format: (value: number | undefined) => string;
}

const currency = (value: number | undefined) =>
  value === undefined ? "Not set" : formatCurrency(value);
const percentage = (value: number | undefined) =>
  value === undefined ? "Not set" : formatPercentage(value);
const number = (value: number | undefined) =>
  value === undefined ? "Not set" : String(value);

const fields: ChangedField[] = [
  { key: "retirementAge", label: "Retirement age", format: number },
  {
    key: "monthlyEmployeeContribution",
    label: "Employee contribution",
    format: currency,
  },
  {
    key: "monthlyEmployerContribution",
    label: "Employer contribution",
    format: currency,
  },
  {
    key: "annualContributionIncrease",
    label: "Contribution increase",
    format: percentage,
  },
  {
    key: "extraContributionAge",
    label: "Extra contribution age",
    format: number,
  },
  {
    key: "extraMonthlyContribution",
    label: "Extra contribution",
    format: currency,
  },
  { key: "annualReturn", label: "Expected return", format: percentage },
  { key: "annualFee", label: "Annual fee", format: percentage },
  { key: "inflation", label: "Inflation", format: percentage },
];

export function PreviewChangedFields({
  baseline,
  preview,
}: PreviewChangedFieldsProps) {
  const changes = fields.filter(
    ({ key }) => baseline[key] !== preview[key],
  );

  if (changes.length === 0) return null;

  return (
    <ul className="plan-preview-changes" aria-label="Previewed plan changes">
      {changes.map(({ key, label, format }) => (
        <li key={key}>
          <span>{label}</span>
          <strong>
            {format(baseline[key])}
            <span aria-hidden="true"> → </span>
            <VisuallyHidden> changes to </VisuallyHidden>
            {format(preview[key])}
          </strong>
        </li>
      ))}
    </ul>
  );
}
