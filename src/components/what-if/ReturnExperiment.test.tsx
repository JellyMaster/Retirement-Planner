import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReturnExperiment } from "./ReturnExperiment";

const defaultProps = {
  activePlanName: "Main Plan",
  baselineReturn: 0.05,
  annualReturn: 0.05,
  yearsToRetirement: 18,
  baselineGrowth: 300_000,
  growth: 300_000,
  baselineProjectedPension: 700_000,
  projectedPension: 700_000,
  baselineAnnualIncome: 28_000,
  annualIncome: 28_000,
  baselinePreparedness: 93,
  preparedness: 93,
  canSave: true,
  saveMessage: null,
  onReturnChange: vi.fn(),
  onReset: vi.fn(),
  onSave: vi.fn(),
};

describe("ReturnExperiment", () => {
  it("shows the saved return as the initial assumption", () => {
    render(<ReturnExperiment {...defaultProps} />);

    expect(
      screen.getByRole("slider", {
        name: "Experimental annual investment return",
      }),
    ).toHaveValue("0.05");
    expect(screen.getByText("Saved · 5.0%")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The saved return assumption is unchanged",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeDisabled();
  });

  it("passes the selected percentage back as a decimal rate", () => {
    const onReturnChange = vi.fn();
    render(<ReturnExperiment {...defaultProps} onReturnChange={onReturnChange} />);

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental annual investment return",
      }),
      { target: { value: "0.07" } },
    );

    expect(onReturnChange).toHaveBeenCalledWith(0.07);
  });

  it("explains a more cautious return assumption", () => {
    render(
      <ReturnExperiment
        {...defaultProps}
        annualReturn={0.03}
        growth={210_000}
        projectedPension={610_000}
        annualIncome={24_400}
        preparedness={81}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "A lower assumed return gives a more cautious illustration",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeEnabled();
  });

  it("supports reset and save actions", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();

    render(
      <ReturnExperiment
        {...defaultProps}
        annualReturn={0.06}
        growth={350_000}
        projectedPension={750_000}
        annualIncome={30_000}
        preparedness={100}
        onReset={onReset}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reset experiment" }));
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
