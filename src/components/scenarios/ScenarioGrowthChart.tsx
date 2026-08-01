import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  createScenarioChartSeries,
  type Scenario,
} from "../../domain/scenarios";
import { formatCurrency } from "../../utils/formatters";

interface ScenarioGrowthChartProps {
  scenarios: Scenario[];
  activeScenarioId: string;
}

type DisplayBasis = "real" | "nominal";

export function ScenarioGrowthChart({
  scenarios,
  activeScenarioId,
}: ScenarioGrowthChartProps) {
  const [basis, setBasis] = useState<DisplayBasis>("real");
  const series = useMemo(
    () => createScenarioChartSeries(scenarios, activeScenarioId),
    [activeScenarioId, scenarios],
  );
  const data = useMemo(() => mergeSeries(series, basis), [basis, series]);

  if (series.length === 0) {
    return (
      <div className="scenario-growth-empty">
        Projection data is unavailable for the selected scenarios.
      </div>
    );
  }

  return (
    <div className="scenario-growth-chart">
      <div className="scenario-growth-toolbar">
        <div>
          <h3>Pension growth by age</h3>
          <p>Compare how the selected plans develop before retirement.</p>
        </div>
        <fieldset className="scenario-growth-basis">
          <legend>Display values</legend>
          <label>
            <input
              type="radio"
              name="scenario-growth-basis"
              value="real"
              checked={basis === "real"}
              onChange={() => setBasis("real")}
            />
            Today&apos;s money
          </label>
          <label>
            <input
              type="radio"
              name="scenario-growth-basis"
              value="nominal"
              checked={basis === "nominal"}
              onChange={() => setBasis("nominal")}
            />
            Nominal
          </label>
        </fieldset>
      </div>

      <div className="scenario-growth-canvas" aria-label="Pension growth chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 20, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="var(--colour-chart-grid)" strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              tick={{ fill: "var(--colour-chart-text)" }}
              label={{ value: "Age", position: "insideBottom", offset: -2 }}
            />
            <YAxis
              tick={{ fill: "var(--colour-chart-text)" }}
              tickFormatter={formatCompactCurrency}
              width={78}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            {series.map((item, index) => (
              <Line
                key={item.scenarioId}
                type="monotone"
                dataKey={item.scenarioId}
                name={item.name}
                stroke={`var(--colour-chart-${index === 0 ? "primary" : index === 1 ? "secondary" : "tertiary"})`}
                strokeWidth={item.isActive ? 4 : 2}
                strokeDasharray={item.isActive ? undefined : index === 1 ? "6 4" : "2 4"}
                dot={false}
                activeDot={{ r: item.isActive ? 5 : 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function mergeSeries(
  series: ReturnType<typeof createScenarioChartSeries>,
  basis: DisplayBasis,
): Array<Record<string, number>> {
  const rows = new Map<number, Record<string, number>>();

  for (const item of series) {
    for (const point of item.points) {
      const row = rows.get(point.age) ?? { age: point.age };
      row[item.scenarioId] = point[basis];
      rows.set(point.age, row);
    }
  }

  return [...rows.values()].sort((left, right) => left.age - right.age);
}

function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `£${Math.round(value / 1_000)}k`;
  return `£${Math.round(value)}`;
}
