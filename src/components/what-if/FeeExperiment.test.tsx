import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FeeExperiment } from "./FeeExperiment";

function renderExperiment(overrides: Partial<React.ComponentProps<typeof FeeExperiment>> = {}) {
  const props: React.ComponentProps<typeof FeeExperiment> = {
    activePlanName: "Main Plan",
    baselineFee: 0.0027,
    fee: 0.0027,
    yearsToRetirement: 18,
    baselineTotalFees: 18_000,
    totalFees: 18_000,
    baselineProjectedPension: 700_000,
    projectedPension: 700_000,
    baselineAnnualIncome: 28_000,
    annualIncome: 28_000,
    baselinePreparedness: 93,
    preparedness: 93,
    canSave: true,
    saveMessage: null,
    onFeeChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<FeeExperiment {...props} />);
  return props;
}

describe("FeeExperiment", () => {
  it("shows the saved annual charge as a percentage", () => {
    renderExperiment();

    expect(screen.getByText("0.27%")).toBeInTheDocument();
    expect(screen.getByText(/saved plan: 0.27%/i)).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Experimental annual pension fee" }),
    ).toHaveValue("0.0027");
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeDisabled();
  });

  it("reports a lower fee using the decimal rate expected by the projection", () => {
    const onFeeChange = vi.fn();
    renderExperiment({ onFeeChange });

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental annual pension fee" }),
      { target: { value: "0.001" } },
    );

    expect(onFeeChange).toHaveBeenCalledWith(0.001);
  });

  it("explains the outcome and enables actions when the fee changes", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();

    renderExperiment({
      fee: 0.001,
      totalFees: 8_000,
      projectedPension: 725_000,
      annualIncome: 29_000,
      preparedness: 97,
      onReset,
      onSave,
    });

    expect(
      screen.getByRole("heading", {
        name: "Lower fees leave more of the pension invested",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("−17 basis points")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
