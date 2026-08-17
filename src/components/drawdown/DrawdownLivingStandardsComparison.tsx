import { useMemo } from "react";

import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import { calculateSustainableTargetIncome } from "../../engine/drawdown/calculateSustainableTargetIncome";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import {
  getRetirementLivingStandards,
  RETIREMENT_LIVING_STANDARDS_2026,
  type RetirementLivingStandardHousehold,
  type RetirementLivingStandardRegion,
} from "../../engine/drawdown/retirementLivingStandards";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownLivingStandardsComparisonProps {
  inputs: DrawdownInputs;
  drawdown: ScenarioDrawdownPreferences;
  onChange: (drawdown: ScenarioDrawdownPreferences) => void;
}

export function DrawdownLivingStandardsComparison({
  inputs,
  drawdown,
  onChange,
}: DrawdownLivingStandardsComparisonProps) {
  const household = drawdown.retirementLivingStandardsHousehold ?? "one-person";
  const region = drawdown.retirementLivingStandardsRegion ?? "uk";
  const standards = getRetirementLivingStandards(household, region);

  const sustainableNetIncome = useMemo(
    () =>
      calculateSustainableTargetIncome({
        ...inputs,
        withdrawalStrategy: "target-income",
        incomeTargetMode: "net",
      }),
    [inputs],
  );

  const supportedLevel =
    sustainableNetIncome >= standards.comfortable
      ? "Comfortable"
      : sustainableNetIncome >= standards.moderate
        ? "Moderate"
        : sustainableNetIncome >= standards.minimum
          ? "Minimum"
          : "Below Minimum";

  function updateHousehold(next: RetirementLivingStandardHousehold) {
    onChange({ ...drawdown, retirementLivingStandardsHousehold: next });
  }

  function updateRegion(next: RetirementLivingStandardRegion) {
    onChange({ ...drawdown, retirementLivingStandardsRegion: next });
  }

  return (
    <section className="panel drawdown-living-standards-panel" aria-labelledby="living-standards-title">
      <div className="drawdown-section-heading">
        <div>
          <p className="panel-eyebrow">Lifestyle benchmark</p>
          <h2 id="living-standards-title">How does your plan compare?</h2>
        </div>
        <p>
          Compare sustainable net spending with the 2026 Retirement Living
          Standards from Pensions UK.
        </p>
      </div>

      <div className="scenario-edit-grid">
        <div className="form-field">
          <span className="form-field-label">Household</span>
          <div className="income-target-toggle" role="group" aria-label="Retirement household">
            <button
              type="button"
              className={household === "one-person" ? "income-target-option income-target-option-active" : "income-target-option"}
              aria-pressed={household === "one-person"}
              onClick={() => updateHousehold("one-person")}
            >
              One person
            </button>
            <button
              type="button"
              className={household === "two-person" ? "income-target-option income-target-option-active" : "income-target-option"}
              aria-pressed={household === "two-person"}
              onClick={() => updateHousehold("two-person")}
            >
              Two people
            </button>
          </div>
        </div>

        <div className="form-field">
          <span className="form-field-label">Area</span>
          <div className="income-target-toggle" role="group" aria-label="Retirement area">
            <button
              type="button"
              className={region === "uk" ? "income-target-option income-target-option-active" : "income-target-option"}
              aria-pressed={region === "uk"}
              onClick={() => updateRegion("uk")}
            >
              UK
            </button>
            <button
              type="button"
              className={region === "london" ? "income-target-option income-target-option-active" : "income-target-option"}
              aria-pressed={region === "london"}
              onClick={() => updateRegion("london")}
            >
              London
            </button>
          </div>
        </div>
      </div>

      <div className="drawdown-summary-grid">
        <article>
          <span>Sustainable net spending</span>
          <strong>{formatCurrency(sustainableNetIncome)}</strong>
          <small>Annual spending supported to age {inputs.endAge}</small>
        </article>
        <article>
          <span>Benchmark reached</span>
          <strong>{supportedLevel}</strong>
          <small>{household === "one-person" ? "One-person" : "Two-person"} household · {region === "london" ? "London" : "UK"}</small>
        </article>
      </div>

      <div className="drawdown-summary-grid" aria-label="2026 Retirement Living Standards">
        <Benchmark level="Minimum" amount={standards.minimum} sustainableIncome={sustainableNetIncome} />
        <Benchmark level="Moderate" amount={standards.moderate} sustainableIncome={sustainableNetIncome} />
        <Benchmark level="Comfortable" amount={standards.comfortable} sustainableIncome={sustainableNetIncome} />
      </div>

      <p className="scenario-tax-free-cash-note">
        These figures are annual expenditure benchmarks, not gross income targets.
        They assume the household owns its home outright, so rent or mortgage costs
        should be added where relevant. They are illustrative benchmarks rather
        than personalised financial advice. Source: {" "}
        <a href={RETIREMENT_LIVING_STANDARDS_2026.sourceUrl} target="_blank" rel="noreferrer">
          {RETIREMENT_LIVING_STANDARDS_2026.sourceName}
        </a>.
      </p>
    </section>
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
    <article>
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
