import { useEffect, useMemo, useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { calculateWeightedRetirementScore } from "../../engine/retirement-health";
import { AppIcons } from "../../icons";
import { ProgressRing } from "../ui";
import { RetirementScoreFactor } from "./RetirementScoreFactor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  RetirementScoreModeSelector,
  type RetirementScoreMode,
} from "./RetirementScoreModeSelector";

const STORAGE_KEY = "retirement-planner-score-mode";

interface RetirementScoreBreakdownProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
}

function readSavedMode(): RetirementScoreMode {
  if (typeof window === "undefined") return "income-coverage";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "weighted" ? "weighted" : "income-coverage";
  } catch {
    return "income-coverage";
  }
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Strong";
  if (score >= 75) return "Positive";
  if (score >= 55) return "Worth reviewing";
  return "Needs attention";
}

export function RetirementScoreBreakdown({
  inputs,
  result,
  goals,
}: RetirementScoreBreakdownProps) {
  const [mode, setMode] = useState<RetirementScoreMode>(readSavedMode);

  const breakdown = useMemo(
    () => calculateWeightedRetirementScore({ inputs, result, goals }),
    [goals, inputs, result],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, [mode]);

  const displayedScore =
    mode === "weighted" ? breakdown.weightedScore : breakdown.incomeCoverageScore;
  const scoreLabel = getScoreLabel(displayedScore);

  return (
    <section
      className={`retirement-score-breakdown retirement-score-breakdown-${mode}`}
      aria-labelledby="retirement-score-breakdown-heading"
    >
      <div className="retirement-score-breakdown-heading">
        <div>
          <p className="planner-eyebrow">Understand your score</p>
          <h2 id="retirement-score-breakdown-heading">Retirement score breakdown</h2>
          <p>
            Switch between the existing income-target score and a broader weighted planning indicator.
          </p>
        </div>

        <RetirementScoreModeSelector value={mode} onChange={setMode} />
      </div>

      <div className="retirement-score-summary">
        <ProgressRing
          className="retirement-score-summary-value"
          value={displayedScore}
          label={mode === "weighted" ? "Weighted score" : "Income coverage"}
          tone={displayedScore >= 90 ? "success" : displayedScore >= 75 ? "warning" : "danger"}
          size="medium"
        />

        <div className="retirement-score-summary-copy">
          <strong>{scoreLabel}</strong>
          <p>
            {mode === "weighted"
              ? "Combines income coverage with contribution strength, fees, timing, planning horizon, reserve affordability and State Pension support."
              : "Shows how much of your desired annual retirement income is covered by the current illustration."}
          </p>
        </div>
      </div>

      <div className="retirement-score-factor-grid">
        {breakdown.factors.map((factor) => (
          <RetirementScoreFactor
            key={factor.id}
            factor={factor}
            showWeight={mode === "weighted"}
          />
        ))}
      </div>

      <div className="retirement-score-method-note">
        <FontAwesomeIcon icon={AppIcons.information} aria-hidden="true" />
        <p>
          {mode === "weighted"
            ? "The weighted score is an explanatory planning aid using fixed heuristic weights. It does not replace the income-coverage score and is not a probability of success, risk rating or financial recommendation."
            : "The factor cards are diagnostic indicators only. In this view, they do not change the headline income-coverage score used elsewhere in the planner."}
        </p>
      </div>
    </section>
  );
}
