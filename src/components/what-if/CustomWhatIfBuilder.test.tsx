import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestPensionInputs,
  createTestProjection,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { CustomWhatIfBuilder } from "./CustomWhatIfBuilder";

describe("CustomWhatIfBuilder", () => {
  beforeEach(() => localStorage.clear());

  it("saves, reloads, and deletes a custom scenario", async () => {
    const user = userEvent.setup();

    render(
      <CustomWhatIfBuilder
        inputs={createTestPensionInputs()}
        result={createTestProjection()}
        goals={createTestRetirementGoals()}
        onApplyToComparison={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /create your own scenario/i }));

    const nameInput = screen.getByLabelText("Scenario name");
    await user.clear(nameInput);
    await user.type(nameInput, "Earlier retirement");
    await user.click(screen.getByRole("button", { name: "Save scenario" }));

    expect(screen.getByText("Earlier retirement")).toBeInTheDocument();
    expect(localStorage.getItem("retirement-planner-saved-scenarios-v1")).toContain(
      "Earlier retirement",
    );

    await user.click(screen.getByRole("button", { name: "Delete Earlier retirement" }));
    expect(screen.queryByText("Earlier retirement")).not.toBeInTheDocument();
  });
});
