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
}

export function DrawdownBalanceStory({
  inputs,
  result,
  displayMode,
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
  const lowestIsFinalYear = lowest.age === years.at(-1)?.age;

  return (
    <section className="drawdown-balance-story" aria-labelledby="drawdown-balance-story-title">
      <header>
        <div>
          <p className="panel-eyebrow">How your pension is working</p>
          <h3 id="drawdown-balance-story-title">Understanding your pension balance</h3>
          <p>
            These key answers summarise what the balance story means for your retirement. They help you understand whether your pension is expected to last, how it changes over time and what remains at the end of your plan.
          </p>
        </div>
        <span>{displayMode === "today" ? "Today’s money" : "Future money"}</span>
      </header>

      <div className="drawdown-balance-metrics">
        <Metric
          label="Will your pension last?"
          value={result.depletionAge === null ? `Through age ${inputs.endAge}` : `Until age ${result.depletionAge}`}
          detail={result.depletionAge === null ? "It remains available throughout your plan." : "The private pension is fully used before the end of your plan."}
          tone={result.depletionAge === null ? "positive" : "warning"}
          primary
        />
        <Metric
          label="When does your pension first begin reducing?"
          value={firstFallingYear ? `Age ${firstFallingYear.age}` : "Not in this plan"}
          detail={firstFallingYear
            ? "This is the first year the pension ends lower than it started. A falling balance can be a normal part of funding retirement."
            : "The illustrated balance does not finish a year lower than it started."}
          tone="neutral"
        />
        <Metric
          label="Lowest projected pension balance"
          value={formatCurrency(lowest.closingBalance)}
          detail={lowestIsFinalYear
            ? `Reached at age ${lowest.age}, at the end of the plan.`
            : `Reached at age ${lowest.age}; the projected balance is higher again later in the plan.`}
          tone={lowest.closingBalance > 0 ? "neutral" : "warning"}
        />
        <Metric
          label="Money remaining at the end of your plan"
          value={formatCurrency(finalBalance)}
          detail={retirementOpeningBalance > 0
            ? `${formatPercentage(remainingShare)} of the pension available at retirement remains at age ${inputs.endAge}.`
            : `At age ${inputs.endAge}.`}
          tone={finalBalance > 0 ? "positive" : "warning"}
        />
      </div>

      <p className="drawdown-balance-story-note">
        <strong>A reducing pension isn&apos;t necessarily a problem.</strong>{" "}
        Your pension is there to help fund your retirement. The key question is whether it can continue providing the income you&apos;ve planned for the whole period you&apos;re planning for. A falling balance can therefore be an expected part of using your pension in retirement.
      </p>
    </section>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
  primary = false,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "warning" | "neutral";
  primary?: boolean;
}) {
  return (
    <article className={`is-${tone}${primary ? " is-primary" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
