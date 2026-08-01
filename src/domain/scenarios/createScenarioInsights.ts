import { formatCurrency } from "../../utils/formatters";
import { calculateScenarioSummary } from "./calculateScenarioSummary";
import {
  createScenarioChartSeries,
  type ScenarioChartSeries,
} from "./createScenarioChartSeries";
import { findScenarioCrossover } from "./findScenarioCrossover";
import type { Scenario } from "./Scenario";

export type ScenarioInsightImportance = "high" | "medium" | "low";

export interface ScenarioInsight {
  id: string;
  scenarioId: string;
  importance: ScenarioInsightImportance;
  title: string;
  description: string;
}

export interface ScenarioInsightGroup {
  scenario: Scenario;
  insights: ScenarioInsight[];
}

const MAX_INSIGHTS_PER_SCENARIO = 5;

export function createScenarioInsights(
  scenarios: Scenario[],
  activeScenario: Scenario,
): ScenarioInsightGroup[] {
  const series = createScenarioChartSeries(scenarios, activeScenario.id);
  const activeSeries = series.find((item) => item.scenarioId === activeScenario.id);
  const activeSummary = calculateScenarioSummary(activeScenario);

  return scenarios
    .filter((scenario) => scenario.id !== activeScenario.id)
    .map((scenario) => ({
      scenario,
      insights: buildInsights(
        scenario,
        activeScenario,
        series.find((item) => item.scenarioId === scenario.id),
        activeSeries,
        activeSummary,
      ).slice(0, MAX_INSIGHTS_PER_SCENARIO),
    }));
}

function buildInsights(
  scenario: Scenario,
  activeScenario: Scenario,
  scenarioSeries: ScenarioChartSeries | undefined,
  activeSeries: ScenarioChartSeries | undefined,
  activeSummary: ReturnType<typeof calculateScenarioSummary>,
): ScenarioInsight[] {
  const summary = calculateScenarioSummary(scenario);

  if (!summary.isValid || !activeSummary.isValid) {
    return [
      createInsight(
        scenario.id,
        "projection-unavailable",
        "high",
        "Projection unavailable",
        "Correct this scenario's inputs before comparing its projected outcomes.",
      ),
    ];
  }

  const insights: ScenarioInsight[] = [];
  const retirementDifference =
    scenario.inputs.retirementAge - activeScenario.inputs.retirementAge;
  if (retirementDifference !== 0) {
    const amount = Math.abs(retirementDifference);
    insights.push(
      createInsight(
        scenario.id,
        "retirement-age",
        "high",
        retirementDifference < 0 ? "Earlier retirement" : "Later retirement",
        `${scenario.name} retires ${amount} ${amount === 1 ? "year" : "years"} ${
          retirementDifference < 0 ? "earlier" : "later"
        } than the active plan.`,
      ),
    );
  }

  addCurrencyDifference(
    insights,
    scenario.id,
    "projected-pot",
    "Projected pension",
    summary.projectedPot,
    activeSummary.projectedPot,
    "high",
  );

  const monthlyDifference =
    summary.monthlyContribution - activeSummary.monthlyContribution;
  if (Math.abs(monthlyDifference) >= 0.5) {
    insights.push(
      createInsight(
        scenario.id,
        "monthly-saving",
        "medium",
        monthlyDifference > 0 ? "Higher monthly saving" : "Lower monthly saving",
        `${scenario.name} saves ${formatCurrency(Math.abs(monthlyDifference))}/month ${
          monthlyDifference > 0 ? "more" : "less"
        } than the active plan.`,
      ),
    );
  }

  if (scenarioSeries && activeSeries) {
    const crossover = findScenarioCrossover(scenarioSeries, activeSeries);
    const firstScenarioPoint = scenarioSeries.points[0];
    const firstActivePoint = activeSeries.points.find(
      (point) => point.age === firstScenarioPoint?.age,
    );
    const finishesAhead =
      (summary.projectedPot ?? 0) > (activeSummary.projectedPot ?? 0) + 0.5;

    if (crossover) {
      insights.push(
        createInsight(
          scenario.id,
          "crossover",
          "high",
          "Overtakes the active plan",
          `${scenario.name} moves ahead of the active plan at age ${crossover.age} in today's money.`,
        ),
      );
    } else if (
      finishesAhead &&
      firstScenarioPoint &&
      firstActivePoint &&
      firstScenarioPoint.real > firstActivePoint.real
    ) {
      insights.push(
        createInsight(
          scenario.id,
          "starts-ahead",
          "medium",
          "Starts ahead",
          `${scenario.name} remains ahead of the active plan throughout the shared projection period.`,
        ),
      );
    } else if (!finishesAhead) {
      insights.push(
        createInsight(
          scenario.id,
          "no-crossover",
          "low",
          "Does not overtake",
          `${scenario.name} does not overtake the active plan during the shared projection period.`,
        ),
      );
    }
  }

  addCurrencyDifference(
    insights,
    scenario.id,
    "investment-growth",
    "Investment growth",
    summary.investmentGrowth,
    activeSummary.investmentGrowth,
    "medium",
  );
  addCurrencyDifference(
    insights,
    scenario.id,
    "fees",
    "Total fees",
    summary.totalFees,
    activeSummary.totalFees,
    "low",
  );

  if (insights.length === 0) {
    insights.push(
      createInsight(
        scenario.id,
        "similar-outcome",
        "low",
        "Materially similar outcome",
        `${scenario.name} produces no material difference from the active plan across the available comparison metrics.`,
      ),
    );
  }

  return insights;
}

function addCurrencyDifference(
  insights: ScenarioInsight[],
  scenarioId: string,
  id: string,
  label: string,
  value: number | null,
  activeValue: number | null,
  importance: ScenarioInsightImportance,
): void {
  if (value === null || activeValue === null) return;

  const difference = value - activeValue;
  if (Math.abs(difference) < 0.5) return;

  insights.push(
    createInsight(
      scenarioId,
      id,
      importance,
      `${label} is ${difference > 0 ? "higher" : "lower"}`,
      `${label} is ${formatCurrency(Math.abs(difference))} ${
        difference > 0 ? "greater" : "lower"
      } than the active plan.`,
    ),
  );
}

function createInsight(
  scenarioId: string,
  id: string,
  importance: ScenarioInsightImportance,
  title: string,
  description: string,
): ScenarioInsight {
  return {
    id: `${scenarioId}-${id}`,
    scenarioId,
    importance,
    title,
    description,
  };
}
