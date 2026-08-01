import { useMemo } from "react";

import { calculateScenarioSummary } from "../../domain/scenarios/calculateScenarioSummary";
import type { Scenario } from "../../domain/scenarios";
import { formatCurrency } from "../../utils/formatters";
import { ScenarioChangesSummary } from "./ScenarioChangesSummary";
import { ScenarioComparisonTabs } from "./ScenarioComparisonTabs";
import { ScenarioGrowthChart } from "./ScenarioGrowthChart";

interface ScenarioIntelligencePanelProps {
  scenarios: Scenario[];
  activeScenario: Scenario;
}

type ScenarioSummary = ReturnType<typeof calculateScenarioSummary>;
type ComparisonDirection = "greater" | "less" | "same";

interface ComparisonIndicator {
  direction: ComparisonDirection;
  label: string;
}

export function ScenarioIntelligencePanel({
  scenarios,
  activeScenario,
}: ScenarioIntelligencePanelProps) {
  const summaries = useMemo(
    () => scenarios.map(calculateScenarioSummary),
    [scenarios],
  );
  const activeSummary = useMemo(
    () => calculateScenarioSummary(activeScenario),
    [activeScenario],
  );

  return (
    <ScenarioComparisonTabs
      outcomes={
        <OutcomesTable
          summaries={summaries}
          activeSummary={activeSummary}
          activeScenarioId={activeScenario.id}
        />
      }
      chart={
        <ScenarioGrowthChart
          scenarios={scenarios}
          activeScenarioId={activeScenario.id}
        />
      }
      changes={
        <ScenarioChangesSummary
          activeScenario={activeScenario}
          scenarios={scenarios}
        />
      }
    />
  );
}

interface OutcomesTableProps {
  summaries: ScenarioSummary[];
  activeSummary: ScenarioSummary;
  activeScenarioId: string;
}

function OutcomesTable({
  summaries,
  activeSummary,
  activeScenarioId,
}: OutcomesTableProps) {
  return (
    <section className="scenario-comparison" aria-labelledby="scenario-comparison-title">
      <div className="scenario-manager-section-heading">
        <div>
          <h3 id="scenario-comparison-title">Projected outcomes</h3>
        </div>
        <span>Compared with the active plan · values in today&apos;s money</span>
      </div>

      <div className="scenario-comparison-table-wrap">
        <table className="scenario-comparison-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {summaries.map((summary) => {
                const isActive = summary.scenario.id === activeScenarioId;
                return (
                  <th
                    scope="col"
                    key={summary.scenario.id}
                    className={isActive ? "is-active-plan" : undefined}
                  >
                    <span>{summary.scenario.name}</span>
                    {isActive && (
                      <span className="scenario-comparison-active-badge">
                        Active plan
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow
              label="Retirement age"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => `Age ${summary.scenario.inputs.retirementAge}`}
              indicator={(summary) =>
                createNumberIndicator(
                  summary.scenario.inputs.retirementAge,
                  activeSummary.scenario.inputs.retirementAge,
                  " years",
                )
              }
            />
            <ComparisonRow
              label="Monthly saving"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => formatCurrency(summary.monthlyContribution)}
              indicator={(summary) =>
                createCurrencyIndicator(
                  summary.monthlyContribution,
                  activeSummary.monthlyContribution,
                )
              }
            />
            <ComparisonRow
              label="Projected pension pot"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => formatOptionalCurrency(summary.projectedPot)}
              indicator={(summary) =>
                createOptionalCurrencyIndicator(
                  summary.projectedPot,
                  activeSummary.projectedPot,
                )
              }
            />
            <ComparisonRow
              label="Total contributions"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => formatOptionalCurrency(summary.totalContributions)}
              indicator={(summary) =>
                createOptionalCurrencyIndicator(
                  summary.totalContributions,
                  activeSummary.totalContributions,
                )
              }
            />
            <ComparisonRow
              label="Investment growth"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => formatOptionalCurrency(summary.investmentGrowth)}
              indicator={(summary) =>
                createOptionalCurrencyIndicator(
                  summary.investmentGrowth,
                  activeSummary.investmentGrowth,
                )
              }
            />
            <ComparisonRow
              label="Total fees"
              summaries={summaries}
              activeScenarioId={activeScenarioId}
              value={(summary) => formatOptionalCurrency(summary.totalFees)}
              indicator={(summary) =>
                createOptionalCurrencyIndicator(
                  summary.totalFees,
                  activeSummary.totalFees,
                )
              }
            />
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface ComparisonRowProps {
  label: string;
  summaries: ScenarioSummary[];
  activeScenarioId: string;
  value: (summary: ScenarioSummary) => string;
  indicator: (summary: ScenarioSummary) => ComparisonIndicator | null;
}

function ComparisonRow({
  label,
  summaries,
  activeScenarioId,
  value,
  indicator,
}: ComparisonRowProps) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {summaries.map((summary) => {
        const isActive = summary.scenario.id === activeScenarioId;
        const comparison = isActive ? null : indicator(summary);

        return (
          <td
            key={summary.scenario.id}
            className={isActive ? "is-active-plan" : undefined}
          >
            <strong>{value(summary)}</strong>
            {isActive ? (
              <span className="scenario-comparison-reference">
                Current active plan
              </span>
            ) : (
              comparison && (
                <span
                  className={`scenario-comparison-indicator is-${comparison.direction}`}
                >
                  <span aria-hidden="true">
                    {comparison.direction === "greater"
                      ? "↑"
                      : comparison.direction === "less"
                        ? "↓"
                        : "="}
                  </span>{" "}
                  {comparison.label}
                </span>
              )
            )}
          </td>
        );
      })}
    </tr>
  );
}

function formatOptionalCurrency(value: number | null): string {
  return value === null ? "Unavailable" : formatCurrency(value);
}

function createOptionalCurrencyIndicator(
  value: number | null,
  activeValue: number | null,
): ComparisonIndicator | null {
  if (value === null || activeValue === null) return null;
  return createCurrencyIndicator(value, activeValue);
}

function createCurrencyIndicator(
  value: number,
  activeValue: number,
): ComparisonIndicator {
  const difference = value - activeValue;
  if (Math.abs(difference) < 0.5) {
    return { direction: "same", label: "Same as active plan" };
  }

  return {
    direction: difference > 0 ? "greater" : "less",
    label: `${difference > 0 ? "Greater" : "Less"} by ${formatCurrency(
      Math.abs(difference),
    )}`,
  };
}

function createNumberIndicator(
  value: number,
  activeValue: number,
  suffix = "",
): ComparisonIndicator {
  const difference = value - activeValue;
  if (difference === 0) {
    return { direction: "same", label: "Same as active plan" };
  }

  return {
    direction: difference > 0 ? "greater" : "less",
    label: `${difference > 0 ? "Greater" : "Less"} by ${Math.abs(
      difference,
    )}${suffix}`,
  };
}
