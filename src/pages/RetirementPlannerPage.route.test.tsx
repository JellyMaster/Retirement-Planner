import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithAppProviders } from "../test/renderWithAppProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage route selection", () => {
  it("opens the requested retirement-income section", async () => {
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
