import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  createTestPensionInputs,
  createTestProjection,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { RetirementJourney } from "./RetirementJourney";

describe("RetirementJourney", () => {
  it("allows milestone details to be selected with the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <RetirementJourney
        inputs={createTestPensionInputs()}
        result={createTestProjection()}
        goals={createTestRetirementGoals()}
      />,
    );

    const statePensionMilestone = screen.getByRole("button", {
      name: /state pension starts/i,
    });

    statePensionMilestone.focus();
    await user.keyboard("{Enter}");

    expect(statePensionMilestone).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "State Pension starts" })).toBeInTheDocument();
  });
});
