import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MarketDownturnExperiment } from "./MarketDownturnExperiment";

function renderExperiment(
  overrides: Partial<React.ComponentProps<typeof MarketDownturnExperiment>> = {},
) {
  const props: React.ComponentProps<typeof MarketDownturnExperiment> = {
    activePlanName: "Main Plan",
    currentAge: 47,
    retirementAge: 65,
    downturnAge: 52,
    downturnPercentage: 0,
    balanceAtDownturn: 300_000,
    baselineProjectedPension: 700_000,
    projectedPension: 700_000,
    baselineAnnualIncome: 28_000,
    annualIncome: 28_000,
    baselinePreparedness: 93,
    preparedness: 93,
    canSave: true,
    saveMessage: null,
    onAgeChange: vi.fn(),
    onPercentageChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<MarketDownturnExperiment {...props} />);
  return props;
}

describe("MarketDownturnExperiment", () => {
  it("starts with no downturn and disabled actions", () => {
    renderExperiment();

    expect(
      screen.getByRole("slider", {
        name: "Experimental market downturn percentage",
      }),
    ).toHaveValue("0");
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeDisabled();
  });

  it("passes the selected severity and timing to the workspace", () => {
    const onPercentageChange = vi.fn();
    const onAgeChange = vi.fn();
    renderExperiment({ onPercentageChange, onAgeChange });

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental market downturn percentage",
      }),
      { target: { value: "0.3" } },
    );
    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental market downturn age",
      }),
      { target: { value: "60" } },
    );

    expect(onPercentageChange).toHaveBeenCalledWith(0.3);
    expect(onAgeChange).toHaveBeenCalledWith(60);
  });

  it("explains an active stress test and enables reset and save", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();
    renderExperiment({
      downturnPercentage: 0.25,
      projectedPension: 610_000,
      annualIncome: 24_400,
      preparedness: 81,
      onReset,
      onSave,
    });

    expect(
      screen.getByRole("heading", {
        name: /25% fall at age 52 could leave less time to recover/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/deterministic stress test, not a forecast/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
