import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { createDefaultScenarioDrawdownPreferences } from "../../domain/scenarios";
import { SavedExperimentsPanel } from "./SavedExperimentsPanel";

function createScenario(id: string, name: string): WhatIfScenario {
  return {
    id,
    name,
    baseScenarioId: "baseline",
    experimentType: "retirement-age",
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
    inputs: {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 67,
    },
    drawdown: createDefaultScenarioDrawdownPreferences(),
  };
}

describe("SavedExperimentsPanel", () => {
  it("shows saved experiments for the selected experiment and loads one", async () => {
    const user = userEvent.setup();
    const scenario = createScenario("retire-67", "Retire at 67");
    const onLoad = vi.fn();

    render(
      <SavedExperimentsPanel
        activeExperiment="retirement-age"
        activePlanName="Standard Plan"
        scenarios={[scenario]}
        loadedScenarioId={null}
        onLoad={onLoad}
        onPromote={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Retire at 67")).toBeInTheDocument();
    expect(screen.getByText("Age 67")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load Retire at 67" }));
    expect(onLoad).toHaveBeenCalledWith(scenario);
  });

  it("collapses and expands the saved experiment rail", async () => {
    const user = userEvent.setup();

    render(
      <SavedExperimentsPanel
        activeExperiment="retirement-age"
        activePlanName="Standard Plan"
        scenarios={[]}
        loadedScenarioId={null}
        onLoad={vi.fn()}
        onPromote={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Collapse saved experiments" }),
    );

    expect(
      screen.getByRole("button", { name: "Expand saved experiments" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("No saved experiments yet")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Expand saved experiments" }),
    );

    expect(screen.getByText("No saved experiments yet")).toBeInTheDocument();
  });
});
