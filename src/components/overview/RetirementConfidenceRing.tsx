interface RetirementConfidenceRingProps {
  score: number;
  label: string;
}

export function RetirementConfidenceRing({
  score,
  label,
}: RetirementConfidenceRingProps) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div
      className="retirement-overview-ring"
      role="img"
      aria-label={`Retirement readiness score ${safeScore} out of 100, ${label}`}
    >
      <svg viewBox="0 0 124 124" aria-hidden="true">
        <circle className="retirement-overview-ring-track" cx="62" cy="62" r={radius} />
        <circle
          className="retirement-overview-ring-value"
          cx="62"
          cy="62"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="retirement-overview-ring-copy">
        <strong>{safeScore}</strong>
        <span>/100</span>
        <small>{label}</small>
      </div>
    </div>
  );
}
