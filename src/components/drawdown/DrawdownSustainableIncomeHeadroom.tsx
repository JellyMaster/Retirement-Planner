import { useMemo } from "react";

import { calculateSustainableTargetIncome } from "../../engine/drawdown/calculateSustainableTargetIncome";
import { createIncomeHeadroomAssessment } from "../../engine/drawdown/createIncomeHeadroomAssessment";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownSustainableIncomeHeadroomProps {
  inputs: DrawdownInputs;
}

const STATUS_CONTENT = {
  comfortable: {
    label: "Comfortable",
    description:
      "Your target is at least 10% below the modelled sustainable income, giving the plan some headroom.",
  },
  tight: {
    label: "Tight",
    description:
      "Your target is within 10% of the modelled sustainable income, so there is limited headroom for changes in assumptions.",
  },
  shortfall: {
    label: "Shortfall",
    description:
      "Your target is above the modelled sustainable income and may not be maintained through the full planning period.",
  },
} as const;

export function DrawdownSustainableIncomeHeadroom({
  inputs,
}: DrawdownSustainableIncomeHeadroomProps) {
  const sustainableIncome = useMemo(
    () => calculateSustainableTargetIncome(inputs),
    [inputs],
  );
  const assessment = createIncomeHeadroomAssessment(
    inputs.desiredAnnualIncome,
    sustainableIncome,
  );
  const status = STATUS_CONTENT[assessment.status];
  const basisLabel = inputs.incomeTargetMode === "net" ? "net spending" : "gross income";
  const headroomLabel =
    assessment.annualHeadroom >= 0 ? "Annual headroom" : "Annual shortfall";
  const headroomValue = Math.abs(assessment.annualHeadroom);
  const percentText =
    assessment.headroomPercent === null
      ? "No percentage comparison for a £0 target"
      : `${Math.abs(assessment.headroomPercent * 100).toFixed(1)}% ${
          assessment.annualHeadroom >= 0 ? "above target" : "below target"
        }`;

  return (
    <section
      className={`panel drawdown-headroom-panel drawdown-headroom-${assessment.status}`}
      aria-labelledby="drawdown-headroom-title"
    >
      <div className="drawdown-section-heading">
        <div>
          <p className="panel-eyebrow">Sustainable income</p>
          <h2 id="drawdown-headroom-title">How much flexibility does your plan have?</h2>
        </div>
        <p>
          Compare your selected target with the highest modelled {basisLabel} that
          reaches age {inputs.endAge} without an income shortfall.
        </p>
      </div>

      <div className="drawdown-decision-grid">
        <article className="drawdown-decision-card">
          <span className="drawdown-decision-label">Sustainable {basisLabel}</span>
          <strong className="drawdown-decision-value">
            {formatCurrency(assessment.sustainableIncome)}
          </strong>
          <small className="drawdown-decision-detail">
            Annual amount supported to age {inputs.endAge}
          </small>
        </article>

        <article className="drawdown-decision-card">
          <span className="drawdown-decision-label">Your target</span>
          <strong className="drawdown-decision-value">
            {formatCurrency(assessment.targetIncome)}
          </strong>
          <small className="drawdown-decision-detail">
            Selected annual {basisLabel}
          </small>
        </article>

        <article className="drawdown-decision-card">
          <span className="drawdown-decision-label">{headroomLabel}</span>
          <strong className="drawdown-decision-value">
            {formatCurrency(headroomValue)}
          </strong>
          <small className="drawdown-decision-detail">{percentText}</small>
        </article>
      </div>

      <div className="drawdown-headroom-status" role="status">
        <div>
          <span className="drawdown-decision-label">Plan status</span>
          <strong>{status.label}</strong>
        </div>
        <p>{status.description}</p>
      </div>

      <p className="drawdown-headroom-note">
        This classification uses the current deterministic assumptions. It is an
        illustration of modelled headroom, not a guarantee that future investment
        returns, inflation or tax will follow those assumptions.
      </p>
    </section>
  );
}
