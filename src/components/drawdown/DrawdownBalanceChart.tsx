import type { DrawdownYear } from "../../engine/drawdown";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

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

  const movements = [
    {
      key: "growth",
      label: "Investment growth",
      value: selected.investmentGrowth,
      direction: "positive" as const,
    },
    {
      key: "withdrawal",
      label: "Money taken out",
      value: selected.pensionWithdrawal,
      direction: "negative" as const,
    },
    {
      key: "fees",
      label: "Fees",
      value: selected.fees,
      direction: "negative" as const,
    },
  ];
  const largestMovement = Math.max(
    1,
    ...movements.map((movement) => Math.abs(movement.value)),
  );
  const balanceChange = selected.closingBalance - selected.openingBalance;

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

      <div className="drawdown-balance-waterfall-flow">
        <WaterfallAnchor
          label="Started the year with"
          value={selected.openingBalance}
          tone="opening"
        />

        {movements.map((movement) => (
          <WaterfallMovement
            key={movement.key}
            label={movement.label}
            value={movement.value}
            direction={movement.direction}
            width={(Math.abs(movement.value) / largestMovement) * 100}
          />
        ))}

        <WaterfallAnchor
          label="Finished the year with"
          value={selected.closingBalance}
          tone="closing"
        />
      </div>

      <div
        className={`drawdown-balance-waterfall-result ${balanceChange >= 0 ? "is-positive" : "is-reducing"}`}
      >
        <span>Overall change</span>
        <strong>
          {balanceChange >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(balanceChange))}
        </strong>
        <p>
          {balanceChange >= 0
            ? "Your pension finished the year with more money than it started with."
            : "Your pension finished the year lower than it started. In retirement, that can be a normal part of using the money you have built up."}
        </p>
      </div>
    </section>
  );
}

function WaterfallAnchor({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "opening" | "closing";
}) {
  return (
    <article className={`drawdown-balance-waterfall-step is-${tone}`}>
      <span>{label}</span>
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
}: {
  label: string;
  value: number;
  direction: "positive" | "negative";
  width: number;
}) {
  const safeWidth = Math.max(8, Math.min(100, width));

  return (
    <article className={`drawdown-balance-waterfall-step is-${direction}`}>
      <span>{direction === "positive" ? "+" : "−"} {label}</span>
      <strong>
        {direction === "positive" ? "+" : "−"}
        {formatCurrency(Math.abs(value))}
      </strong>
      <div className="drawdown-balance-waterfall-movement-track" aria-hidden="true">
        <div style={{ width: `${safeWidth}%` }} />
      </div>
    </article>
  );
}
