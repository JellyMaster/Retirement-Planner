import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { RetirementScoreFactor as RetirementScoreFactorModel } from "../../engine/models/RetirementScoreBreakdown";
import { AppIcons } from "../../icons";
import { ProgressBar } from "../ui";

interface RetirementScoreFactorProps {
  factor: RetirementScoreFactorModel;
  showWeight: boolean;
}

function getIcon(tone: RetirementScoreFactorModel["tone"]) {
  if (tone === "strong" || tone === "positive") return AppIcons.success;
  if (tone === "review") return AppIcons.information;
  return AppIcons.warning;
}

function getProgressTone(tone: RetirementScoreFactorModel["tone"]) {
  if (tone === "strong" || tone === "positive") return "success" as const;
  if (tone === "review") return "warning" as const;
  return "danger" as const;
}

export function RetirementScoreFactor({
  factor,
  showWeight,
}: RetirementScoreFactorProps) {
  return (
    <article className={`retirement-score-factor retirement-score-factor-${factor.tone}`}>
      <div className="retirement-score-factor-heading">
        <span className="retirement-score-factor-icon" aria-hidden="true">
          <FontAwesomeIcon icon={getIcon(factor.tone)} />
        </span>
        <div>
          <h3>{factor.label}</h3>
          <p>{factor.summary}</p>
        </div>
        <strong>{factor.score}</strong>
      </div>

      <ProgressBar
        className="retirement-score-factor-progress"
        value={factor.score}
        label={factor.label}
        tone={getProgressTone(factor.tone)}
      />

      <div className="retirement-score-factor-footer">
        <p>{factor.detail}</p>
        {showWeight && (
          <span>
            Weight {Math.round(factor.weight * 100)}% · {factor.weightedPoints.toFixed(1)} points
          </span>
        )}
      </div>
    </article>
  );
}
