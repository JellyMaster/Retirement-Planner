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

  it("keeps essential retirement income simple and detailed strategy advanced", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Retirement income" }));

    expect(screen.getByLabelText(/desired annual spending/i)).toBeInTheDocument();
    expect(screen.getByText(/State Pension assumption/i)).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /withdraw a percentage/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retirement strategy" }));

    expect(screen.getByRole("radio", { name: /spend a target amount each year/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /withdraw a percentage of the pension/i })).toBeInTheDocument();
  });
});
