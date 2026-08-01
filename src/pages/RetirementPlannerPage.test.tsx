import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../test/renderWithProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage", () => {
  it("renders the guided planner and current projection results", () => {
    renderWithProviders(<RetirementPlannerPage />);

    expect(
      screen.getByRole("heading", {
        name: /retirement planner/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /your pension details/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /compare scenario/i,
      }),
    ).toBeInTheDocument();

    // Assert stable result sections rather than the dynamic outlook label,
    // which changes with the current plan's readiness status.
    expect(
      screen.getByRole("heading", {
        name: /the key moments in your plan/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /retirement score breakdown/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /recommended actions/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /what happens if/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /how fees affect your retirement/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows validation feedback and withholds projection results for invalid required inputs", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RetirementPlannerPage />);

    const currentAgeInput = screen.getByRole("spinbutton", {
      name: /current age/i,
    });

    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "10");

    expect(
      screen.getByText(
        /current age must be between 18 and 100/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /correct the highlighted fields to calculate your results/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: /retirement score breakdown/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: /how fees affect your retirement/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("copies the current scenario when comparison is enabled", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RetirementPlannerPage />);

    const currentAgeInput = screen.getByRole("spinbutton", {
      name: /current age/i,
    });

    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "52");

    await user.click(
      screen.getByRole("button", {
        name: /compare scenario/i,
      }),
    );

    expect(
      document.getElementById("current-currentAge"),
    ).toHaveValue(52);

    await user.click(
      screen.getByRole("tab", {
        name: /comparison plan/i,
      }),
    );

    expect(
      document.getElementById("comparison-currentAge"),
    ).toHaveValue(52);
  });
});