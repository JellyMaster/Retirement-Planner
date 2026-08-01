import type { RetirementRecommendation } from "../../engine/recommendations";

interface ActionDetailsProps {
  recommendation: RetirementRecommendation;
}

export function ActionDetails({ recommendation }: ActionDetailsProps) {
  const strongestChanges = [
    { label: "Monte Carlo confidence", value: recommendation.impact.monteCarloConfidenceChange * 100 },
    { label: "Sustainability", value: (recommendation.impact.sustainabilityProbabilityChange ?? 0) * 100 },
    { label: "Readiness score", value: recommendation.impact.readinessScoreChange },
    { label: "Weighted score", value: recommendation.impact.weightedScoreChange },
  ].sort((left, right) => right.value - left.value);

  const primaryDriver = strongestChanges[0];

  return (
    <div className="action-details">
      <div>
        <h4>What changes</h4>
        <ul>
          {recommendation.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Why it ranks highly</h4>
        <p>
          {primaryDriver && primaryDriver.value > 0
            ? `${primaryDriver.label} shows the strongest improvement, while the recommendation balances total impact against the size of the change.`
            : "This recommendation improves the projected retirement outcome while keeping the current plan available for comparison."}
        </p>
      </div>
    </div>
  );
}
