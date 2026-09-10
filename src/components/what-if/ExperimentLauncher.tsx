import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInRouterContext, useSearchParams } from "react-router-dom";

import { AppIcons } from "../../icons";
import "../../styles/what-if-v1-3.css";
import "../../styles/what-if-experiment-groups.css";
import { InfoTooltip } from "../ui";
import {
  setWhatIfMoneyDisplayMode,
  setWhatIfViewMode,
  useWhatIfDisplaySettings,
  type WhatIfMoneyDisplayMode,
} from "./whatIfDisplaySettings";

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

const experimentGroups = [
  {
    title: "Your decisions",
    description: "Choices you can directly change in the plan.",
    experimentIds: ["retirement-age", "contributions", "spending"] as ExperimentId[],
  },
  {
    title: "Planning assumptions",
    description: "Test how different long-term assumptions affect the outcome.",
    experimentIds: ["fees", "returns", "inflation"] as ExperimentId[],
  },
  {
    title: "Income & resilience",
    description: "Explore other income and difficult market conditions.",
    experimentIds: ["state-pension", "market-downturn"] as ExperimentId[],
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
  const { viewMode, displayMode } = useWhatIfDisplaySettings();

  return (
    <>
      <section className="what-if-main-display-controls" aria-labelledby="what-if-display-title">
        <div className="drawdown-view-controls what-if-view-controls">
          <div>
            <p className="panel-eyebrow">Explore your options</p>
            <h2 id="what-if-display-title">Choose how much detail you want to see</h2>
            <p>
              {viewMode === "simple"
                ? "Start with the impact in plain English and the few numbers that matter most."
                : "See the financial figures behind each change and compare them with your saved plan."}
            </p>
          </div>

          <div className="drawdown-view-actions">
            <div className="drawdown-view-mode-toggle" role="group" aria-label="What If view">
              <button
                type="button"
                className={viewMode === "simple" ? "is-active" : undefined}
                aria-pressed={viewMode === "simple"}
                onClick={() => setWhatIfViewMode("simple")}
              >
                Simple
              </button>
              <button
                type="button"
                className={viewMode === "detailed" ? "is-active" : undefined}
                aria-pressed={viewMode === "detailed"}
                onClick={() => setWhatIfViewMode("detailed")}
              >
                Detailed
              </button>
            </div>
            <MoneyDisplayToggle value={displayMode} />
          </div>
        </div>
      </section>

      <section className="what-if-launcher" aria-labelledby="what-if-launcher-title">
        <div className="what-if-launcher-heading">
          <div>
            <p className="planner-eyebrow">Explore one change</p>
            <h2 id="what-if-launcher-title">Choose an experiment to explore</h2>
          </div>
          <p>
            One experiment is open at a time. The highlighted choice is the one loaded below.
          </p>
        </div>

        <div className="what-if-experiment-groups">
          {experimentGroups.map((group) => (
            <section key={group.title} className="what-if-experiment-group" aria-label={group.title}>
              <div className="what-if-experiment-group-heading">
                <strong>{group.title}</strong>
                <span>{group.description}</span>
              </div>

              <div className="what-if-experiment-nav" role="tablist" aria-label={`${group.title} experiments`}>
                {group.experimentIds.map((experimentId) => {
                  const experiment = experiments.find((item) => item.id === experimentId);
                  if (!experiment) return null;
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
                      <span className="what-if-experiment-tab-icon" aria-hidden="true">
                        {isActive ? (
                          <FontAwesomeIcon icon={AppIcons.check} fixedWidth />
                        ) : (
                          <FontAwesomeIcon icon={experiment.icon} fixedWidth />
                        )}
                      </span>
                      <span>{experiment.title}</span>
                      {isActive && <small>Exploring</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

function MoneyDisplayToggle({ value }: { value: WhatIfMoneyDisplayMode }) {
  const showingToday = value === "today";
  const nextValue: WhatIfMoneyDisplayMode = showingToday ? "nominal" : "today";

  return (
    <div className="money-display-toggle-group">
      <span className="money-display-toggle-label">How would you like to view the figures?</span>
      <button
        type="button"
        role="switch"
        aria-checked={!showingToday}
        aria-label={`Display values as ${showingToday ? "today's money" : "future money"}. Switch to ${showingToday ? "future money" : "today's money"}.`}
        className="money-display-toggle"
        onClick={() => setWhatIfMoneyDisplayMode(nextValue)}
      >
        <span className="money-display-toggle-icon" aria-hidden="true">
          <FontAwesomeIcon icon={showingToday ? AppIcons.money : AppIcons.growth} fixedWidth />
        </span>
        <span>{showingToday ? "Today’s money" : "Future money"}</span>
        <span className="money-display-toggle-track" aria-hidden="true">
          <span className="money-display-toggle-thumb" />
        </span>
      </button>
      <InfoTooltip ariaLabel="Explain today’s money and future money" size="medium">
        <strong>Today&apos;s money</strong>
        <p>Shows the figures using today&apos;s buying power, making the impact easier to compare with what money is worth now.</p>
        <strong>Future money</strong>
        <p>Shows the projected pound amounts at retirement, including the effect of inflation before you reach that age.</p>
        <small>Both views use the same experiment. Only the way the money values are displayed changes.</small>
      </InfoTooltip>
    </div>
  );
}

function parseExperiment(value: string | null): ExperimentId | null {
  return value && experimentIds.has(value as ExperimentId)
    ? (value as ExperimentId)
    : null;
}
