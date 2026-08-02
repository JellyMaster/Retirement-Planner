import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SpendingExperiment } from "./SpendingExperiment";

function renderExperiment(overrides: Partial<React.ComponentProps<typeof SpendingExperiment>> = {}) {
  const props: React.ComponentProps<typeof SpendingExperiment> = {
    activePlanName: "Main Plan",
    baselineTargetIncome: 30_000,
    targetIncome: 30_000,
    incomeTargetMode: "net",
    illustratedAnnualIncome: 32_000,
    baselineCoverage: 100,
    coverage: 100,
    canSave: true,
    saveMessage: null,
    onTargetIncomeChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<SpendingExperiment {...props} />);
  return props;
}

describe("SpendingExperiment", () => {
  it("centres the slider on the saved annual target", () => {
    renderExperiment();

    expect(
      screen.getByRole("slider", {
        name: "Experimental annual retirement income change",
      }),
    ).toHaveValue("0");
    expect(screen.getByText("Saved plan · £30,000")).toBeInTheDocument();
    expect(screen.getByText("Net income target · No change from the saved plan")).toBeInTheDocument();
  });

  it("returns a target amount relative to the saved plan", () => {
    const props = renderExperiment();

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental annual retirement income change",
      }),
      { target: { value: "5000" } },
    );

    expect(props.onTargetIncomeChange).toHaveBeenCalledWith(35_000);
  });

  it("shows a widened income gap when spending rises above illustrated income", () => {
    renderExperiment({
      targetIncome: 40_000,
      coverage: 80,
    });

    expect(
      screen.getByRole("heading", {
        name: "Spending more would widen the projected income gap",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("£8,000 gap").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeEnabled();
  });
});
