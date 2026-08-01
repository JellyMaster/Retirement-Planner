import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import type { Scenario } from "../../domain/scenarios";
import { ScenarioInsights } from "./ScenarioInsights";

function createScenario(
  id: string,
  name: string,
  overrides: Partial<Scenario["inputs"]> = {},
): Scenario {
  return {
    id,
    name,
    colour: "accent",
    isBaseline: id === "baseline",
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    inputs: {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 68,
      currentPot: 194_420,
      monthlyEmployeeContribution: 800,
      monthlyEmployerContribution: 250,
      ...overrides,
    },
  };
}

describe("ScenarioInsights", () => {
  it("renders prioritised observations for an alternative scenario", () => {
    const active = createScenario("active", "Active Plan");
    const alternative = createScenario("alternative", "Retire at 65", {
      retirementAge: 65,
      monthlyEmployeeContribution: 1_000,
    });

    render(
      <ScenarioInsights
        activeScenario={active}
        scenarios={[active, alternative]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Key comparison insights" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Retire at 65" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Earlier retirement")).toBeInTheDocument();
    expect(screen.getByText("Higher monthly saving")).toBeInTheDocument();
  });

  it("shows guidance when only the active scenario is selected", () => {
    const active = createScenario("active", "Active Plan");

    render(
      <ScenarioInsights activeScenario={active} scenarios={[active]} />,
    );

    expect(
      screen.getByText("Select another scenario to generate comparison insights."),
    ).toBeInTheDocument();
  });
});
