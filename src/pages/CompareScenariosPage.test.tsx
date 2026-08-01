import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "../components/scenarios";
import { SCENARIO_STORAGE_KEY } from "../domain/scenarios";
import { PLAN_STORAGE_KEY } from "../state/planStorage";
import { CompareScenariosPage } from "./CompareScenariosPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <ScenarioProvider>
        <CompareScenariosPage />
      </ScenarioProvider>
    </MemoryRouter>,
  );
}

function getScenarioCard(name: string): HTMLElement {
  const scenarioList = screen.getByRole("region", {
    name: "Choose plans to compare",
  });
  const heading = within(scenarioList).getByRole("heading", { name });
  const card = heading.closest("article");

  if (!card) {
    throw new Error(`Could not find the scenario card for ${name}.`);
  }

  return card;
}

describe("CompareScenariosPage", () => {
  beforeEach(() => {
    let id = 0;
    vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(() => {
      const value = `00000000-0000-4000-8000-${String(++id).padStart(12, "0")}`;
      return value as `${string}-${string}-${string}-${string}-${string}`;
    });
  });

  it("creates the initial baseline scenario and comparison table", () => {
    renderPage();

    expect(
      within(
        screen.getByRole("region", { name: "Choose plans to compare" }),
      ).getByRole("heading", { name: "Baseline Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Compare selected plans" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Growth chart" })).toBeInTheDocument();
    expect(
      screen.getByRole("row", { name: /projected pension pot/i }),
    ).toBeInTheDocument();

    const activeHeader = screen.getByRole("columnheader", {
      name: /baseline plan\s*active plan/i,
    });
    expect(activeHeader).toHaveClass("is-active-plan");
    expect(screen.getAllByText("Current active plan")).not.toHaveLength(0);
    expect(localStorage.getItem(SCENARIO_STORAGE_KEY)).not.toBeNull();
  });

  it("creates and automatically selects a scenario from the active plan", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Retire at 65",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const card = getScenarioCard("Retire at 65");
    expect(card).toBeInTheDocument();
    expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: /retire at 65\s*active plan/i,
      }),
    ).toBeInTheDocument();
    expect(within(card).getByText("Active")).toBeInTheDocument();
    expect(
      within(card).getByRole("checkbox", {
        name: "Active plan included",
      }),
    ).toBeChecked();
  });

  it("compares values with the active plan and highlights its column", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Retire at 65",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const scenarioCard = getScenarioCard("Retire at 65");
    await user.click(
      within(scenarioCard).getByRole("button", {
        name: "Edit scenario",
      }),
    );

    const dialog = screen.getByRole("dialog", { name: "Retire at 65" });
    const retirementAge = within(dialog).getByRole("spinbutton", {
      name: "Retirement age",
    });
    await user.clear(retirementAge);
    await user.type(retirementAge, "65");
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    const scenarioHeader = screen.getByRole("columnheader", {
      name: /retire at 65\s*active plan/i,
    });
    expect(scenarioHeader).toHaveClass("is-active-plan");

    const retirementRow = screen.getByRole("row", {
      name: /retirement age/i,
    });
    expect(
      within(retirementRow).getByText("Greater by 3 years"),
    ).toBeInTheDocument();
    expect(
      within(retirementRow).getByText("Current active plan"),
    ).toBeInTheDocument();

    const baselineCard = getScenarioCard("Baseline Plan");
    await user.click(
      within(baselineCard).getByRole("button", {
        name: "Make active",
      }),
    );

    expect(
      screen.getByRole("columnheader", {
        name: /baseline plan\s*active plan/i,
      }),
    ).toHaveClass("is-active-plan");
    expect(
      within(screen.getByRole("row", { name: /retirement age/i })).getByText(
        "Less by 3 years",
      ),
    ).toBeInTheDocument();
  });

  it("edits a scenario in a modal and refreshes its comparison", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Retire at 65",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const card = getScenarioCard("Retire at 65");
    await user.click(
      within(card).getByRole("button", { name: "Edit scenario" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Retire at 65" });
    const retirementAge = within(dialog).getByRole("spinbutton", {
      name: "Retirement age",
    });
    await user.clear(retirementAge);
    await user.type(retirementAge, "65");
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(card).getByText("Age 65")).toBeInTheDocument();
    expect(
      within(screen.getByRole("row", { name: /retirement age/i })).getByText(
        "Age 65",
      ),
    ).toBeInTheDocument();
  });

  it("cancels modal edits without changing the scenario", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = getScenarioCard("Baseline Plan");
    await user.click(
      within(card).getByRole("button", { name: "Edit scenario" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Baseline Plan" });
    const currentPot = within(dialog).getByRole("spinbutton", {
      name: "Current pension pot",
    });
    await user.clear(currentPot);
    await user.type(currentPot, "250000");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(card).queryByText("£250,000")).not.toBeInTheDocument();
    expect(localStorage.getItem(PLAN_STORAGE_KEY)).toBeNull();
  });

  it("keeps baseline storage synchronized when the baseline is edited", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = getScenarioCard("Baseline Plan");
    await user.click(
      within(card).getByRole("button", { name: "Edit scenario" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Baseline Plan" });
    const currentPot = within(dialog).getByRole("spinbutton", {
      name: "Current pension pot",
    });
    await user.clear(currentPot);
    await user.type(currentPot, "250000");
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    const saved = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) ?? "null");
    expect(saved.currentPot).toBe(250_000);
  });

  it("can remove and restore a non-active alternative in the comparison", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Higher Contributions",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const baselineCard = getScenarioCard("Baseline Plan");
    await user.click(
      within(baselineCard).getByRole("button", {
        name: "Make active",
      }),
    );

    const card = getScenarioCard("Higher Contributions");
    const checkbox = within(card).getByRole("checkbox", {
      name: "Include in comparison",
    });

    await user.click(checkbox);
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Higher Contributions" }),
    ).not.toBeInTheDocument();

    await user.click(checkbox);
    expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Higher Contributions" }),
    ).toBeInTheDocument();
  });

  it("duplicates, renames and deletes an alternative scenario", async () => {
    const user = userEvent.setup();
    renderPage();

    const baselineCard = getScenarioCard("Baseline Plan");
    await user.click(
      within(baselineCard).getByRole("button", {
        name: "Duplicate",
      }),
    );

    const copyCard = getScenarioCard("Baseline Plan Copy");
    await user.click(
      within(copyCard).getByRole("button", { name: "Rename" }),
    );
    const renameInput = within(copyCard).getByRole("textbox", {
      name: "Scenario name",
    });
    await user.clear(renameInput);
    await user.type(renameInput, "Higher Contributions");
    await user.click(
      within(copyCard).getByRole("button", { name: "Save" }),
    );

    const renamedCard = getScenarioCard("Higher Contributions");
    await user.click(
      within(renamedCard).getByRole("button", { name: "Delete" }),
    );

    expect(
      within(
        screen.getByRole("region", { name: "Choose plans to compare" }),
      ).queryByRole("heading", { name: "Higher Contributions" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();
  });
});
