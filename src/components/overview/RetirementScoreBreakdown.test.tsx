import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createTestPensionInputs,
  createTestProjection,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { RetirementScoreBreakdown } from "./RetirementScoreBreakdown";

const STORAGE_KEY = "retirement-planner-score-mode";

describe("RetirementScoreBreakdown", () => {
  beforeEach(() => localStorage.clear());

  it("switches to the weighted view and retains the selected mode", async () => {
    const user = userEvent.setup();

    render(
      <RetirementScoreBreakdown
        inputs={createTestPensionInputs()}
        result={createTestProjection()}
        goals={createTestRetirementGoals()}
      />,
    );

    const weighted = screen.getByRole("radio", { name: "Weighted score" });
    await user.click(weighted);

    expect(weighted).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("weighted");
    expect(screen.getByText(/Weight 40%/i)).toBeInTheDocument();
  });

  it("restores the weighted view from local storage", () => {
    localStorage.setItem(STORAGE_KEY, "weighted");

    render(
      <RetirementScoreBreakdown
        inputs={createTestPensionInputs()}
        result={createTestProjection()}
        goals={createTestRetirementGoals()}
      />,
    );

    expect(screen.getByRole("radio", { name: "Weighted score" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
