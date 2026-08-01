import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  createTestPensionInputs,
  createTestProjection,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { RetirementCoach } from "./RetirementCoach";

describe("RetirementCoach", () => {
  it("applies a recommended action to comparison without changing the current inputs", async () => {
    const user = userEvent.setup();
    const inputs = createTestPensionInputs();
    const onApplyToComparison = vi.fn();

    render(
      <RetirementCoach
        inputs={inputs}
        result={createTestProjection()}
        goals={createTestRetirementGoals()}
        onApplyToComparison={onApplyToComparison}
      />,
    );

    const actions = screen.getAllByRole("button", { name: "Apply to comparison" });
    await user.click(actions[0]);

    expect(onApplyToComparison).toHaveBeenCalledTimes(1);
    expect(onApplyToComparison.mock.calls[0][0]).not.toBe(inputs);
    expect(inputs.monthlyEmployeeContribution).toBe(850);
  });
});
