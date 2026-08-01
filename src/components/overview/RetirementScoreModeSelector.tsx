export type RetirementScoreMode = "income-coverage" | "weighted";

interface RetirementScoreModeSelectorProps {
  value: RetirementScoreMode;
  onChange: (value: RetirementScoreMode) => void;
}

export function RetirementScoreModeSelector({
  value,
  onChange,
}: RetirementScoreModeSelectorProps) {
  return (
    <div
      className="retirement-score-mode-selector"
      role="radiogroup"
      aria-label="Retirement score view"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "income-coverage"}
        className={value === "income-coverage" ? "active" : undefined}
        onClick={() => onChange("income-coverage")}
      >
        Income coverage
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "weighted"}
        className={value === "weighted" ? "active" : undefined}
        onClick={() => onChange("weighted")}
      >
        Weighted score
      </button>
    </div>
  );
}
