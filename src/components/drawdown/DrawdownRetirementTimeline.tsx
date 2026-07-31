import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownRetirementTimelineProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

interface TimelineEvent {
  age: number;
  title: string;
  value: string;
  detail: string;
  tone: "start" | "income" | "warning" | "finish";
}

export function DrawdownRetirementTimeline({
  inputs,
  result,
  inflationRate,
  displayMode,
}: DrawdownRetirementTimelineProps) {
  const years = getDisplayYears(result.years, inflationRate, displayMode);
  const firstYear = years[0];
  const finalYear = years.at(-1);
  const statePensionYear = years.find((year) => year.age >= inputs.statePensionAge && year.statePensionIncome > 0);
  const shortfallYear = years.find((year) => (
    result.incomeTargetMode === "net" ? year.netIncomeShortfall > 0 : year.incomeShortfall > 0
  ));

  const events: TimelineEvent[] = [];

  if (firstYear) {
    events.push({
      age: firstYear.age,
      title: "Retirement begins",
      value: formatCurrency(firstYear.openingBalance),
      detail: result.taxFreeCashTaken > 0
        ? `${formatCurrency(result.taxFreeCashTaken)} tax-free cash taken before drawdown`
        : "Pension enters the drawdown phase",
      tone: "start",
    });
  }

  if (statePensionYear) {
    events.push({
      age: statePensionYear.age,
      title: "State Pension begins",
      value: `${formatCurrency(statePensionYear.statePensionIncome)}/year`,
      detail: `Pension withdrawal falls to ${formatCurrency(statePensionYear.pensionWithdrawal)} in this year`,
      tone: "income",
    });
  }

  if (shortfallYear) {
    const shortfall = result.incomeTargetMode === "net"
      ? shortfallYear.netIncomeShortfall
      : shortfallYear.incomeShortfall;
    events.push({
      age: shortfallYear.age,
      title: "First income shortfall",
      value: formatCurrency(shortfall),
      detail: `The selected ${result.incomeTargetMode} income target is no longer fully funded`,
      tone: "warning",
    });
  } else if (result.depletionAge !== null) {
    events.push({
      age: result.depletionAge,
      title: "Pension depleted",
      value: formatCurrency(0),
      detail: "Future income is then limited to non-pension sources in the model",
      tone: "warning",
    });
  }

  if (finalYear) {
    events.push({
      age: inputs.endAge,
      title: "Planning horizon",
      value: formatCurrency(finalYear.closingBalance),
      detail: shortfallYear ? "Review the later-life income gap" : "Income target remains funded through the modelled period",
      tone: "finish",
    });
  }

  const uniqueEvents = events.filter((event, index) => (
    events.findIndex((candidate) => candidate.age === event.age && candidate.title === event.title) === index
  ));

  return (
    <section className="panel drawdown-timeline" aria-labelledby="drawdown-timeline-heading">
      <div className="panel-heading dashboard-panel-heading">
        <div>
          <p className="panel-eyebrow">Key milestones</p>
          <h2 id="drawdown-timeline-heading">Retirement timeline</h2>
          <p>Follow the major events in the drawdown plan without opening the full year-by-year table.</p>
        </div>
      </div>

      <ol className="drawdown-timeline-track">
        {uniqueEvents.map((event) => (
          <li key={`${event.age}-${event.title}`} className={`drawdown-timeline-event drawdown-timeline-${event.tone}`}>
            <div className="drawdown-timeline-marker" aria-hidden="true" />
            <div className="drawdown-timeline-card">
              <span className="drawdown-timeline-age">Age {event.age}</span>
              <h3>{event.title}</h3>
              <strong>{event.value}</strong>
              <p>{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
