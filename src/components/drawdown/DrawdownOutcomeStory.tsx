import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { AppIcons } from "../../icons";
import { toDisplayValue, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownOutcomeStoryProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

export function DrawdownOutcomeStory({
  inputs,
  result,
  displayMode,
}: DrawdownOutcomeStoryProps) {
  const shortfallAge =
    inputs.incomeTargetMode === "net"
      ? result.firstNetIncomeShortfallAge
      : result.firstShortfallAge;
  const lastsThroughPlan = result.depletionAge === null && shortfallAge === null;
  const finalBalance = toDisplayValue(
    result.finalBalance,
    Math.max(0, result.years.length - 1),
    inputs.inflationRate,
    displayMode,
  );
  const displayYears = result.years.map((year, index) => ({
    ...year,
    closingBalance: toDisplayValue(
      year.closingBalance,
      index,
      inputs.inflationRate,
      displayMode,
    ),
  }));
  const statePensionShare =
    result.totalDesiredIncome <= 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (result.totalStatePensionIncome / result.totalDesiredIncome) * 100,
          ),
        );
  const phases = inputs.spendingPhases?.length
    ? inputs.spendingPhases
    : [
        {
          startAge: inputs.retirementAge,
          annualIncome: inputs.desiredAnnualIncome,
          label: "Retirement income",
        },
      ];

  return (
    <section
      className="drawdown-outcome-story"
      aria-labelledby="drawdown-story-title"
    >
      <article
        className={`drawdown-conclusion-card${
          lastsThroughPlan ? " is-positive" : " is-warning"
        }`}
      >
        <span className="drawdown-conclusion-icon" aria-hidden="true">
          <FontAwesomeIcon
            icon={lastsThroughPlan ? AppIcons.success : AppIcons.warning}
          />
        </span>
        <div>
          <p className="panel-eyebrow">Plain-English conclusion</p>
          <h3 id="drawdown-story-title">
            {lastsThroughPlan
              ? `The plan supports the selected income through age ${inputs.endAge}`
              : shortfallAge !== null
                ? `The first illustrated income shortfall begins at age ${shortfallAge}`
                : `The pension is illustrated to run out at age ${result.depletionAge}`}
          </h3>
          <p>
            {lastsThroughPlan
              ? `The pension remains above £0 throughout the planning horizon, with ${formatCurrency(finalBalance)} left at age ${inputs.endAge}.`
              : "Review the income phases, State Pension timing and tax-free cash choice below to understand the pressure on the plan."}
          </p>
        </div>
      </article>

      <div className="drawdown-story-metrics">
        <StoryMetric
          label="Pension longevity"
          value={
            result.depletionAge === null
              ? `Beyond age ${inputs.endAge}`
              : `To age ${result.depletionAge}`
          }
          detail={
            result.depletionAge === null
              ? "No depletion in the model"
              : `${Math.max(
                  0,
                  result.depletionAge - inputs.retirementAge,
                )} retirement years`
          }
        />
        <StoryMetric
          label="State Pension contribution"
          value={
            inputs.annualStatePension > 0
              ? `${statePensionShare}% of target income`
              : "Not included"
          }
          detail={
            inputs.annualStatePension > 0
              ? `Starts at age ${inputs.statePensionAge}`
              : "Private pension carries the full target"
          }
        />
        <StoryMetric
          label="Tax-free cash"
          value={formatCurrency(result.taxFreeCashTaken)}
          detail={`${formatCurrency(
            result.balanceAfterTaxFreeCash,
          )} remains for income`}
        />
        <StoryMetric
          label="Lowest planned balance"
          value={formatCurrency(
            Math.min(
              result.balanceAfterTaxFreeCash,
              ...displayYears.map((year) => year.closingBalance),
            ),
          )}
          detail={
            displayMode === "today"
              ? "Shown in today's money"
              : "Shown in future pounds"
          }
        />
      </div>

      <section
        className="drawdown-phase-story"
        aria-labelledby="drawdown-phase-story-title"
      >
        <div>
          <p className="panel-eyebrow">Retirement spending phases</p>
          <h3 id="drawdown-phase-story-title">
            How the income target changes with age
          </h3>
          <p>
            A flat target is used unless phases are saved in the active plan.
            Each phase remains in force until the next one begins.
          </p>
        </div>
        <div className="drawdown-phase-grid">
          {phases.map((phase, index) => {
            const nextAge = phases[index + 1]?.startAge ?? inputs.endAge;
            return (
              <article key={`${phase.startAge}-${phase.label}`}>
                <span>
                  Age {phase.startAge}–
                  {Math.max(phase.startAge, nextAge - 1)}
                </span>
                <strong>{formatCurrency(phase.annualIncome)}/year</strong>
                <small>{phase.label}</small>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function StoryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
