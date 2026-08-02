import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { AppIcon } from "../../icons";
import { AppIcons } from "../../icons";
import {
  getDisplaySummary,
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownRetirementJourneyProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

interface JourneyEvent {
  key: string;
  age: number;
  title: string;
  description: string;
  value?: string;
  icon: AppIcon;
  tone?: "positive" | "warning" | "neutral";
}

export function DrawdownRetirementJourney({
  inputs,
  result,
  displayMode,
}: DrawdownRetirementJourneyProps) {
  const displayYears = getDisplayYears(
    result.years,
    inputs.inflationRate,
    displayMode,
  );
  const displaySummary = getDisplaySummary(
    result,
    inputs.inflationRate,
    displayMode,
  );
  const shortfallAge =
    inputs.incomeTargetMode === "net"
      ? result.firstNetIncomeShortfallAge
      : result.firstShortfallAge;
  const health = getRetirementHealth(result.depletionAge, shortfallAge);
  const lowestBalanceYear = displayYears.reduce(
    (lowest, year) =>
      lowest === null || year.closingBalance < lowest.closingBalance
        ? year
        : lowest,
    null as (typeof displayYears)[number] | null,
  );
  const largestWithdrawalYear = displayYears.reduce(
    (largest, year) =>
      largest === null || year.pensionWithdrawal > largest.pensionWithdrawal
        ? year
        : largest,
    null as (typeof displayYears)[number] | null,
  );
  const events = createJourneyEvents(inputs, result, displayMode);

  return (
    <section
      className="drawdown-retirement-journey"
      aria-labelledby="retirement-journey-title"
    >
      <header className="drawdown-journey-heading">
        <div>
          <p className="panel-eyebrow">Your retirement journey</p>
          <h3 id="retirement-journey-title">
            What retirement could look like
          </h3>
          <p>
            Follow the important changes from retirement through to the end of
            the planning horizon.
          </p>
        </div>
        <span className={`drawdown-health-badge is-${health.tone}`}>
          <FontAwesomeIcon icon={health.icon} aria-hidden="true" />
          {health.label}
        </span>
      </header>

      <ol className="drawdown-journey-timeline">
        {events.map((event) => (
          <li key={event.key} className={`is-${event.tone ?? "neutral"}`}>
            <div className="drawdown-journey-age">
              <strong>{event.age}</strong>
              <span>Age</span>
            </div>
            <span className="drawdown-journey-marker" aria-hidden="true">
              <FontAwesomeIcon icon={event.icon} fixedWidth />
            </span>
            <article>
              <div>
                <h4>{event.title}</h4>
                {event.value && <strong>{event.value}</strong>}
              </div>
              <p>{event.description}</p>
            </article>
          </li>
        ))}
      </ol>

      <div className="drawdown-journey-story-grid">
        <article className="drawdown-retirement-story">
          <p className="panel-eyebrow">Your retirement story</p>
          <h3>{health.heading}</h3>
          <p>{createRetirementStory(inputs, result, displaySummary.finalBalance)}</p>
        </article>

        <article className={`drawdown-retirement-health is-${health.tone}`}>
          <span className="drawdown-retirement-health-icon" aria-hidden="true">
            <FontAwesomeIcon icon={health.icon} />
          </span>
          <div>
            <p className="panel-eyebrow">Retirement health</p>
            <h3>{health.label}</h3>
            <div
              className="drawdown-health-stars"
              aria-label={`${health.stars} out of 5 retirement health rating`}
            >
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className={index < health.stars ? "is-filled" : ""}>
                  ★
                </span>
              ))}
            </div>
            <p>{health.description}</p>
          </div>
        </article>
      </div>

      <section className="drawdown-milestones" aria-labelledby="drawdown-milestones-title">
        <div>
          <p className="panel-eyebrow">Key milestones</p>
          <h3 id="drawdown-milestones-title">The moments worth noticing</h3>
        </div>
        <div className="drawdown-milestone-grid">
          <Milestone
            icon={AppIcons.money}
            label="Tax-free cash"
            value={formatCurrency(displaySummary.taxFreeCashTaken)}
            detail={
              displaySummary.taxFreeCashTaken > 0
                ? "Taken when retirement begins"
                : "No tax-free cash selected"
            }
          />
          <Milestone
            icon={AppIcons.pension}
            label="State Pension"
            value={
              inputs.annualStatePension > 0
                ? `From age ${inputs.statePensionAge}`
                : "Not included"
            }
            detail={
              inputs.annualStatePension > 0
                ? `${formatCurrency(inputs.annualStatePension)}/year initially`
                : "Private pension provides the modelled income"
            }
          />
          <Milestone
            icon={AppIcons.wallet}
            label="Largest pension withdrawal"
            value={
              largestWithdrawalYear
                ? formatCurrency(largestWithdrawalYear.pensionWithdrawal)
                : formatCurrency(0)
            }
            detail={
              largestWithdrawalYear
                ? `Illustrated at age ${largestWithdrawalYear.age}`
                : "No pension withdrawal modelled"
            }
          />
          <Milestone
            icon={AppIcons.chartLine}
            label="Lowest pension balance"
            value={
              lowestBalanceYear
                ? formatCurrency(lowestBalanceYear.closingBalance)
                : formatCurrency(displaySummary.finalBalance)
            }
            detail={
              lowestBalanceYear
                ? `Illustrated at age ${lowestBalanceYear.age}`
                : `At age ${inputs.endAge}`
            }
          />
        </div>
      </section>
    </section>
  );
}

function createJourneyEvents(
  inputs: DrawdownInputs,
  result: DrawdownResult,
  displayMode: MoneyDisplayMode,
): JourneyEvent[] {
  const phases = inputs.spendingPhases?.length
    ? inputs.spendingPhases
    : [
        {
          startAge: inputs.retirementAge,
          annualIncome: inputs.desiredAnnualIncome,
          label: "Retirement income",
        },
      ];
  const events: JourneyEvent[] = [
    {
      key: "retirement",
      age: inputs.retirementAge,
      title: "Retirement begins",
      value: `${formatCurrency(phases[0]?.annualIncome ?? inputs.desiredAnnualIncome)}/year`,
      description:
        result.taxFreeCashTaken > 0
          ? `${formatCurrency(result.taxFreeCashTaken)} of tax-free cash is taken and the remaining pension begins supporting income.`
          : "The private pension begins supporting the selected retirement income.",
      icon: AppIcons.retirement,
      tone: "positive",
    },
  ];

  if (
    inputs.annualStatePension > 0 &&
    inputs.statePensionAge >= inputs.retirementAge &&
    inputs.statePensionAge < inputs.endAge
  ) {
    events.push({
      key: "state-pension",
      age: inputs.statePensionAge,
      title: "State Pension begins",
      value: `${formatCurrency(inputs.annualStatePension)}/year`,
      description:
        "State Pension begins contributing to income, reducing the amount required from the private pension.",
      icon: AppIcons.pension,
      tone: "positive",
    });
  }

  phases.slice(1).forEach((phase) => {
    events.push({
      key: `phase-${phase.startAge}-${phase.label}`,
      age: phase.startAge,
      title: phase.label,
      value: `${formatCurrency(phase.annualIncome)}/year`,
      description: "The saved retirement spending target changes from this age.",
      icon: AppIcons.money,
      tone: "neutral",
    });
  });

  const shortfallAge =
    inputs.incomeTargetMode === "net"
      ? result.firstNetIncomeShortfallAge
      : result.firstShortfallAge;

  if (shortfallAge !== null && shortfallAge < inputs.endAge) {
    events.push({
      key: "shortfall",
      age: shortfallAge,
      title: "Income shortfall begins",
      description:
        "The model can no longer provide the full selected income target from this point.",
      icon: AppIcons.warning,
      tone: "warning",
    });
  } else if (result.depletionAge !== null && result.depletionAge < inputs.endAge) {
    events.push({
      key: "depletion",
      age: result.depletionAge,
      title: "Private pension is depleted",
      description:
        "The illustrated pension balance reaches £0 before the end of the planning horizon.",
      icon: AppIcons.warning,
      tone: "warning",
    });
  }

  const finalBalance = result.years.at(-1)?.closingBalance ?? result.finalBalance;
  events.push({
    key: "planning-horizon",
    age: inputs.endAge,
    title: "Planning horizon",
    value:
      displayMode === "today"
        ? `${formatCurrency(finalBalance)}`
        : `${formatCurrency(result.finalBalance)}`,
    description:
      result.depletionAge === null
        ? "The illustration ends with a pension balance still remaining."
        : "The illustration ends after the private pension has been depleted.",
    icon: AppIcons.milestones,
    tone: result.depletionAge === null ? "positive" : "warning",
  });

  return events.sort((left, right) => left.age - right.age);
}

function createRetirementStory(
  inputs: DrawdownInputs,
  result: DrawdownResult,
  finalBalance: number,
): string {
  const phases = inputs.spendingPhases ?? [];
  const shortfallAge =
    inputs.incomeTargetMode === "net"
      ? result.firstNetIncomeShortfallAge
      : result.firstShortfallAge;
  const parts = [
    `You retire at age ${inputs.retirementAge} with an illustrated pension of ${formatCurrency(result.startingBalance)}.`,
  ];

  if (phases.length > 0) {
    parts.push(
      `Your planned income begins at ${formatCurrency(phases[0]?.annualIncome ?? inputs.desiredAnnualIncome)} a year and changes as your saved retirement phases begin.`,
    );
  } else {
    parts.push(
      `You plan to receive ${formatCurrency(inputs.desiredAnnualIncome)} a year throughout retirement.`,
    );
  }

  if (inputs.annualStatePension > 0) {
    parts.push(
      `At age ${inputs.statePensionAge}, State Pension starts and reduces the income required from your private pension.`,
    );
  }

  if (shortfallAge !== null) {
    parts.push(
      `The first illustrated income shortfall begins at age ${shortfallAge}.`,
    );
  } else if (result.depletionAge !== null) {
    parts.push(
      `The private pension is illustrated to run out at age ${result.depletionAge}.`,
    );
  } else {
    parts.push(
      `The selected income is supported through age ${inputs.endAge}, with around ${formatCurrency(finalBalance)} remaining at the end of the illustration.`,
    );
  }

  return parts.join(" ");
}

function getRetirementHealth(
  depletionAge: number | null,
  shortfallAge: number | null,
) {
  if (depletionAge === null && shortfallAge === null) {
    return {
      label: "Strong",
      heading: "The selected retirement income is supported throughout the plan",
      description:
        "No income shortfall or pension depletion is illustrated before the planning horizon.",
      stars: 5,
      tone: "positive" as const,
      icon: AppIcons.success,
    };
  }

  if (shortfallAge !== null) {
    return {
      label: "Needs attention",
      heading: `The income target becomes difficult to sustain from age ${shortfallAge}`,
      description:
        "Review the spending phases, retirement timing or income target before relying on this illustration.",
      stars: 2,
      tone: "warning" as const,
      icon: AppIcons.warning,
    };
  }

  return {
    label: "Monitor",
    heading: `The private pension is illustrated to run out at age ${depletionAge}`,
    description:
      "Income may become more dependent on State Pension or other resources later in retirement.",
    stars: 3,
    tone: "warning" as const,
    icon: AppIcons.warning,
  };
}

function Milestone({
  icon,
  label,
  value,
  detail,
}: {
  icon: AppIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article>
      <span aria-hidden="true">
        <FontAwesomeIcon icon={icon} fixedWidth />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}
