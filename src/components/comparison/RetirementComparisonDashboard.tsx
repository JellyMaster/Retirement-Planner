import { useState, type CSSProperties } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import type { PensionInputErrors } from "../../validation/validatePensionInputs";
import { PensionInputsForm } from "../inputs/PensionInputsForm";
import { ScenarioComparisonChart } from "./ScenarioComparisonChart";

interface ProjectionScenario {
  projection: ProjectionResult;
  errors: PensionInputErrors;
  hasErrors: boolean;
}

interface RetirementComparisonDashboardProps {
  baselineInputs: PensionInputs;
  alternativeInputs: PensionInputs;
  baselineScenario: ProjectionScenario;
  alternativeScenario: ProjectionScenario;
  onBaselineChange: (inputs: PensionInputs) => void;
  onAlternativeChange: (inputs: PensionInputs) => void;
  onResetBaseline: () => void;
  onResetAlternative: () => void;
  onDuplicateBaseline: () => void;
  onSwap: () => void;
}

type AssumptionKey = keyof PensionInputs;

interface AssumptionDefinition {
  key: AssumptionKey;
  label: string;
  format: (value: number | undefined) => string;
  difference?: (baseline: number | undefined, alternative: number | undefined) => string;
}

const assumptionDefinitions: AssumptionDefinition[] = [
  { key: "currentAge", label: "Current age", format: formatOptionalNumber },
  {
    key: "retirementAge",
    label: "Retirement age",
    format: formatOptionalNumber,
    difference: formatYearDifference,
  },
  { key: "currentPot", label: "Current pension pot", format: formatOptionalCurrency },
  {
    key: "monthlyEmployeeContribution",
    label: "Your monthly contribution",
    format: formatOptionalCurrency,
    difference: formatCurrencyDifference,
  },
  {
    key: "monthlyEmployerContribution",
    label: "Employer monthly contribution",
    format: formatOptionalCurrency,
    difference: formatCurrencyDifference,
  },
  {
    key: "annualContributionIncrease",
    label: "Annual contribution increase",
    format: formatOptionalPercentage,
    difference: formatPercentagePointDifference,
  },
  {
    key: "extraContributionAge",
    label: "Extra contribution starts",
    format: formatOptionalNumber,
    difference: formatYearDifference,
  },
  {
    key: "extraMonthlyContribution",
    label: "Extra monthly contribution",
    format: formatOptionalCurrency,
    difference: formatCurrencyDifference,
  },
  {
    key: "annualReturn",
    label: "Expected annual return",
    format: formatOptionalPercentage,
    difference: formatPercentagePointDifference,
  },
  {
    key: "annualFee",
    label: "Annual pension fee",
    format: formatOptionalPercentage,
    difference: formatPercentagePointDifference,
  },
  {
    key: "inflation",
    label: "Expected inflation",
    format: formatOptionalPercentage,
    difference: formatPercentagePointDifference,
  },
];

export function RetirementComparisonDashboard({
  baselineInputs,
  alternativeInputs,
  baselineScenario,
  alternativeScenario,
  onBaselineChange,
  onAlternativeChange,
  onResetBaseline,
  onResetAlternative,
  onDuplicateBaseline,
  onSwap,
}: RetirementComparisonDashboardProps) {
  const [showUnchanged, setShowUnchanged] = useState(false);

  if (baselineScenario.hasErrors || alternativeScenario.hasErrors) {
    return (
      <>
        <ComparisonToolbar onDuplicateBaseline={onDuplicateBaseline} onSwap={onSwap} />
        <section className="validation-notice" role="alert">
          Correct the highlighted fields in both scenarios to view the comparison.
        </section>
        <ScenarioEditors
          baselineInputs={baselineInputs}
          alternativeInputs={alternativeInputs}
          baselineScenario={baselineScenario}
          alternativeScenario={alternativeScenario}
          onBaselineChange={onBaselineChange}
          onAlternativeChange={onAlternativeChange}
          onResetBaseline={onResetBaseline}
          onResetAlternative={onResetAlternative}
          open
        />
      </>
    );
  }

  const comparison = createComparison(
    baselineInputs,
    alternativeInputs,
    baselineScenario.projection,
    alternativeScenario.projection,
  );

  const differingAssumptions = assumptionDefinitions.filter(
    ({ key }) => normaliseValue(baselineInputs[key]) !== normaliseValue(alternativeInputs[key]),
  );
  const unchangedAssumptions = assumptionDefinitions.filter(
    ({ key }) => normaliseValue(baselineInputs[key]) === normaliseValue(alternativeInputs[key]),
  );
  const visibleAssumptions = showUnchanged
    ? [...differingAssumptions, ...unchangedAssumptions]
    : differingAssumptions;

  return (
    <div className="retirement-comparison-dashboard">
      <ComparisonToolbar onDuplicateBaseline={onDuplicateBaseline} onSwap={onSwap} />

      <OutcomeBanner comparison={comparison} />

      <section className="comparison-difference-grid" aria-label="Key scenario differences">
        <DifferenceCard
          label="Retirement age"
          difference={formatYearDifference(
            baselineInputs.retirementAge,
            alternativeInputs.retirementAge,
          )}
          baseline={String(baselineInputs.retirementAge)}
          alternative={String(alternativeInputs.retirementAge)}
          direction={getLowerIsLifestyleDirection(
            alternativeInputs.retirementAge - baselineInputs.retirementAge,
          )}
        />
        <DifferenceCard
          label="Pot at retirement"
          difference={formatSignedCurrency(comparison.finalBalanceDifference)}
          baseline={formatCurrency(baselineScenario.projection.finalBalance.nominal)}
          alternative={formatCurrency(alternativeScenario.projection.finalBalance.nominal)}
          direction={getPositiveDirection(comparison.finalBalanceDifference)}
        />
        <DifferenceCard
          label="Today's money value"
          difference={formatSignedCurrency(comparison.realBalanceDifference)}
          baseline={formatCurrency(baselineScenario.projection.finalBalance.real)}
          alternative={formatCurrency(alternativeScenario.projection.finalBalance.real)}
          direction={getPositiveDirection(comparison.realBalanceDifference)}
        />
        <DifferenceCard
          label="Total contributions"
          difference={formatSignedCurrency(comparison.contributionDifference)}
          baseline={formatCurrency(baselineScenario.projection.totalContributions.nominal)}
          alternative={formatCurrency(alternativeScenario.projection.totalContributions.nominal)}
          direction="neutral"
        />
      </section>

      <div className="comparison-main-grid">
        <div className="comparison-chart-stack">
          <ScenarioComparisonChart
            baseYears={baselineScenario.projection.years}
            comparisonYears={alternativeScenario.projection.years}
          />
          {comparison.crossoverAge !== undefined && (
            <p className="comparison-chart-note">
              The comparison plan first moves ahead of the current plan at age {comparison.crossoverAge}.
            </p>
          )}
        </div>

        <TradeOffPanel comparison={comparison} />
      </div>

      <section className="panel comparison-assumptions-panel">
        <div className="panel-heading comparison-section-heading">
          <div>
            <h2>Assumptions that differ</h2>
            <p>Focus on the changes responsible for the different outcome.</p>
          </div>
          {unchangedAssumptions.length > 0 && (
            <button
              type="button"
              className="comparison-text-button"
              onClick={() => setShowUnchanged((current) => !current)}
            >
              {showUnchanged
                ? "Hide unchanged assumptions"
                : `Show ${unchangedAssumptions.length} unchanged assumptions`}
            </button>
          )}
        </div>

        {visibleAssumptions.length === 0 ? (
          <p className="comparison-empty-state">Both scenarios currently use the same assumptions.</p>
        ) : (
          <div className="comparison-table-scroll">
            <table className="comparison-assumptions-table">
              <thead>
                <tr>
                  <th>Assumption</th>
                  <th>Current plan</th>
                  <th>Comparison plan</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssumptions.map((definition) => {
                  const baseline = baselineInputs[definition.key] as number | undefined;
                  const alternative = alternativeInputs[definition.key] as number | undefined;
                  const unchanged = normaliseValue(baseline) === normaliseValue(alternative);
                  return (
                    <tr key={definition.key} className={unchanged ? "comparison-row-unchanged" : undefined}>
                      <th scope="row">{definition.label}</th>
                      <td>{definition.format(baseline)}</td>
                      <td>{definition.format(alternative)}</td>
                      <td>
                        {unchanged
                          ? "—"
                          : definition.difference?.(baseline, alternative) ??
                            formatGenericDifference(baseline, alternative)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ComparisonTimeline baselineInputs={baselineInputs} alternativeInputs={alternativeInputs} />

      <details className="retirement-dashboard-details comparison-year-details">
        <summary>
          Year-by-year comparison · {comparison.yearRows.length} ages
        </summary>
        <YearComparisonTable rows={comparison.yearRows} />
      </details>

      <ScenarioEditors
        baselineInputs={baselineInputs}
        alternativeInputs={alternativeInputs}
        baselineScenario={baselineScenario}
        alternativeScenario={alternativeScenario}
        onBaselineChange={onBaselineChange}
        onAlternativeChange={onAlternativeChange}
        onResetBaseline={onResetBaseline}
        onResetAlternative={onResetAlternative}
      />
    </div>
  );
}

function ComparisonToolbar({
  onDuplicateBaseline,
  onSwap,
}: {
  onDuplicateBaseline: () => void;
  onSwap: () => void;
}) {
  return (
    <section className="comparison-toolbar" aria-label="Comparison controls">
      <div>
        <p className="planner-eyebrow">Scenario comparison</p>
        <h2>Current plan <span>versus</span> Comparison plan</h2>
      </div>
      <div className="comparison-toolbar-actions">
        <button type="button" className="comparison-secondary-button" onClick={onSwap}>
          Swap plans
        </button>
        <button type="button" className="comparison-secondary-button" onClick={onDuplicateBaseline}>
          Copy current plan
        </button>
      </div>
    </section>
  );
}

interface ComparisonModel {
  retirementAgeDifference: number;
  finalBalanceDifference: number;
  realBalanceDifference: number;
  contributionDifference: number;
  growthDifference: number;
  feeDifference: number;
  crossoverAge?: number;
  yearRows: YearComparisonRow[];
}

function OutcomeBanner({ comparison }: { comparison: ComparisonModel }) {
  const ageDifference = comparison.retirementAgeDifference;
  const balanceDifference = comparison.finalBalanceDifference;
  let message = "The comparison plan currently produces the same retirement age and projected pension value.";

  if (ageDifference < 0) {
    message = `The comparison plan retires ${Math.abs(ageDifference)} ${pluralise("year", Math.abs(ageDifference))} earlier and projects ${formatAbsoluteCurrency(balanceDifference)} ${balanceDifference >= 0 ? "more" : "less"} at retirement.`;
  } else if (ageDifference > 0) {
    message = `The comparison plan retires ${ageDifference} ${pluralise("year", ageDifference)} later and projects ${formatAbsoluteCurrency(balanceDifference)} ${balanceDifference >= 0 ? "more" : "less"} at retirement.`;
  } else if (balanceDifference !== 0) {
    message = `At the same retirement age, the comparison plan projects ${formatAbsoluteCurrency(balanceDifference)} ${balanceDifference >= 0 ? "more" : "less"} at retirement.`;
  }

  return (
    <section className="comparison-outcome-banner">
      <span className="comparison-outcome-icon" aria-hidden="true">↗</span>
      <div>
        <strong>What changes?</strong>
        <p>{message}</p>
      </div>
    </section>
  );
}

function DifferenceCard({
  label,
  difference,
  baseline,
  alternative,
  direction,
}: {
  label: string;
  difference: string;
  baseline: string;
  alternative: string;
  direction: "positive" | "negative" | "neutral" | "lifestyle";
}) {
  return (
    <article className={`comparison-difference-card comparison-difference-${direction}`}>
      <p>{label}</p>
      <strong>{difference}</strong>
      <dl>
        <div><dt>Current</dt><dd>{baseline}</dd></div>
        <div><dt>Comparison</dt><dd>{alternative}</dd></div>
      </dl>
    </article>
  );
}

function TradeOffPanel({ comparison }: { comparison: ComparisonModel }) {
  const benefits: string[] = [];
  const tradeOffs: string[] = [];

  if (comparison.retirementAgeDifference < 0) {
    benefits.push(`${Math.abs(comparison.retirementAgeDifference)} more ${pluralise("year", Math.abs(comparison.retirementAgeDifference))} before the baseline retirement date.`);
  } else if (comparison.retirementAgeDifference > 0) {
    tradeOffs.push(`Retirement starts ${comparison.retirementAgeDifference} ${pluralise("year", comparison.retirementAgeDifference)} later.`);
  }

  if (comparison.finalBalanceDifference > 0) {
    benefits.push(`${formatCurrency(comparison.finalBalanceDifference)} larger projected pension pot.`);
  } else if (comparison.finalBalanceDifference < 0) {
    tradeOffs.push(`${formatCurrency(Math.abs(comparison.finalBalanceDifference))} smaller projected pension pot.`);
  }

  if (comparison.contributionDifference < 0) {
    benefits.push(`${formatCurrency(Math.abs(comparison.contributionDifference))} less contributed before retirement.`);
  } else if (comparison.contributionDifference > 0) {
    tradeOffs.push(`${formatCurrency(comparison.contributionDifference)} more contributed before retirement.`);
  }

  if (comparison.growthDifference > 0) {
    benefits.push(`${formatCurrency(comparison.growthDifference)} more projected investment growth.`);
  } else if (comparison.growthDifference < 0) {
    tradeOffs.push(`${formatCurrency(Math.abs(comparison.growthDifference))} less projected investment growth.`);
  }

  if (benefits.length === 0) benefits.push("No material financial advantage is currently projected.");
  if (tradeOffs.length === 0) tradeOffs.push("No material financial trade-off is currently projected.");

  return (
    <section className="panel comparison-tradeoff-panel">
      <div className="panel-heading">
        <h2>Benefits and trade-offs</h2>
        <p>Financial outcomes and lifestyle timing are shown separately.</p>
      </div>
      <div className="comparison-tradeoff-columns">
        <div>
          <h3>Benefits</h3>
          <ul>{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        </div>
        <div>
          <h3>Trade-offs</h3>
          <ul>{tradeOffs.map((tradeOff) => <li key={tradeOff}>{tradeOff}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function ComparisonTimeline({
  baselineInputs,
  alternativeInputs,
}: {
  baselineInputs: PensionInputs;
  alternativeInputs: PensionInputs;
}) {
  const ages = [
    baselineInputs.currentAge,
    baselineInputs.extraContributionAge,
    alternativeInputs.extraContributionAge,
    baselineInputs.retirementAge,
    alternativeInputs.retirementAge,
  ].filter((age): age is number => age !== undefined && Number.isFinite(age));
  const minimumAge = Math.min(...ages);
  const maximumAge = Math.max(...ages);
  const range = Math.max(1, maximumAge - minimumAge);

  const events = [
    { age: baselineInputs.currentAge, label: "Today", type: "shared" },
    ...(baselineInputs.extraContributionAge !== undefined
      ? [{ age: baselineInputs.extraContributionAge, label: "Current plan extra contribution", type: "baseline" }]
      : []),
    ...(alternativeInputs.extraContributionAge !== undefined
      ? [{ age: alternativeInputs.extraContributionAge, label: "Comparison extra contribution", type: "alternative" }]
      : []),
    { age: baselineInputs.retirementAge, label: "Current plan retires", type: "baseline" },
    { age: alternativeInputs.retirementAge, label: "Comparison plan retires", type: "alternative" },
  ];

  return (
    <section className="panel comparison-timeline-panel">
      <div className="panel-heading comparison-section-heading">
        <div>
          <h2>Retirement timeline</h2>
          <p>See when the plans diverge and when retirement begins.</p>
        </div>
      </div>
      <div className="comparison-timeline" style={{ "--timeline-span": range } as CSSProperties}>
        <div className="comparison-timeline-track" />
        {events.map((event, index) => {
          const left = ((event.age - minimumAge) / range) * 100;
          return (
            <div
              className={`comparison-timeline-event comparison-timeline-${event.type}`}
              style={{ left: `${left}%` }}
              key={`${event.type}-${event.age}-${index}`}
            >
              <span className="comparison-timeline-dot" />
              <strong>Age {event.age}</strong>
              <small>{event.label}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface YearComparisonRow {
  age: number;
  baseline?: number;
  alternative?: number;
  difference?: number;
}

function YearComparisonTable({ rows }: { rows: YearComparisonRow[] }) {
  return (
    <div className="comparison-table-scroll">
      <table className="comparison-year-table">
        <thead>
          <tr>
            <th>Age</th>
            <th>Current plan</th>
            <th>Comparison plan</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.age}>
              <th scope="row">{row.age}</th>
              <td>{row.baseline === undefined ? "—" : formatCurrency(row.baseline)}</td>
              <td>{row.alternative === undefined ? "—" : formatCurrency(row.alternative)}</td>
              <td className={getDifferenceClass(row.difference)}>
                {row.difference === undefined ? "—" : formatSignedCurrency(row.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ScenarioEditorsProps {
  baselineInputs: PensionInputs;
  alternativeInputs: PensionInputs;
  baselineScenario: ProjectionScenario;
  alternativeScenario: ProjectionScenario;
  onBaselineChange: (inputs: PensionInputs) => void;
  onAlternativeChange: (inputs: PensionInputs) => void;
  onResetBaseline: () => void;
  onResetAlternative: () => void;
  open?: boolean;
}

function ScenarioEditors({
  baselineInputs,
  alternativeInputs,
  baselineScenario,
  alternativeScenario,
  onBaselineChange,
  onAlternativeChange,
  onResetBaseline,
  onResetAlternative,
  open = false,
}: ScenarioEditorsProps) {
  return (
    <details className="retirement-dashboard-details comparison-editor-details" open={open}>
      <summary>Edit scenario assumptions</summary>
      <section className="scenario-input-grid retirement-comparison-inputs">
        <div className="scenario-input-column">
          <div className="scenario-input-heading"><span>Baseline</span><h2>Current plan</h2></div>
          <PensionInputsForm
            idPrefix="current"
            value={baselineInputs}
            errors={baselineScenario.errors}
            onChange={onBaselineChange}
            onReset={onResetBaseline}
          />
        </div>
        <div className="scenario-input-column">
          <div className="scenario-input-heading"><span>Alternative</span><h2>Comparison plan</h2></div>
          <PensionInputsForm
            idPrefix="comparison"
            value={alternativeInputs}
            errors={alternativeScenario.errors}
            onChange={onAlternativeChange}
            onReset={onResetAlternative}
          />
        </div>
      </section>
    </details>
  );
}

function createComparison(
  baselineInputs: PensionInputs,
  alternativeInputs: PensionInputs,
  baseline: ProjectionResult,
  alternative: ProjectionResult,
): ComparisonModel {
  const yearRows = createYearRows(baseline.years, alternative.years);
  const crossover = yearRows.find(
    (row) => row.difference !== undefined && row.difference > 0,
  );

  return {
    retirementAgeDifference: alternativeInputs.retirementAge - baselineInputs.retirementAge,
    finalBalanceDifference: alternative.finalBalance.nominal - baseline.finalBalance.nominal,
    realBalanceDifference: alternative.finalBalance.real - baseline.finalBalance.real,
    contributionDifference:
      alternative.totalContributions.nominal - baseline.totalContributions.nominal,
    growthDifference:
      alternative.totalInvestmentGrowth.nominal - baseline.totalInvestmentGrowth.nominal,
    feeDifference: alternative.totalFees.nominal - baseline.totalFees.nominal,
    crossoverAge: crossover?.age,
    yearRows,
  };
}

function createYearRows(
  baselineYears: ProjectionYear[],
  alternativeYears: ProjectionYear[],
): YearComparisonRow[] {
  const rows = new Map<number, YearComparisonRow>();
  for (const year of baselineYears) {
    const age = year.age + 1;
    rows.set(age, { ...rows.get(age), age, baseline: year.closingBalance.nominal });
  }
  for (const year of alternativeYears) {
    const age = year.age + 1;
    rows.set(age, { ...rows.get(age), age, alternative: year.closingBalance.nominal });
  }
  return Array.from(rows.values())
    .sort((a, b) => a.age - b.age)
    .map((row) => ({
      ...row,
      difference:
        row.baseline === undefined || row.alternative === undefined
          ? undefined
          : row.alternative - row.baseline,
    }));
}

function normaliseValue(value: PensionInputs[AssumptionKey]): string {
  return value === undefined || Number.isNaN(value) ? "" : String(value);
}
function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? "Not set" : String(value);
}
function formatOptionalCurrency(value: number | undefined): string {
  return value === undefined ? "Not set" : formatCurrency(value);
}
function formatOptionalPercentage(value: number | undefined): string {
  return value === undefined ? "Not set" : formatPercentage(value);
}
function formatCurrencyDifference(baseline: number | undefined, alternative: number | undefined): string {
  return formatSignedCurrency((alternative ?? 0) - (baseline ?? 0));
}
function formatYearDifference(baseline: number | undefined, alternative: number | undefined): string {
  const difference = (alternative ?? 0) - (baseline ?? 0);
  if (difference === 0) return "No change";
  return `${difference > 0 ? "+" : ""}${difference} ${pluralise("year", Math.abs(difference))}`;
}
function formatPercentagePointDifference(baseline: number | undefined, alternative: number | undefined): string {
  const difference = ((alternative ?? 0) - (baseline ?? 0)) * 100;
  if (Math.abs(difference) < 0.001) return "No change";
  return `${difference > 0 ? "+" : ""}${difference.toFixed(2)} pp`;
}
function formatGenericDifference(baseline: number | undefined, alternative: number | undefined): string {
  const difference = (alternative ?? 0) - (baseline ?? 0);
  return `${difference > 0 ? "+" : ""}${difference}`;
}
function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return "No change";
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}
function formatAbsoluteCurrency(value: number): string {
  return formatCurrency(Math.abs(value));
}
function pluralise(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
function getPositiveDirection(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}
function getLowerIsLifestyleDirection(value: number): "lifestyle" | "neutral" {
  return value === 0 ? "neutral" : "lifestyle";
}
function getDifferenceClass(value: number | undefined): string | undefined {
  if (value === undefined || value === 0) return undefined;
  return value > 0 ? "comparison-value-positive" : "comparison-value-negative";
}
