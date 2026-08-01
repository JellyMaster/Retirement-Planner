import { ProgressRing } from "../ui";

interface RetirementConfidenceRingProps {
  score: number;
  label: string;
}

export function RetirementConfidenceRing({
  score,
  label,
}: RetirementConfidenceRingProps) {
  const tone = score >= 90 ? "success" : score >= 75 ? "warning" : "danger";

  return (
    <ProgressRing
      className="retirement-overview-ring"
      value={score}
      label={label}
      tone={tone}
      size="large"
    />
  );
}
