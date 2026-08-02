import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Scenario } from "../../domain/scenarios";
import { useScenarios } from "./ScenarioContext";
import { ActiveScenarioSwitcher } from "./ActiveScenarioSwitcher";

vi.mock("./ScenarioContext", () => ({
  useScenarios: vi.fn(),
}));

const mockedUseScenarios = vi.mocked(useScenarios);

function createScenario(
  id: string,
  name: string,
  isBaseline = false,
): Scenario {
  return {
    id,
    name,
    colour: "accent",
    isBaseline,
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    inputs: {
      currentAge: 47,
      retirementAge: 68,
      currentPot: 194_420,
      monthlyEmployeeContribution: 800,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0.03,
      annualReturn: 0.05,
      annualFee: 0.0005,
      inflation: 0.025,
    },
  };
}

describe("ActiveScenarioSwitcher", () => {
  it("shows all scenarios and changes the active plan", async () => {
    const user = userEvent.setup();
    const setActiveScenario = vi.fn();
    const baseline = createScenario("baseline", "Baseline Plan", true);
    const alternative = createScenario("alternative", "Retire at 65");

    mockedUseScenarios.mockReturnValue({
      scenarios: [baseline, alternative],
      activeScenarioId: baseline.id,
      activeScenario: baseline,
      createScenario: vi.fn(),
      duplicateScenario: vi.fn(),
      renameScenario: vi.fn(),
      updateScenarioInputs: vi.fn(),
      updateScenarioPlan: vi.fn(),
      setActiveScenario,
      deleteScenario: vi.fn(),
    });

    render(<ActiveScenarioSwitcher />);

    const select = screen.getByRole("combobox", { name: "Active plan" });
    expect(select).toHaveValue("baseline");
    expect(
      screen.getByRole("option", { name: "Baseline Plan · Baseline" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Retire at 65" }),
    ).toBeInTheDocument();

    await user.selectOptions(select, "alternative");

    expect(setActiveScenario).toHaveBeenCalledWith("alternative");
  });
});
