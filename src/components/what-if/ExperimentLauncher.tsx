import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInRouterContext, useSearchParams } from "react-router-dom";

import { AppIcons } from "../../icons";
import "../../styles/what-if-v1-3.css";

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
    title: "Spending",
    description: "Explore a different retirement-income target.",
    icon: AppIcons.money,
    available: true,
  },
  {
    id: "fees" as const,
    title: "Fees",
    description: "See the long-term effect of pension charges.",
    icon: AppIcons.settings,
    available: true,
  },
  {
    id: "returns" as const,
    title: "Returns",
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
    available: true,
  },
  {
    id: "market-downturn" as const,
    title: "Downturn",
    description: "Stress-test the plan against a difficult market period.",
    icon: AppIcons.warning,
    available: true,
  },
] as const;

const experimentIds = new Set<ExperimentId>(
  experiments.map((experiment) => experiment.id),
);

export function ExperimentLauncher(props: ExperimentLauncherProps) {
  return useInRouterContext() ? (
    <RoutedExperimentLauncher {...props} />
  ) : (
    <ExperimentLauncherContent {...props} />
  );
}

function RoutedExperimentLauncher({
  activeExperiment,
  onSelect,
}: ExperimentLauncherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedExperiment = parseExperiment(searchParams.get("experiment"));

  useEffect(() => {
    if (!requestedExperiment || requestedExperiment === activeExperiment) return;
    onSelect(requestedExperiment);
  }, [activeExperiment, onSelect, requestedExperiment]);

  function selectExperiment(experiment: ExperimentId) {
    const next = new URLSearchParams(searchParams);
    next.set("experiment", experiment);
    setSearchParams(next, { replace: true });
    onSelect(experiment);
  }

  return (
    <ExperimentLauncherContent
      activeExperiment={activeExperiment}
      onSelect={selectExperiment}
    />
  );
}

function ExperimentLauncherContent({
  activeExperiment,
  onSelect,
}: ExperimentLauncherProps) {
  return (
    <section className="what-if-launcher" aria-labelledby="what-if-launcher-title">
      <div className="what-if-launcher-heading">
        <div>
          <p className="planner-eyebrow">Explore one change</p>
          <h2 id="what-if-launcher-title">Choose a decision</h2>
        </div>
        <p>Change one lever at a time. Your saved plan stays untouched.</p>
      </div>

      <div className="what-if-experiment-nav" role="tablist" aria-label="What If experiments">
        {experiments.map((experiment) => {
          const isActive = activeExperiment === experiment.id;

          return (
            <button
              key={experiment.id}
              type="button"
              role="tab"
              className={`what-if-experiment-tab${isActive ? " is-active" : ""}`}
              aria-selected={isActive}
              title={experiment.description}
              disabled={!experiment.available}
              onClick={() => onSelect(experiment.id)}
            >
              <FontAwesomeIcon icon={experiment.icon} fixedWidth aria-hidden="true" />
              <span>{experiment.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function parseExperiment(value: string | null): ExperimentId | null {
  return value && experimentIds.has(value as ExperimentId)
    ? (value as ExperimentId)
    : null;
}
