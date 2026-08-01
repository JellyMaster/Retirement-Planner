import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { createTestRetirementGoals } from "../../test/retirementTestFixtures";
import { RetirementGoalsForm } from "./RetirementGoalsForm";

describe("RetirementGoalsForm", () => {
  it("expands, updates the income target, and collapses again", async () => {
    const user = userEvent.setup();
    const initialGoals = createTestRetirementGoals();
    const onChange = vi.fn();

    function TestHarness() {
      const [goals, setGoals] =
        useState<RetirementGoals>(initialGoals);

      function handleChange(nextGoals: RetirementGoals) {
        setGoals(nextGoals);
        onChange(nextGoals);
      }

      return (
        <RetirementGoalsForm
          value={goals}
          onChange={handleChange}
          collapsible
          defaultExpanded={false}
        />
      );
    }

    render(<TestHarness />);

    const expandButton = screen.getByRole("button", {
      name: /retirement goals/i,
    });

    expect(expandButton).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await user.click(expandButton);

    const incomeInput = screen.getByRole("spinbutton", {
      name: /desired annual income/i,
    });

    await user.clear(incomeInput);
    await user.type(incomeInput, "45000");

    expect(incomeInput).toHaveValue(45_000);

    expect(onChange).toHaveBeenLastCalledWith({
      ...initialGoals,
      desiredAnnualIncome: 45_000,
    });

    await user.click(
      screen.getByRole("button", {
        name: /^done$/i,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: /retirement goals/i,
      }),
    ).toHaveAttribute("aria-expanded", "false");

    expect(
      screen.queryByRole("spinbutton", {
        name: /desired annual income/i,
      }),
    ).not.toBeInTheDocument();
  });
});