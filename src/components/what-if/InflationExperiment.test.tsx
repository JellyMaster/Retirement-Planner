import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InflationExperiment } from "./InflationExperiment";

function renderExperiment(
  overrides: Partial<React.ComponentProps<typeof InflationExperiment>> = {},
) {
  const props: React.ComponentProps<typeof InflationExperiment> = {
    activePlanName: "Main Plan",
    baselineInflation: 0.02,
    inflation: 0.02,
    yearsToRetirement: 18,
    baselineNominalPension: 900_000,
    nominalPension: 900_000,
    baselineRealPension: 630_000,
    realPension: 630_000,
    baselineAnnualIncome: 25_200,
    annualIncome: 25_200,
    baselinePreparedness: 84,
    preparedness: 84,
    canSave: true,
    saveMessage: null,
    onInflationChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<InflationExperiment {...props} />);
  return props;
}

describe("InflationExperiment", () => {
  it("shows the saved inflation assumption as a percentage", () => {
    renderExperiment();

    expect(screen.getByText("2.0%")).toBeInTheDocument();
    expect(screen.getByText(/saved plan: 2.0%/i)).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Experimental annual inflation" }),
    ).toHaveValue("0.02");
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeDisabled();
  });

  it("reports the decimal inflation rate expected by the projection", () => {
    const onInflationChange = vi.fn();
    renderExperiment({ onInflationChange });

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental annual inflation" }),
      { target: { value: "0.035" } },
    );

    expect(onInflationChange).toHaveBeenCalledWith(0.035);
  });

  it("explains lower purchasing power and enables actions", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();

    renderExperiment({
      inflation: 0.035,
      nominalPension: 900_000,
      realPension: 490_000,
      annualIncome: 19_600,
      preparedness: 65,
      onReset,
      onSave,
    });

    expect(
      screen.getByRole("heading", {
        name: "Higher inflation reduces future purchasing power",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pension in today’s money")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
