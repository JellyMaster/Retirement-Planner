import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WhatIfScenario } from "../../domain/what-if/WhatIfScenario";
import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { createDefaultScenarioDrawdownPreferences } from "../../domain/scenarios";
import { SavedExperimentsPanel } from "./SavedExperimentsPanel";

function createScenario(id: string, name: string, retirementAge = 67): WhatIfScenario {
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
      retirementAge,
    },
    drawdown: createDefaultScenarioDrawdownPreferences(),
  };
}

describe("SavedExperimentsPanel", () => {
  it("shows saved experiments and applies one with an explicit action", async () => {
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
        onUnload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Retire at 67")).toBeInTheDocument();
    expect(screen.getByText("Age 67")).toBeInTheDocument();
    expect(screen.getByText("No saved experiment applied")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apply Retire at 67" }));
    expect(onLoad).toHaveBeenCalledWith(scenario);
  });

  it("shows the applied state and stops applying without deleting", async () => {
    const user = userEvent.setup();
    const scenario = createScenario("retire-67", "Retire at 67");
    const onUnload = vi.fn();
    const onDelete = vi.fn();

    render(
      <SavedExperimentsPanel
        activeExperiment="retirement-age"
        activePlanName="Standard Plan"
        scenarios={[scenario]}
        loadedScenarioId={scenario.id}
        onLoad={vi.fn()}
        onUnload={onUnload}
        onDelete={onDelete}
      />,
    );

    expect(screen.getAllByText("Applied").length).toBeGreaterThan(0);
    expect(screen.getByText("Applied experiment")).toBeInTheDocument();

    const stopApplyingButtons = screen.getAllByRole("button", { name: "Stop applying" });
    await user.click(stopApplyingButtons[0]);

    expect(onUnload).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("lets another saved experiment replace the currently applied one directly", async () => {
    const user = userEvent.setup();
    const applied = createScenario("retire-67", "Retire at 67", 67);
    const alternative = createScenario("retire-65", "Retire at 65", 65);
    const onLoad = vi.fn();

    render(
      <SavedExperimentsPanel
        activeExperiment="retirement-age"
        activePlanName="Standard Plan"
        scenarios={[applied, alternative]}
        loadedScenarioId={applied.id}
        onLoad={onLoad}
        onUnload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Apply Retire at 65" }));
    expect(onLoad).toHaveBeenCalledWith(alternative);
  });

  it("keeps delete behind the experiment management menu and confirms in-app", async () => {
    const user = userEvent.setup();
    const scenario = createScenario("retire-67", "Retire at 67");
    const onDelete = vi.fn();

    render(
      <SavedExperimentsPanel
        activeExperiment="retirement-age"
        activePlanName="Standard Plan"
        scenarios={[scenario]}
        loadedScenarioId={null}
        onLoad={vi.fn()}
        onUnload={vi.fn()}
        onDelete={onDelete}
      />,
    );

    expect(screen.queryByRole("menuitem", { name: "Delete experiment" })).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "More actions for Retire at 67" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Delete experiment" }));

    expect(screen.getByText("Delete this saved experiment?")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("menuitem", { name: "Delete permanently" }));
    expect(onDelete).toHaveBeenCalledWith("retire-67");
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
        onUnload={vi.fn()}
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
