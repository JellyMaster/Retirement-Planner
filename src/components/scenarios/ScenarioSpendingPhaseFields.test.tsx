import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createDefaultScenarioDrawdownPreferences } from "../../domain/scenarios";
import { ScenarioSpendingPhaseFields } from "./ScenarioSpendingPhaseFields";

describe("ScenarioSpendingPhaseFields", () => {
  it("creates active, slower and later-life phases when enabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = {
      ...createDefaultScenarioDrawdownPreferences(40_000),
      planningAge: 95,
    };

    render(
      <ScenarioSpendingPhaseFields
        idPrefix="phases"
        retirementAge={65}
        value={value}
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: "Use different income targets at different ages",
      }),
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        spendingPhases: [
          expect.objectContaining({
            startAge: 65,
            annualIncome: 40_000,
            label: "Active years",
          }),
          expect.objectContaining({ label: "Slower years" }),
          expect.objectContaining({ label: "Later life" }),
        ],
      }),
    );
  });

  it("passes a changed later-life income target back to the plan", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = {
      ...createDefaultScenarioDrawdownPreferences(40_000),
      planningAge: 95,
      spendingPhases: [
        { startAge: 65, annualIncome: 40_000, label: "Active years" },
        { startAge: 75, annualIncome: 34_000, label: "Slower years" },
        { startAge: 85, annualIncome: 28_000, label: "Later life" },
      ],
    };

    render(
      <ScenarioSpendingPhaseFields
        idPrefix="phases"
        retirementAge={65}
        value={value}
        onChange={onChange}
      />,
    );

    const laterLifeCard = screen
      .getByRole("heading", { name: "Later life" })
      .closest("section");
    if (!laterLifeCard) throw new Error("Later-life phase card not found.");

    const income = within(laterLifeCard).getByRole("spinbutton", {
      name: "Annual income target",
    });

    await user.clear(income);
    await user.type(income, "30000");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        spendingPhases: expect.arrayContaining([
          expect.objectContaining({
            label: "Later life",
            annualIncome: 30_000,
          }),
        ]),
      }),
    );
  });
});
