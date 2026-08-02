import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";

export type ExperimentId =
  | "retirement-age"
  | "contributions"
  | "spending"
  | "fees"
  | "returns"
  | "inflation"
  | "state-pension"
  | "market-downturn";

interface ExperimentLauncherProps {
  activeExperiment: ExperimentId;
  onSelect: (experiment: ExperimentId) => void;
}

const experiments = [
  {
    id: "retirement-age" as const,
    title: "Retirement age",
    description: "See how retiring earlier or later changes the plan.",
    icon: AppIcons.retirement,
    available: true,
  },
  {
    id: "contributions" as const,
    title: "Save more",
    description: "Test a different monthly pension contribution.",
    icon: AppIcons.plus,
    available: true,
  },
  {
    id: "spending" as const,
    title: "Spend more",
    description: "Explore a different retirement-income target.",
    icon: AppIcons.money,
    available: true,
  },
  {
    id: "fees" as const,
    title: "Lower fees",
    description: "See the long-term effect of pension charges.",
    icon: AppIcons.settings,
    available: true,
  },
  {
    id: "returns" as const,
    title: "Investment returns",
    description: "Test a more cautious or optimistic growth assumption.",
    icon: AppIcons.growth,
    available: true,
  },
  {
    id: "inflation" as const,
    title: "Inflation",
    description: "See how purchasing power changes the outcome.",
    icon: AppIcons.chart,
    available: true,
  },
  {
    id: "state-pension" as const,
    title: "State Pension",
    description: "Explore its amount, timing and contribution to income.",
    icon: AppIcons.pension,
    available: false,
  },
  {
    id: "market-downturn" as const,
    title: "Market downturn",
    description: "Stress-test the plan against a difficult market period.",
    icon: AppIcons.warning,
    available: false,
  },
];

export function ExperimentLauncher({
  activeExperiment,
  onSelect,
}: ExperimentLauncherProps) {
  return (
    <section className="what-if-launcher" aria-labelledby="what-if-launcher-title">
      <div className="what-if-section-heading">
        <div>
          <p className="planner-eyebrow">Choose a decision</p>
          <h2 id="what-if-launcher-title">What would you like to explore?</h2>
          <p>
            Change one meaningful lever at a time so its effect remains easy to
            understand.
          </p>
        </div>
      </div>

      <div className="what-if-experiment-grid">
        {experiments.map((experiment) => {
          const isActive = activeExperiment === experiment.id;

          return (
            <button
              key={experiment.id}
              type="button"
              className={`what-if-experiment-card${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              disabled={!experiment.available}
              onClick={() => onSelect(experiment.id)}
            >
              <span className="what-if-experiment-icon" aria-hidden="true">
                <FontAwesomeIcon icon={experiment.icon} fixedWidth />
              </span>
              <span className="what-if-experiment-copy">
                <strong>{experiment.title}</strong>
                <small>{experiment.description}</small>
              </span>
              <span className="what-if-experiment-status">
                {experiment.available
                  ? isActive
                    ? "Selected"
                    : "Explore"
                  : "Coming next"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
