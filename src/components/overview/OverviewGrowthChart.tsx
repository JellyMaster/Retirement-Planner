import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { formatCurrency } from "../../utils/formatters";

interface OverviewGrowthChartProps {
  years: ProjectionYear[];
}

export function OverviewGrowthChart({ years }: OverviewGrowthChartProps) {
  if (years.length === 0) {
    return (
      <div className="polaris-overview-chart-empty">
        Add valid plan inputs to see pension growth over time.
      </div>
    );
  }

  const data = years.map((year) => ({
    age: year.age,
    balance: year.closingBalance.real,
  }));

  return (
    <div
      className="polaris-overview-chart-canvas"
      role="img"
      aria-label="Projected pension growth by age in today's money"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="age" tickLine={false} axisLine={false} />
          <YAxis
            width={58}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Pension value"]}
            labelFormatter={(age) => `Age ${age}`}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
