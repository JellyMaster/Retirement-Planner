import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithProviders } from "../test/renderWithProviders";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/plan");
  });

  it("presents the essential and advanced plan editor", () => {
    renderWithProviders(<RetirementPlannerPage />);

    expect(screen.getByRole("heading", { name: "Build your retirement plan" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Edit retirement plan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The information needed for your plan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fine-tune how the plan is modelled" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "You and retirement" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Your pension" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retirement income" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Investment assumptions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Future saving changes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retirement strategy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View overview" })).toHaveAttribute("href", "/");
  });

  it("shows validation guidance when an essential field is invalid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RetirementPlannerPage />);

    const currentAgeInput = screen.getByRole("spinbutton", { name: /current age/i });
    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "10");

    expect(screen.getByText(/current age must be between 18 and 100/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Plan completeness")).toHaveTextContent("Needs attention");
    expect(screen.getByText("Needs attention", { selector: ".essential-plan-status" })).toBeInTheDocument();
  });
});
