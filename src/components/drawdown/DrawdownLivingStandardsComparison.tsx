import { useMemo } from "react";

import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../../domain/scenarios";
import { DrawdownEngine } from "../../engine/drawdown/DrawdownEngine";
import { calculateSustainableTargetIncome } from "../../engine/drawdown/calculateSustainableTargetIncome";
import { createLivingStandardsProgression } from "../../engine/drawdown/createLivingStandardsProgression";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import {
  getRetirementLivingStandards,
  RETIREMENT_LIVING_STANDARDS_2026,
  type RetirementLivingStandardHousehold,
  type RetirementLivingStandardLevel,
  type RetirementLivingStandardRegion,
} from "../../engine/drawdown/retirementLivingStandards";
import { formatCurrency } from "../../utils/formatters";

const drawdownEngine = new DrawdownEngine();

interface DrawdownLivingStandardsComparisonProps {
  inputs: DrawdownInputs;
  drawdown?: ScenarioDrawdownPreferences;
  onChange: (drawdown: ScenarioDrawdownPreferences) => void;
}

export function DrawdownLivingStandardsComparison({
  inputs,
  drawdown,
  onChange,
}: DrawdownLivingStandardsComparisonProps) {
  const preferences = drawdown ?? createDefaultScenarioDrawdownPreferences();
  const household = preferences.retirementLivingStandardsHousehold ?? "one-person";
  const region = preferences.retirementLivingStandardsRegion ?? "uk";
  const standards = getRetirementLivingStandards(household, region);

  const currentPlan = useMemo(() => drawdownEngine.calculate(inputs), [inputs]);
  const targetNetSpending = currentPlan.years[0]?.netIncome ?? 0;
  const sustainableNetIncome = useMemo(
    () =>
      calculateSustainableTargetIncome({
        ...inputs,
        withdrawalStrategy: "target-income",
        incomeTargetMode: "net",
      }),
    [inputs],
  );
  const progression = createLivingStandardsProgression(
    targetNetSpending,
    sustainableNetIncome,
    standards,
  );

  function updateHousehold(next: RetirementLivingStandardHousehold) {
    onChange({ ...preferences, retirementLivingStandardsHousehold: next });
  }

  function updateRegion(next: RetirementLivingStandardRegion) {
    onChange({ ...preferences, retirementLivingStandardsRegion: next });
  }

  return (
    <section
      className="panel drawdown-living-standards-panel"
      aria-labelledby="living-standards-title"
    >
      <div className="drawdown-section-heading">
        <div>
          <p className="panel-eyebrow">Lifestyle benchmark</p>
          <h2 id="living-standards-title">How does your plan compare?</h2>
        </div>
        <p>
          Put your target and sustainable spending in context using the 2026
          Retirement Living Standards from Pensions UK.
        </p>
      </div>

      <div className="scenario-edit-grid">
        <div className="form-field">
          <span className="form-field-label">Household</span>
          <div
            className="income-target-toggle"
            role="group"
            aria-label="Retirement household"
          >
            <button
              type="button"
              className={
                household === "one-person"
                  ? "income-target-option income-target-option-active"
                  : "income-target-option"
              }
              aria-pressed={household === "one-person"}
              onClick={() => updateHousehold("one-person")}
            >
              One person
            </button>
            <button
              type="button"
              className={
                household === "two-person"
                  ? "income-target-option income-target-option-active"
                  : "income-target-option"
              }
              aria-pressed={household === "two-person"}
              onClick={() => updateHousehold("two-person")}
            >
              Two people
            </button>
          </div>
        </div>

        <div className="form-field">
          <span className="form-field-label">Area</span>
          <div
            className="income-target-toggle"
            role="group"
            aria-label="Retirement area"
          >
            <button
              type="button"
              className={
                region === "uk"
                  ? "income-target-option income-target-option-active"
                  : "income-target-option"
              }
              aria-pressed={region === "uk"}
              onClick={() => updateRegion("uk")}
            >
              UK
            </button>
            <button
              type="button"
              className={
                region === "london"
                  ? "income-target-option income-target-option-active"
                  : "income-target-option"
              }
              aria-pressed={region === "london"}
              onClick={() => updateRegion("london")}
            >
              London
            </button>
          </div>
        </div>
      </div>

      <div className="drawdown-lifestyle-progression" aria-label="Retirement spending progression">
        <ProgressionCard
          label="Your target spending"
          value={formatCurrency(progression.targetSpending)}
          detail="Estimated net spending from the current retirement target."
        />
        <ProgressionCard
          label="Sustainable spending"
          value={formatCurrency(progression.sustainableSpending)}
          detail={`Illustrated annual spending supported to age ${inputs.endAge}.`}
        />
        <ProgressionCard
          label="Living Standard supported"
          value={
            progression.supportedLevel
              ? levelLabel(progression.supportedLevel)
              : "Below Minimum"
          }
          detail={
            progression.supportedAmount === null
              ? `The Minimum benchmark is ${formatCurrency(standards.minimum)}.`
              : `${formatCurrency(progression.supportedAmount)} annual benchmark.`
          }
        />
      </div>

      <div className="drawdown-lifestyle-story">
        <div>
          <span className="drawdown-decision-label">Your target</span>
          <strong>
            {progression.targetHeadroom >= 0
              ? `${formatCurrency(progression.targetHeadroom)} annual headroom`
              : `${formatCurrency(Math.abs(progression.targetHeadroom))} annual shortfall`}
          </strong>
          <p>
            {progression.targetHeadroom >= 0
              ? `The illustration supports your current ${formatCurrency(progression.targetSpending)} net spending target to age ${inputs.endAge}.`
              : `Your current ${formatCurrency(progression.targetSpending)} net spending target is above the illustrated sustainable level.`}
          </p>
        </div>

        <div>
          <span className="drawdown-decision-label">Lifestyle context</span>
          <strong>
            {progression.supportedLevel
              ? `${levelLabel(progression.supportedLevel)} lifestyle supported`
              : "Minimum benchmark not yet supported"}
          </strong>
          <p>{createLifestyleContext(progression, standards.minimum)}</p>
        </div>
      </div>

      <div className="drawdown-benchmark-grid" aria-label="2026 Retirement Living Standards">
        <Benchmark
          level="Minimum"
          amount={standards.minimum}
          sustainableIncome={sustainableNetIncome}
        />
        <Benchmark
          level="Moderate"
          amount={standards.moderate}
          sustainableIncome={sustainableNetIncome}
        />
        <Benchmark
          level="Comfortable"
          amount={standards.comfortable}
          sustainableIncome={sustainableNetIncome}
        />
      </div>

      <p className="scenario-tax-free-cash-note">
        These figures are annual expenditure benchmarks, not gross income targets.
        They assume the household owns its home outright, so rent or mortgage costs
        should be added where relevant. They are illustrative benchmarks rather
        than personalised financial advice. Source:{" "}
        <a
          href={RETIREMENT_LIVING_STANDARDS_2026.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {RETIREMENT_LIVING_STANDARDS_2026.sourceName}
        </a>.
      </p>
    </section>
  );
}

function ProgressionCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="drawdown-decision-card">
      <span className="drawdown-decision-label">{label}</span>
      <strong className="drawdown-decision-value">{value}</strong>
      <small className="drawdown-decision-detail">{detail}</small>
    </article>
  );
}

function Benchmark({
  level,
  amount,
  sustainableIncome,
}: {
  level: string;
  amount: number;
  sustainableIncome: number;
}) {
  const difference = sustainableIncome - amount;
  const reached = difference >= 0;

  return (
    <article className="drawdown-benchmark-card">
      <span>{level}</span>
      <strong>{formatCurrency(amount)}</strong>
      <small>
        {reached
          ? `${formatCurrency(difference)} annual headroom`
          : `${formatCurrency(Math.abs(difference))} below benchmark`}
      </small>
    </article>
  );
}

function levelLabel(level: RetirementLivingStandardLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function createLifestyleContext(
  progression: ReturnType<typeof createLivingStandardsProgression>,
  minimumBenchmark: number,
): string {
  if (progression.nextLevel && progression.nextAmount !== null) {
    return `Reaching the ${levelLabel(progression.nextLevel)} benchmark of ${formatCurrency(progression.nextAmount)} would require approximately ${formatCurrency(progression.nextLevelGap)} more sustainable annual spending.`;
  }

  if (progression.supportedLevel === "comfortable") {
    return `The illustrated sustainable spending is above the Comfortable benchmark, with ${formatCurrency(progression.sustainableSpending - (progression.supportedAmount ?? 0))} annual headroom above it.`;
  }

  return `The Minimum benchmark is ${formatCurrency(minimumBenchmark)}, which is ${formatCurrency(Math.max(0, minimumBenchmark - progression.sustainableSpending))} above the illustrated sustainable spending.`;
}
