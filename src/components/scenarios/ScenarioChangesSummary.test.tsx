import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import type { Scenario } from "../../domain/scenarios";
import { ScenarioChangesSummary } from "./ScenarioChangesSummary";

function createScenario(
  id: string,
  name: string,
  inputs = createDefaultPensionInputs(),
): Scenario {
  return {
    id,
    name,
    colour: "accent",
    isBaseline: id === "active",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    inputs,
  };
}

describe("ScenarioChangesSummary", () => {
  it("shows only changes from the active scenario", () => {
    const activeScenario = createScenario("active", "Baseline Plan");
    const alternative = createScenario("alternative", "Retire at 65", {
      ...activeScenario.inputs,
      retirementAge: 65,
      monthlyEmployeeContribution: 250,
    });

    render(
      <ScenarioChangesSummary
        activeScenario={activeScenario}
        scenarios={[activeScenario, alternative]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Changes from the active plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Retire at 65" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Retires 3 years earlier")).toBeInTheDocument();
    expect(
      screen.getByText("Employee contribution is £150/month higher"),
    ).toBeInTheDocument();
  });

  it("shows an identical-input state", () => {
    const activeScenario = createScenario("active", "Baseline Plan");
    const copy = createScenario("copy", "Baseline Copy", {
      ...activeScenario.inputs,
    });

    render(
      <ScenarioChangesSummary
        activeScenario={activeScenario}
        scenarios={[activeScenario, copy]}
      />,
    );

    expect(
      screen.getByText("No input changes from the active plan."),
    ).toBeInTheDocument();
  });
});
