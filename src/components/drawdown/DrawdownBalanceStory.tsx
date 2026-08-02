import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

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
  const highest = years.reduce((best, year) =>
    year.closingBalance > best.closingBalance ? year : best,
  );
  const lowest = years.reduce((best, year) =>
    year.closingBalance < best.closingBalance ? year : best,
  );
  const firstPressureYear = years.find(
    (year) => year.pensionWithdrawal + year.fees > year.investmentGrowth,
  );
  const periods = createBalancePeriods(years);

  return (
    <section
      className="drawdown-balance-story"
      aria-labelledby="drawdown-balance-story-title"
    >
      <header>
        <div>
          <p className="panel-eyebrow">Balance story</p>
          <h3 id="drawdown-balance-story-title">
            Why the pension rises or falls over time
          </h3>
          <p>
            The balance changes according to withdrawals, investment growth and
            fees in each retirement year.
          </p>
        </div>
        <span>{displayMode === "today" ? "Today’s money" : "Future money"}</span>
      </header>

      <div className="drawdown-balance-metrics">
        <Metric
          label="Highest balance"
          value={formatCurrency(highest.closingBalance)}
          detail={`Age ${highest.age}`}
        />
        <Metric
          label="Lowest balance"
          value={formatCurrency(lowest.closingBalance)}
          detail={`Age ${lowest.age}`}
        />
        <Metric
          label="Withdrawals exceed growth"
          value={firstPressureYear ? `Age ${firstPressureYear.age}` : "Not modelled"}
          detail={firstPressureYear ? "Including annual fees" : "Growth covers withdrawals and fees"}
        />
        <Metric
          label="Final balance"
          value={formatCurrency(years.at(-1)?.closingBalance ?? result.finalBalance)}
          detail={result.depletionAge === null ? `At age ${inputs.endAge}` : `Depleted at age ${result.depletionAge}`}
        />
      </div>

      <div className="drawdown-balance-periods">
        {periods.map((period) => (
          <article key={`${period.startAge}-${period.endAge}`}>
            <span>Age {period.startAge}–{period.endAge}</span>
            <h4>{period.title}</h4>
            <p>{period.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function createBalancePeriods(
  years: ReturnType<typeof getDisplayYears>,
): Array<{
  startAge: number;
  endAge: number;
  title: string;
  description: string;
}> {
  if (years.length === 0) return [];

  const groups: Array<{ start: number; end: number; underPressure: boolean }> = [];
  years.forEach((year, index) => {
    const underPressure =
      year.pensionWithdrawal + year.fees > year.investmentGrowth;
    const current = groups.at(-1);
    if (!current || current.underPressure !== underPressure) {
      groups.push({ start: index, end: index, underPressure });
    } else {
      current.end = index;
    }
  });

  return groups.slice(0, 4).map((group) => {
    const first = years[group.start];
    const last = years[group.end];
    const falls = last.closingBalance < first.openingBalance;

    return {
      startAge: first.age,
      endAge: last.age,
      title: group.underPressure
        ? falls
          ? "Withdrawals place pressure on the balance"
          : "Growth partly offsets retirement withdrawals"
        : "Investment growth covers withdrawals and fees",
      description: group.underPressure
        ? falls
          ? "Pension withdrawals and fees are greater than investment growth, so the illustrated balance reduces during this period."
          : "Withdrawals exceed annual growth in some years, although the balance remains broadly stable across the period."
        : "Investment growth is at least as high as pension withdrawals and fees, helping preserve or increase the balance.",
    };
  });
}

function Metric({
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
