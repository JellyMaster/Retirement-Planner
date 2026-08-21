import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownBalanceStoryProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
  drawdown?: ScenarioDrawdownPreferences;
}

export function DrawdownBalanceStory({
  inputs,
  result,
  displayMode,
  drawdown,
}: DrawdownBalanceStoryProps) {
  const years = getDisplayYears(
    result.years,
    inputs.inflationRate,
    displayMode,
  );
  if (years.length === 0) return null;

  const firstFallingYear = years.find(
    (year) => year.closingBalance < year.openingBalance,
  );
  const lowest = years.reduce((best, year) =>
    year.closingBalance < best.closingBalance ? year : best,
  );
  const finalBalance = years.at(-1)?.closingBalance ?? result.finalBalance;
  const retirementOpeningBalance = years[0]?.openingBalance ?? 0;
  const remainingShare = retirementOpeningBalance > 0
    ? finalBalance / retirementOpeningBalance
    : 0;
  const reserveTarget = getReserveTarget(inputs, drawdown);
  const meetsReserveTarget = reserveTarget === null || finalBalance >= reserveTarget;
  const reserveAchievement = reserveTarget !== null && reserveTarget > 0
    ? finalBalance / reserveTarget
    : null;
  const lowestIsFinalYear = lowest.age === years.at(-1)?.age;

  return (
    <section className="drawdown-balance-story" aria-labelledby="drawdown-balance-story-title">
      <header>
        <div>
          <p className="panel-eyebrow">How your pension is working</p>
          <h3 id="drawdown-balance-story-title">The questions behind the balance chart</h3>
          <p>
            A pension balance does not need to rise every year to be doing its job. These answers help explain whether the projected balance is behaving in line with the plan.
          </p>
        </div>
        <span>{displayMode === "today" ? "Today’s money" : "Future money"}</span>
      </header>

      <div className="drawdown-balance-metrics">
        <Metric
          label="Does the private pension last?"
          value={result.depletionAge === null ? `Through age ${inputs.endAge}` : `Until age ${result.depletionAge}`}
          detail={result.depletionAge === null ? "It remains available throughout the plan." : "The private pension is fully used before the planning age."}
          tone={result.depletionAge === null ? "positive" : "warning"}
        />
        <Metric
          label="When does the balance first fall?"
          value={firstFallingYear ? `Age ${firstFallingYear.age}` : "Not in this plan"}
          detail={firstFallingYear
            ? "This is the first year the pension ends lower than it started. A falling balance can be a normal part of funding retirement."
            : "The illustrated balance does not finish a year lower than it started."}
          tone="neutral"
        />
        <Metric
          label="Lowest projected balance"
          value={formatCurrency(lowest.closingBalance)}
          detail={lowestIsFinalYear
            ? `Reached at age ${lowest.age}, at the end of the plan.`
            : `Reached at age ${lowest.age}; the projected balance is higher again later in the plan.`}
          tone={lowest.closingBalance > 0 ? "neutral" : "warning"}
        />
        <Metric
          label="Balance at the end of the plan"
          value={formatCurrency(finalBalance)}
          detail={retirementOpeningBalance > 0
            ? `${formatPercentage(remainingShare)} of the pension available at retirement remains at age ${inputs.endAge}.`
            : `At age ${inputs.endAge}.`}
          tone={finalBalance > 0 ? "positive" : "warning"}
        />
      </div>

      {reserveTarget !== null && (
        <div className={`drawdown-balance-reserve-summary ${meetsReserveTarget ? "is-positive" : "is-warning"}`}>
          <div>
            <span>Your ending-balance goal</span>
            <strong>{formatCurrency(reserveTarget)}</strong>
          </div>
          <div>
            <span>Projected at age {inputs.endAge}</span>
            <strong>{formatCurrency(finalBalance)}</strong>
          </div>
          <p>
            {meetsReserveTarget
              ? reserveAchievement === null
                ? "The current illustration finishes at or above the amount you asked to keep in the pension."
                : `The current illustration meets ${formatPercentage(reserveAchievement)} of your ending-balance goal and finishes at or above the amount you asked to keep.`
              : reserveAchievement === null
                ? `The current illustration finishes ${formatCurrency(reserveTarget - finalBalance)} below your target reserve.`
                : `The current illustration keeps ${formatPercentage(reserveAchievement)} of your target reserve and finishes ${formatCurrency(reserveTarget - finalBalance)} below the goal.`}
          </p>
        </div>
      )}

      <p className="drawdown-balance-story-note">
        A reducing balance is not automatically a warning. Your pension is there to help fund retirement; the key question is whether it can provide the planned income for long enough and still meet any amount you want to keep at the end.
      </p>
    </section>
  );
}

function getReserveTarget(
  inputs: DrawdownInputs,
  drawdown?: ScenarioDrawdownPreferences,
): number | null {
  const mode = drawdown?.endingBalanceMode;
  const retirementPot = Math.max(0, inputs.startingBalance - inputs.taxFreeCash);

  if (mode === "spend-to-zero") return 0;
  if (mode === "preserve") return retirementPot;
  if (mode === "percentage") {
    return retirementPot * Math.min(1, Math.max(0, drawdown?.endingBalancePercentage ?? 0.5));
  }
  return null;
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "warning" | "neutral";
}) {
  return (
    <article className={`is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
