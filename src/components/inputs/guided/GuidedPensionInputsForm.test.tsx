import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { validatePensionInputs } from "../../../validation/validatePensionInputs";
import { createTestPensionInputs } from "../../../test/retirementTestFixtures";
import { GuidedPensionInputsForm } from "./GuidedPensionInputsForm";

describe("GuidedPensionInputsForm", () => {
  it("completes the journey, collapses the plan, and reopens it for editing", async () => {
    const user = userEvent.setup();
    const inputs = createTestPensionInputs();

    render(
      <GuidedPensionInputsForm
        value={inputs}
        errors={validatePensionInputs(inputs)}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Review plan" }));
    expect(screen.getByText("Your plan is ready")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View projection" }));

    expect(
      screen.getByRole("region", { name: "Retirement plan summary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your plan at a glance" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /edit plan/i }));
    expect(screen.getByRole("heading", { name: "Review your plan" })).toBeInTheDocument();
  });

  it("does not continue from a required step while it contains an error", async () => {
    const user = userEvent.setup();
    const inputs = { ...createTestPensionInputs(), currentAge: 10 };

    render(
      <GuidedPensionInputsForm
        value={inputs}
        errors={validatePensionInputs(inputs)}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { name: "Tell us about you" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your pension today" })).not.toBeInTheDocument();
  });
});
