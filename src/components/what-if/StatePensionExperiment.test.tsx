import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StatePensionExperiment } from "./StatePensionExperiment";
import { setWhatIfViewMode } from "./whatIfDisplaySettings";

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
  beforeEach(() => {
    setWhatIfViewMode("simple");
  });

  it("shows the saved amount and start age", () => {
    renderExperiment();

    expect(
      screen.getByRole("slider", {
        name: "Experimental annual State Pension amount",
      }),
    ).toHaveAttribute("aria-valuetext", "£11,500 per year");
    expect(
      screen.getByRole("slider", {
        name: "Experimental State Pension start age",
      }),
    ).toHaveAttribute("aria-valuetext", "Starts at age 67");
    expect(
      screen.getByRole("switch", {
        name: "Include State Pension in experiment",
      }),
    ).toBeChecked();
    expect(screen.getByRole("button", { name: "Save experiment" })).toBeDisabled();
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

  it("hides amount and start-age controls when State Pension is excluded", () => {
    renderExperiment({ included: false });

    expect(
      screen.queryByRole("slider", {
        name: "Experimental annual State Pension amount",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("slider", {
        name: "Experimental State Pension start age",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Not included").length).toBeGreaterThan(0);
    expect(screen.getByText(/No State Pension income is counted/i)).toBeInTheDocument();
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
        name: "Without State Pension, more income needs to come from elsewhere",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Without State Pension in this experiment/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save experiment" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("keeps the fuller financial comparison for Detailed view", () => {
    setWhatIfViewMode("detailed");
    renderExperiment({ included: false });

    expect(
      screen.getByRole("heading", { name: "How State Pension changes the income picture" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Target coverage").length).toBeGreaterThan(0);
    expect(screen.getByText("Private income still required")).toBeInTheDocument();
  });
});
