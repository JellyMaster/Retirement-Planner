import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { Scenario } from "../../domain/scenarios";
import { calculateScenarioSummary } from "../../domain/scenarios/calculateScenarioSummary";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";

interface ScenarioDecisionSummaryProps {
  scenarios: Scenario[];
  activeScenario: Scenario;
}

type Summary = ReturnType<typeof calculateScenarioSummary>;

export function ScenarioDecisionSummary({
  scenarios,
  activeScenario,
}: ScenarioDecisionSummaryProps) {
  const summaries = scenarios.map(calculateScenarioSummary);
  const activeSummary = calculateScenarioSummary(activeScenario);
  const validPotSummaries = summaries.filter(
    (summary): summary is Summary & { projectedPot: number } =>
      summary.projectedPot !== null,
  );
  const highestPot = maxBy(validPotSummaries, (summary) => summary.projectedPot);
  const earliestRetirement = minBy(
    summaries,
    (summary) => summary.scenario.inputs.retirementAge,
  );
  const lowestSaving = minBy(
    summaries,
    (summary) => summary.monthlyContribution,
  );
  const alternatives = summaries.filter(
    (summary) => summary.scenario.id !== activeScenario.id,
  );

  return (
    <section
      className="scenario-decision-summary"
      aria-labelledby="scenario-decision-summary-title"
    >
      <header className="scenario-decision-summary-header">
        <div>
          <p className="planner-eyebrow">Recommended view</p>
          <h2 id="scenario-decision-summary-title">
            Understand the decision before the detail
          </h2>
          <p>
            There is no single best plan. These rankings show which scenario leads
            on each outcome and what each alternative trades against the active plan.
          </p>
        </div>
        <span>{summaries.length} plans compared</span>
      </header>

      <div className="scenario-ranking-grid">
        <RankingCard
          icon={AppIcons.growth}
          label="Largest projected pension"
          scenarioName={highestPot?.scenario.name ?? "Unavailable"}
          value={
            highestPot ? formatCurrency(highestPot.projectedPot) : "No valid projection"
          }
          isActive={highestPot?.scenario.id === activeScenario.id}
        />
        <RankingCard
          icon={AppIcons.retirement}
          label="Earliest retirement"
          scenarioName={earliestRetirement?.scenario.name ?? "Unavailable"}
          value={
            earliestRetirement
              ? `Age ${earliestRetirement.scenario.inputs.retirementAge}`
              : "Unavailable"
          }
          isActive={earliestRetirement?.scenario.id === activeScenario.id}
        />
        <RankingCard
          icon={AppIcons.coins}
          label="Lowest regular monthly saving"
          scenarioName={lowestSaving?.scenario.name ?? "Unavailable"}
          value={
            lowestSaving
              ? `${formatCurrency(lowestSaving.monthlyContribution)}/month`
              : "Unavailable"
          }
          isActive={lowestSaving?.scenario.id === activeScenario.id}
        />
      </div>

      <section className="scenario-tradeoffs" aria-labelledby="scenario-tradeoffs-title">
        <div className="scenario-manager-section-heading">
          <div>
            <p className="planner-eyebrow">Trade-offs</p>
            <h3 id="scenario-tradeoffs-title">What changes versus the active plan</h3>
          </div>
          <span>{activeScenario.name} is the reference</span>
        </div>

        {alternatives.length === 0 ? (
          <div className="scenario-tradeoff-empty">
            Select another scenario to see its gains and compromises.
          </div>
        ) : (
          <div className="scenario-tradeoff-grid">
            {alternatives.map((summary) => (
              <TradeoffCard
                key={summary.scenario.id}
                summary={summary}
                activeSummary={activeSummary}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function RankingCard({
  icon,
  label,
  scenarioName,
  value,
  isActive,
}: {
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  label: string;
  scenarioName: string;
  value: string;
  isActive: boolean;
}) {
  return (
    <article className={`scenario-ranking-card${isActive ? " is-active" : ""}`}>
      <span className="scenario-ranking-icon" aria-hidden="true">
        <FontAwesomeIcon icon={icon} fixedWidth />
      </span>
      <div>
        <span>{label}</span>
        <strong>{scenarioName}</strong>
        <small>{value}</small>
      </div>
      {isActive && <em>Active plan</em>}
    </article>
  );
}

function TradeoffCard({
  summary,
  activeSummary,
}: {
  summary: Summary;
  activeSummary: Summary;
}) {
  const retirementDifference =
    summary.scenario.inputs.retirementAge -
    activeSummary.scenario.inputs.retirementAge;
  const savingDifference =
    summary.monthlyContribution - activeSummary.monthlyContribution;
  const potDifference =
    summary.projectedPot === null || activeSummary.projectedPot === null
      ? null
      : summary.projectedPot - activeSummary.projectedPot;

  return (
    <article className="scenario-tradeoff-card">
      <header>
        <span className="scenario-ranking-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.comparison} fixedWidth />
        </span>
        <div>
          <h4>{summary.scenario.name}</h4>
          <p>Compared with {activeSummary.scenario.name}</p>
        </div>
      </header>
      <dl>
        <TradeoffRow
          label="Retirement timing"
          value={formatAgeDifference(retirementDifference)}
          tone={retirementDifference < 0 ? "positive" : retirementDifference > 0 ? "negative" : "neutral"}
        />
        <TradeoffRow
          label="Projected pension"
          value={potDifference === null ? "Unavailable" : formatSignedCurrency(potDifference)}
          tone={potDifference === null || potDifference === 0 ? "neutral" : potDifference > 0 ? "positive" : "negative"}
        />
        <TradeoffRow
          label="Monthly saving"
          value={`${formatSignedCurrency(savingDifference)}/month`}
          tone={savingDifference === 0 ? "neutral" : savingDifference < 0 ? "positive" : "negative"}
        />
      </dl>
    </article>
  );
}

function TradeoffRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={`is-${tone}`}>{value}</dd>
    </div>
  );
}

function formatAgeDifference(value: number): string {
  if (value === 0) return "Same retirement age";
  return `${Math.abs(value)} year${Math.abs(value) === 1 ? "" : "s"} ${
    value < 0 ? "earlier" : "later"
  }`;
}

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function minBy<T>(items: T[], selector: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) =>
      best === undefined || selector(item) < selector(best) ? item : best,
    undefined,
  );
}

function maxBy<T>(items: T[], selector: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) =>
      best === undefined || selector(item) > selector(best) ? item : best,
    undefined,
  );
}
