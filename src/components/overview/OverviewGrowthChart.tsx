import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { formatCurrency } from "../../utils/formatters";

interface SpendingPhaseMarker {
  startAge: number;
  label?: string;
  annualIncome?: number;
  withdrawalRate?: number;
}

interface OverviewGrowthChartProps {
  currentAge: number;
  currentPot: number;
  retirementAge: number;
  planningAge: number;
  inflationRate: number;
  retirementStartingBalance?: number;
  taxFreeCashTaken?: number;
  statePensionAge?: number;
  statePensionAnnualAmount?: number;
  withdrawalStrategy?: "target-income" | "percentage";
  spendingPhases?: SpendingPhaseMarker[];
  projectionYears: ProjectionYear[];
  drawdownYears?: DrawdownYear[];
}

interface JourneyPoint {
  age: number;
  balance: number;
}

interface MilestonePoint extends JourneyPoint {
  threshold: number;
  label: string;
}

interface JourneyEvent extends JourneyPoint {
  key: string;
  label: string;
  kind: "retirement" | "cash" | "state-pension" | "spending" | "planning";
  description: string;
}

export function OverviewGrowthChart({
  currentAge,
  currentPot,
  retirementAge,
  planningAge,
  inflationRate,
  retirementStartingBalance,
  taxFreeCashTaken = 0,
  statePensionAge,
  statePensionAnnualAmount = 0,
  withdrawalStrategy = "target-income",
  spendingPhases = [],
  projectionYears,
  drawdownYears = [],
}: OverviewGrowthChartProps) {
  const data = createJourneyData({
    currentAge,
    currentPot,
    retirementAge,
    planningAge,
    inflationRate,
    retirementStartingBalance,
    projectionYears,
    drawdownYears,
  });

  const milestones = data.length > 0 ? findMilestones(data) : [];
  const retirementPot = findRetirementPot(projectionYears, retirementAge);
  const events = createJourneyEvents({
    data,
    retirementAge,
    retirementPot,
    retirementStartingBalance,
    taxFreeCashTaken,
    statePensionAge,
    statePensionAnnualAmount,
    withdrawalStrategy,
    spendingPhases,
    planningAge,
  });
  const [selectedEventKey, setSelectedEventKey] = useState("retirement");
  const selectedEvent =
    events.find((event) => event.key === selectedEventKey) ?? events[0];

  if (data.length === 0) {
    return (
      <div className="polaris-overview-chart-empty">
        Add valid plan inputs to see your pension journey over time.
      </div>
    );
  }

  return (
    <div className="polaris-overview-chart-experience">
      <div
        className="polaris-overview-chart-canvas"
        role="img"
        aria-label={`Projected pension journey from age ${currentAge} to age ${planningAge} in today's money, including retirement events and pension milestones`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 34, right: 28, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="age"
              type="number"
              domain={[currentAge, planningAge]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={62}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactCurrency}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Pension value"]}
              labelFormatter={(age) => `Age ${age}`}
            />
            <ReferenceLine
              x={retirementAge}
              stroke="var(--colour-text-muted)"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Pension value"
              stroke="var(--colour-primary)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {milestones.map((milestone) => (
              <ReferenceDot
                key={`milestone-${milestone.threshold}`}
                x={milestone.age}
                y={milestone.balance}
                r={5}
                fill="var(--colour-surface)"
                stroke="var(--colour-primary)"
                strokeWidth={3}
                label={{
                  value: milestone.label,
                  position: "top",
                  fill: "var(--colour-text-strong)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            ))}
            {events.map((event) => (
              <ReferenceDot
                key={event.key}
                x={event.age}
                y={event.balance}
                r={event.key === selectedEvent?.key ? 7 : event.kind === "retirement" || event.kind === "cash" ? 6 : 4}
                fill="var(--colour-surface)"
                stroke={eventStroke(event.kind)}
                strokeWidth={event.key === selectedEvent?.key ? 4 : 3}
                label={{
                  value: event.label,
                  position: eventLabelPosition(event.kind),
                  fill: "var(--colour-text-strong)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {events.length > 0 && (
        <div className="polaris-overview-chart-events" aria-label="Retirement journey events">
          {events.map((event) => (
            <button
              key={`event-button-${event.key}`}
              type="button"
              className={`polaris-overview-chart-event is-${event.kind}${
                selectedEvent?.key === event.key ? " is-selected" : ""
              }`}
              aria-pressed={selectedEvent?.key === event.key}
              onClick={() => setSelectedEventKey(event.key)}
            >
              <span>{event.label}</span>
              <small>Age {event.age}</small>
            </button>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className={`polaris-overview-chart-event-detail is-${selectedEvent.kind}`} aria-live="polite">
          <div>
            <small>Age {selectedEvent.age}</small>
            <strong>{selectedEvent.label}</strong>
          </div>
          <p>{selectedEvent.description}</p>
          <span>{formatCurrency(selectedEvent.balance)} pension balance</span>
        </div>
      )}
    </div>
  );
}

function createJourneyData({
  currentAge,
  currentPot,
  retirementAge,
  planningAge,
  inflationRate,
  retirementStartingBalance,
  projectionYears,
  drawdownYears,
}: {
  currentAge: number;
  currentPot: number;
  retirementAge: number;
  planningAge: number;
  inflationRate: number;
  retirementStartingBalance?: number;
  projectionYears: ProjectionYear[];
  drawdownYears: DrawdownYear[];
}): JourneyPoint[] {
  const byAge = new Map<number, number>();
  byAge.set(currentAge, Math.max(0, currentPot));

  projectionYears.forEach((year) => {
    if (year.age <= planningAge) {
      byAge.set(year.age, Math.max(0, year.closingBalance.real));
    }
  });

  if (retirementStartingBalance !== undefined) {
    byAge.set(retirementAge, Math.max(0, retirementStartingBalance));
  }

  drawdownYears.forEach((year) => {
    const closingAge = year.age + 1;
    if (closingAge <= planningAge) {
      const inflationMultiplier = (1 + inflationRate) ** year.year;
      const realClosingBalance =
        inflationMultiplier > 0 ? year.closingBalance / inflationMultiplier : year.closingBalance;
      byAge.set(closingAge, Math.max(0, realClosingBalance));
    }
  });

  return Array.from(byAge.entries())
    .map(([age, balance]) => ({ age, balance }))
    .sort((left, right) => left.age - right.age);
}

function createJourneyEvents({
  data,
  retirementAge,
  retirementPot,
  retirementStartingBalance,
  taxFreeCashTaken,
  statePensionAge,
  statePensionAnnualAmount,
  withdrawalStrategy,
  spendingPhases,
  planningAge,
}: {
  data: JourneyPoint[];
  retirementAge: number;
  retirementPot?: number;
  retirementStartingBalance?: number;
  taxFreeCashTaken: number;
  statePensionAge?: number;
  statePensionAnnualAmount: number;
  withdrawalStrategy: "target-income" | "percentage";
  spendingPhases: SpendingPhaseMarker[];
  planningAge: number;
}): JourneyEvent[] {
  const events: JourneyEvent[] = [];

  if (retirementPot !== undefined) {
    events.push({
      key: "retirement",
      age: retirementAge,
      balance: retirementPot,
      label: "Retirement",
      kind: "retirement",
      description: `The plan reaches retirement with a projected pension of ${formatCurrency(retirementPot)} in today's money.`,
    });
  }

  if (taxFreeCashTaken > 0 && retirementStartingBalance !== undefined) {
    events.push({
      key: "tax-free-cash",
      age: retirementAge,
      balance: retirementStartingBalance,
      label: "Tax-free cash",
      kind: "cash",
      description: `${formatCurrency(taxFreeCashTaken)} is taken as tax-free cash at retirement, leaving ${formatCurrency(retirementStartingBalance)} invested before retirement withdrawals begin.`,
    });
  }

  if (
    statePensionAge !== undefined &&
    statePensionAge >= retirementAge &&
    statePensionAge <= planningAge &&
    statePensionAnnualAmount > 0
  ) {
    const point = findPointAtAge(data, statePensionAge);
    if (point) {
      events.push({
        key: "state-pension",
        ...point,
        label: "State Pension starts",
        kind: "state-pension",
        description: `State Pension of ${formatCurrency(statePensionAnnualAmount)} a year starts at age ${statePensionAge}, reducing how much income needs to come from the private pension.`,
      });
    }
  }

  spendingPhases
    .filter((phase) => phase.startAge > retirementAge && phase.startAge <= planningAge)
    .forEach((phase, index) => {
      const point = findPointAtAge(data, phase.startAge);
      if (point) {
        events.push({
          key: `spending-${phase.startAge}-${index}`,
          ...point,
          label: phase.label || "Spending changes",
          kind: "spending",
          description: createSpendingPhaseDescription(phase, withdrawalStrategy),
        });
      }
    });

  const planningPoint = findPointAtAge(data, planningAge);
  if (planningPoint) {
    events.push({
      key: "planning-age",
      ...planningPoint,
      label: "Plan age",
      kind: "planning",
      description: `The retirement plan is modelled through to age ${planningAge}, with ${formatCurrency(planningPoint.balance)} remaining in today's money at this point.`,
    });
  }

  return events;
}

function createSpendingPhaseDescription(
  phase: SpendingPhaseMarker,
  withdrawalStrategy: "target-income" | "percentage",
): string {
  if (withdrawalStrategy === "percentage" && phase.withdrawalRate !== undefined) {
    return `${phase.label || "A new retirement phase"} begins at age ${phase.startAge}, using a ${(phase.withdrawalRate * 100).toFixed(1)}% annual withdrawal rate from this point.`;
  }

  if (phase.annualIncome !== undefined) {
    return `${phase.label || "A new retirement phase"} begins at age ${phase.startAge}, with planned annual spending of ${formatCurrency(phase.annualIncome)} from this point.`;
  }

  return `${phase.label || "A new retirement phase"} begins at age ${phase.startAge}, changing the retirement spending pattern from this point.`;
}

function findRetirementPot(projectionYears: ProjectionYear[], retirementAge: number): number | undefined {
  const retirementYear = projectionYears.find((year) => year.age === retirementAge);
  return retirementYear?.closingBalance.real;
}

function findPointAtAge(data: JourneyPoint[], age: number): JourneyPoint | undefined {
  return data.find((point) => point.age === age);
}

function eventStroke(kind: JourneyEvent["kind"]): string {
  if (kind === "cash") return "var(--colour-warning)";
  if (kind === "state-pension") return "var(--colour-success)";
  if (kind === "spending") return "var(--colour-primary)";
  if (kind === "planning") return "var(--colour-text-muted)";
  return "var(--colour-text-strong)";
}

function eventLabelPosition(kind: JourneyEvent["kind"]): "top" | "bottom" | "right" {
  if (kind === "cash") return "bottom";
  if (kind === "planning") return "right";
  return "top";
}

function findMilestones(data: JourneyPoint[]): MilestonePoint[] {
  const maximumBalance = Math.max(...data.map((point) => point.balance));
  const thresholds = createMilestoneThresholds(maximumBalance);

  return thresholds.flatMap((threshold) => {
    const point = data.find((candidate) => candidate.balance >= threshold);
    return point
      ? [
          {
            ...point,
            threshold,
            label: formatMilestone(threshold),
          },
        ]
      : [];
  });
}

function createMilestoneThresholds(maximumBalance: number): number[] {
  const thresholds: number[] = [];
  const multipliers = [1, 2.5, 5];

  for (let scale = 100_000; scale <= maximumBalance; scale *= 10) {
    multipliers.forEach((multiplier) => {
      const threshold = scale * multiplier;
      if (threshold <= maximumBalance) thresholds.push(threshold);
    });
  }

  return thresholds;
}

function formatMilestone(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `£${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  return `£${Math.round(value / 1_000)}k`;
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
