import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "../../scenarios";
import { validatePensionInputs } from "../../../validation/validatePensionInputs";
import { createTestPensionInputs } from "../../../test/retirementTestFixtures";
import { GuidedPensionInputsForm } from "./GuidedPensionInputsForm";

function renderForm(inputs = createTestPensionInputs()) {
  return render(
    <ScenarioProvider>
      <GuidedPensionInputsForm
        value={inputs}
        errors={validatePensionInputs(inputs)}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    </ScenarioProvider>,
  );
}

describe("GuidedPensionInputsForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("includes retirement income in the journey and review", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Retirement income" }));
    expect(
      screen.getByRole("heading", { name: "Plan your retirement income" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /target annual income/i }),
    ).toBeChecked();

    const reviewAction = screen
      .getAllByRole("button", { name: "Review plan" })
      .find((button) => button.classList.contains("primary-button"));

    expect(reviewAction).toBeDefined();
    await user.click(reviewAction!);

    expect(screen.getByText("Your plan is ready")).toBeInTheDocument();
    expect(screen.getByText("Retirement income")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View projection" }));

    expect(
      screen.getByRole("region", { name: "Retirement plan summary" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your plan at a glance" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /edit plan/i }));
    expect(
      screen.getByRole("heading", { name: "Review your plan" }),
    ).toBeInTheDocument();
  });

  it("does not continue from a required step while it contains an error", async () => {
    const user = userEvent.setup();
    const inputs = { ...createTestPensionInputs(), currentAge: 10 };
    renderForm(inputs);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByRole("heading", { name: "Tell us about you" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your pension today" }),
    ).not.toBeInTheDocument();
  });
});
