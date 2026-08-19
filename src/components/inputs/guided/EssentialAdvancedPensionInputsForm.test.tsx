import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "../../scenarios";
import { createTestPensionInputs } from "../../../test/retirementTestFixtures";
import { validatePensionInputs } from "../../../validation/validatePensionInputs";
import { EssentialAdvancedPensionInputsForm } from "./EssentialAdvancedPensionInputsForm";

function renderForm() {
  const inputs = createTestPensionInputs();
  return render(
    <ScenarioProvider>
      <EssentialAdvancedPensionInputsForm
        value={inputs}
        errors={validatePensionInputs(inputs)}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    </ScenarioProvider>,
  );
}

describe("EssentialAdvancedPensionInputsForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("offers a custom income target or a Retirement Living Standards target", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Retirement income" }));

    expect(
      screen.getByRole("radio", { name: /I know how much I want to spend/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Use Retirement Living Standards/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/desired annual retirement income/i)).toBeInTheDocument();
    expect(screen.getByText(/State Pension assumption/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("radio", { name: /Use Retirement Living Standards/i }),
    );

    expect(screen.getByRole("radio", { name: /Minimum/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Moderate/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Comfortable/i })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Moderate/i }));

    expect(screen.getByText(/Moderate lifestyle selected/i)).toBeInTheDocument();
    expect(screen.getAllByText(/£32,700/).length).toBeGreaterThanOrEqual(1);
  });

  it("keeps detailed retirement strategy choices in advanced settings", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Retirement strategy" }));
    await user.click(screen.getByRole("button", { name: /Income strategy/i }));

    expect(screen.getByRole("radio", { name: /spend a target amount each year/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /withdraw a percentage of the pension/i })).toBeInTheDocument();
  });
});
