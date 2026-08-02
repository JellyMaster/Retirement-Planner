import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { ScenarioProvider } from "../components/scenarios";
import { GuidancePage } from "./GuidancePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <ScenarioProvider>
        <GuidancePage />
      </ScenarioProvider>
    </MemoryRouter>,
  );
}

describe("GuidancePage", () => {
  it("shows a prioritised next step, opportunities and plan checks", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Know what to review next" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your next best step")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Useful ways to improve understanding",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Review these values periodically",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not regulated financial advice/i)).toBeInTheDocument();
  });

  it("links recommendations to the relevant planning workspace", () => {
    renderPage();

    expect(
      screen.getByRole("link", { name: "Open the interactive lesson" }),
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getAllByRole("link", { name: "Review My Plan" })[0],
    ).toHaveAttribute("href", "/plan");
  });
});
