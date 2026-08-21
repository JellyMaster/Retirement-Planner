import type { DrawdownYear } from "../../engine/drawdown";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { InfoTooltip } from "../ui";

interface DrawdownBalanceChartProps {
  years: DrawdownYear[];
  depletionAge: number | null;
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge?: number;
  onSelectAge?: (age: number) => void;
}

export function DrawdownBalanceChart({
  years,
  inflationRate,
  displayMode,
  selectedAge,
}: DrawdownBalanceChartProps) {
  if (years.length === 0) return null;

  const displayYears = getDisplayYears(years, inflationRate, displayMode);
  const selected =
    displayYears.find((year) => year.age === selectedAge) ?? displayYears[0];

  if (!selected) return null;

  const inflationEffect =
    displayMode === "today"
      ? selected.openingBalance
        + selected.investmentGrowth
        - selected.pensionWithdrawal
        - selected.fees
        - selected.closingBalance
      : 0;
  const moneyOut = selected.pensionWithdrawal + selected.fees;
  const withdrawalRate = selected.openingBalance > 0
    ? selected.pensionWithdrawal / selected.openingBalance
    : 0;
  const growthCoverage = moneyOut > 0
    ? selected.investmentGrowth / moneyOut
    : null;

  const movements = [
    {
      key: "growth",
      label: "Investment growth",
      value: selected.investmentGrowth,
      direction: "positive" as const,
      detail: growthCoverage === null
        ? undefined
        : `${formatPercentage(growthCoverage)} of withdrawals and fees replaced`,
      tooltipTitle: "Investment growth",
      tooltipText:
        "The amount your pension is projected to gain from investment returns during this year. It increases the pension balance.",
    },
    {
      key: "withdrawal",
      label: "Money taken out",
      value: selected.pensionWithdrawal,
      direction: "negative" as const,
      detail: `${formatPercentage(withdrawalRate)} of opening pension`,
      tooltipTitle: "Money taken out",
      tooltipText:
        "The amount withdrawn from your private pension to support your retirement income during this year. It reduces the pension balance.",
    },
    {
      key: "fees",
      label: "Fees",
      value: selected.fees,
      direction: "negative" as const,
      tooltipTitle: "Fees",
      tooltipText:
        "The estimated pension and investment charges applied during this year. Fees are paid from the pension and reduce the balance.",
    },
    ...(displayMode === "today"
      ? [
          {
            key: "inflation",
            label: "Effect of inflation",
            value: Math.abs(inflationEffect),
            direction: inflationEffect >= 0 ? ("negative" as const) : ("positive" as const),
            tooltipTitle: "Effect of inflation",
            tooltipText:
              "Today’s money adjusts the end-of-year balance for the loss of purchasing power caused by inflation. This does not represent money leaving your pension; it shows what the future balance is worth in today’s terms.",
          },
        ]
      : []),
  ];
  const largestMovement = Math.max(
    1,
    ...movements.map((movement) => Math.abs(movement.value)),
  );
  const balanceChange = selected.closingBalance - selected.openingBalance;
  const balanceChangeRate = selected.openingBalance > 0
    ? Math.abs(balanceChange) / selected.openingBalance
    : 0;

  return (
    <section className="panel drawdown-balance-waterfall" aria-labelledby="drawdown-balance-waterfall-title">
      <div className="panel-heading drawdown-balance-waterfall-heading">
        <div>
          <p className="panel-eyebrow">Balance movement</p>
          <h2 id="drawdown-balance-waterfall-title">
            What changed your pension this year?
          </h2>
          <p>
            Follow the money from the start of age {selected.age} to the end of the year.
            The middle bars are scaled against each other so you can quickly compare what
            moved the balance.
          </p>
        </div>
        <div className="drawdown-balance-waterfall-age" aria-label={`Selected age ${selected.age}`}>
          <span>Selected age</span>
          <strong>{selected.age}</strong>
          <small>{selected.year}</small>
        </div>
      </div>

      <div
        className={
          displayMode === "today"
            ? "drawdown-balance-waterfall-flow has-inflation-step"
            : "drawdown-balance-waterfall-flow"
        }
      >
        <WaterfallAnchor
          label="Started the year with"
          value={selected.openingBalance}
          tone="opening"
          tooltipTitle="Starting pension balance"
          tooltipText="The pension balance available at the start of this retirement year, before this year’s investment growth, withdrawals and fees are applied."
          tooltipAlign="left"
        />

        {movements.map((movement) => (
          <WaterfallMovement
            key={movement.key}
            label={movement.label}
            value={movement.value}
            direction={movement.direction}
            width={(Math.abs(movement.value) / largestMovement) * 100}
            detail={movement.detail}
            tooltipTitle={movement.tooltipTitle}
            tooltipText={movement.tooltipText}
          />
        ))}

        <WaterfallAnchor
          label="Finished the year with"
          value={selected.closingBalance}
          tone="closing"
          tooltipTitle="Ending pension balance"
          tooltipText={
            displayMode === "today"
              ? "The pension balance remaining at the end of this year, shown in today’s purchasing power. This becomes the starting balance for the next retirement year."
              : "The pension balance remaining at the end of this year. This becomes the starting balance for the next retirement year."
          }
          tooltipAlign="right"
        />
      </div>

      {displayMode === "today" && (
        <p className="drawdown-balance-waterfall-inflation-note">
          Today&apos;s money removes the effect of inflation. The inflation step bridges the
          year&apos;s cash movements to the end-of-year balance in today&apos;s purchasing power.
        </p>
      )}

      <div
        className={`drawdown-balance-waterfall-result ${balanceChange >= 0 ? "is-positive" : "is-reducing"}`}
      >
        <span>Overall change</span>
        <strong>
          {balanceChange >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(balanceChange))}
        </strong>
        <div className="drawdown-balance-waterfall-result-copy">
          <p>
            {balanceChange >= 0
              ? `Your pension finished the year ${formatPercentage(balanceChangeRate)} higher than it started.`
              : `Your pension finished the year ${formatPercentage(balanceChangeRate)} lower than it started. In retirement, that can be a normal part of using the money you have built up.`}
          </p>
          {growthCoverage !== null && (
            <small>
              Investment growth replaced {formatPercentage(growthCoverage)} of the money taken out and fees this year.
            </small>
          )}
        </div>
      </div>
    </section>
  );
}

function WaterfallAnchor({
  label,
  value,
  tone,
  tooltipTitle,
  tooltipText,
  tooltipAlign,
}: {
  label: string;
  value: number;
  tone: "opening" | "closing";
  tooltipTitle: string;
  tooltipText: string;
  tooltipAlign: "left" | "right";
}) {
  return (
    <article className={`drawdown-balance-waterfall-step is-${tone}`}>
      <WaterfallStepLabel
        label={label}
        tooltipTitle={tooltipTitle}
        tooltipText={tooltipText}
        tooltipAlign={tooltipAlign}
      />
      <strong>{formatCurrency(value)}</strong>
      <div className="drawdown-balance-waterfall-anchor-bar" aria-hidden="true" />
    </article>
  );
}

function WaterfallMovement({
  label,
  value,
  direction,
  width,
  detail,
  tooltipTitle,
  tooltipText,
}: {
  label: string;
  value: number;
  direction: "positive" | "negative";
  width: number;
  detail?: string;
  tooltipTitle: string;
  tooltipText: string;
}) {
  const safeWidth = Math.max(8, Math.min(100, width));
  const signedLabel = `${direction === "positive" ? "+" : "−"} ${label}`;

  return (
    <article className={`drawdown-balance-waterfall-step is-${direction}`}>
      <WaterfallStepLabel
        label={signedLabel}
        tooltipTitle={tooltipTitle}
        tooltipText={tooltipText}
      />
      <strong>
        {direction === "positive" ? "+" : "−"}
        {formatCurrency(Math.abs(value))}
      </strong>
      {detail && <small className="drawdown-balance-waterfall-step-detail">{detail}</small>}
      <div className="drawdown-balance-waterfall-movement-track" aria-hidden="true">
        <div style={{ width: `${safeWidth}%` }} />
      </div>
    </article>
  );
}

function WaterfallStepLabel({
  label,
  tooltipTitle,
  tooltipText,
  tooltipAlign = "right",
}: {
  label: string;
  tooltipTitle: string;
  tooltipText: string;
  tooltipAlign?: "left" | "right";
}) {
  return (
    <div className="drawdown-balance-waterfall-step-label">
      <span>{label}</span>
      <InfoTooltip
        ariaLabel={`Explain ${tooltipTitle.toLowerCase()}`}
        size="small"
        align={tooltipAlign}
      >
        <strong>{tooltipTitle}</strong>
        <p>{tooltipText}</p>
      </InfoTooltip>
    </div>
  );
}
