import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithAppProviders } from "../test/renderWithAppProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage route selection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the requested retirement-income section", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      window.setTimeout(() => callback(0), 0);
      return 1;
    });

    renderWithAppProviders(<RetirementPlannerPage />, {
      initialEntries: [
        "/plan?step=income&section=retirement-chapters",
      ],
    });

    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: "Retirement chapters" }),
      ).toHaveAttribute("aria-selected", "true"),
    );

    expect(
      screen.getByRole("tabpanel", { name: "Retirement chapters" }),
    ).toBeVisible();
  });
});
