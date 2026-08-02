import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithProviders } from "../test/renderWithProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("renders the overview workspace and navigates between focused sections", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RetirementPlannerPage />);

    expect(
      screen.getByRole("heading", { name: /retirement planner/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /retirement planning workspace/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /am i on track for retirement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /your pension details/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /retirement plan summary/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("tab", { name: /confidence & risk/i }),
    );

    expect(
      screen.getByRole("heading", { name: /how uncertain is the outcome/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /retirement confidence/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#confidence");

    await user.click(
      screen.getByRole("tab", { name: /improve my plan/i }),
    );

    expect(
      screen.getByRole("heading", { name: /what changes could improve my outlook/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /recommended actions/i }),
    ).toBeInTheDocument();
  });

  it("shows validation feedback, withholds results and returns to overview", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RetirementPlannerPage />);

    await user.click(
      screen.getByRole("tab", { name: /build my pension/i }),
    );
    await user.click(
      screen.getByRole("tab", { name: /overview/i }),
    );

    const currentAgeInput = screen.getByRole("spinbutton", {
      name: /current age/i,
    });
    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "10");

    expect(
      screen.getByText(/current age must be between 18 and 100/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/correct the highlighted fields to calculate your results/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /retirement plan summary/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /overview/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("previews an Action Centre recommendation and can discard it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RetirementPlannerPage />);

    await user.click(
      screen.getByRole("tab", { name: /improve my plan/i }),
    );

    await user.click(
      screen.getAllByRole("button", { name: /preview plan/i })[0],
    );

    expect(
      screen.getByRole("status", { name: /preview mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /keep changes/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /discard preview/i }),
    );

    expect(
      screen.queryByRole("status", { name: /preview mode/i }),
    ).not.toBeInTheDocument();
  });

 
});
