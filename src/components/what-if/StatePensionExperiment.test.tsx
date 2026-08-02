import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatePensionExperiment } from "./StatePensionExperiment";

function renderExperiment(
  overrides: Partial<React.ComponentProps<typeof StatePensionExperiment>> = {},
) {
  const props: React.ComponentProps<typeof StatePensionExperiment> = {
    activePlanName: "Main Plan",
    retirementAge: 65,
    planningAge: 95,
    baselineIncluded: true,
    included: true,
    baselineAnnualAmount: 11_500,
    annualAmount: 11_500,
    baselineStartAge: 67,
    startAge: 67,
    privateAnnualIncome: 24_000,
    targetIncome: 35_000,
    canSave: true,
    saveMessage: null,
    onIncludedChange: vi.fn(),
    onAnnualAmountChange: vi.fn(),
    onStartAgeChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<StatePensionExperiment {...props} />);
  return props;
}

describe("StatePensionExperiment", () => {
  it("shows the saved amount and start age", () => {
    renderExperiment();

    expect(screen.getByText("£11,500/year")).toBeInTheDocument();
    expect(screen.getByText("Age 67")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", {
        name: "Include State Pension in experiment",
      }),
    ).toBeChecked();
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeDisabled();
  });

  it("passes the selected annual amount and start age to the workspace", () => {
    const onAnnualAmountChange = vi.fn();
    const onStartAgeChange = vi.fn();
    renderExperiment({ onAnnualAmountChange, onStartAgeChange });

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental annual State Pension amount",
      }),
      { target: { value: "12500" } },
    );
    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental State Pension start age",
      }),
      { target: { value: "68" } },
    );

    expect(onAnnualAmountChange).toHaveBeenCalledWith(12_500);
    expect(onStartAgeChange).toHaveBeenCalledWith(68);
  });

  it("explains exclusion and enables reset and save", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();
    renderExperiment({
      included: false,
      onReset,
      onSave,
    });

    expect(
      screen.getByRole("heading", {
        name: "Removing State Pension increases reliance on the private pension",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Not included")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
