import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ProjectionYear } from "../../engine/models/ProjectionYear";
import { OverviewGrowthChart } from "./OverviewGrowthChart";

const zeroMoney = { nominal: 0, real: 0 };

function projectionYear(age: number, balance: number): ProjectionYear {
  return {
    yearIndex: age - 49,
    age,
    openingBalance: zeroMoney,
    contributions: zeroMoney,
    investmentGrowth: zeroMoney,
    fees: zeroMoney,
    closingBalance: { nominal: balance, real: balance },
  };
}

describe("OverviewGrowthChart", () => {
  it("explains selected retirement events using the active plan values", async () => {
    const user = userEvent.setup();

    render(
      <OverviewGrowthChart
        currentAge={50}
        currentPot={100_000}
        retirementAge={65}
        planningAge={90}
        inflationRate={0.02}
        retirementStartingBalance={300_000}
        taxFreeCashTaken={100_000}
        statePensionAge={67}
        statePensionAnnualAmount={12_000}
        withdrawalStrategy="target-income"
        spendingPhases={[
          { startAge: 75, label: "Settled retirement", annualIncome: 30_000 },
        ]}
        projectionYears={[
          projectionYear(65, 400_000),
          projectionYear(67, 290_000),
          projectionYear(75, 220_000),
          projectionYear(90, 100_000),
        ]}
      />,
    );

    expect(screen.getByText(/projected pension of £400,000/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tax-free cash age 65/i }));
    expect(screen.getByText(/£100,000 is taken as tax-free cash/i)).toBeInTheDocument();
    expect(screen.getByText("£300,000 pension balance")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /state pension starts age 67/i }));
    expect(screen.getByText(/State Pension of £12,000 a year starts at age 67/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /settled retirement age 75/i }));
    expect(screen.getByText(/planned annual spending of £30,000/i)).toBeInTheDocument();
  });
});
