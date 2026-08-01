import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  createTestPensionInputs,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { ActionCentre } from "./ActionCentre";

describe("ActionCentre", () => {
  it("shows ranked actions, filters categories, expands details, and previews a recommendation", async () => {
    const user = userEvent.setup();
    const inputs = createTestPensionInputs();
    const onPreviewRecommendation = vi.fn();

    render(
      <ActionCentre
        inputs={inputs}
        goals={createTestRetirementGoals()}
        onPreviewRecommendation={onPreviewRecommendation}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /action centre/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/top recommendation|ranked #/i).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /why this action/i })[0]);
    expect(screen.getByRole("heading", { name: /what changes/i })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /preview in comparison/i })[0]);
    expect(onPreviewRecommendation).toHaveBeenCalledTimes(1);
    expect(onPreviewRecommendation.mock.calls[0][0]).not.toBe(inputs);

    await user.click(screen.getByRole("tab", { name: /retirement timing/i }));
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "action-category-retirement-timing",
    );
  });
});
