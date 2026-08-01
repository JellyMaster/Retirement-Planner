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
      screen.getByRole("heading", { name: "Baseline Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Compare projected outcomes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /projected pension pot/i })).toBeInTheDocument();
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

    expect(
      screen.getByRole("heading", { name: "Retire at 65" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Retire at 65" }),
    ).toBeInTheDocument();

    const card = screen
      .getByRole("heading", { name: "Retire at 65" })
      .closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("Active")).toBeInTheDocument();
    expect(
      within(card as HTMLElement).getByRole("checkbox", {
        name: "Include in comparison",
      }),
    ).toBeChecked();
  });

  it("edits a scenario in a modal and refreshes its comparison", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Retire at 65",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const card = screen
      .getByRole("heading", { name: "Retire at 65" })
      .closest("article");
    expect(card).not.toBeNull();

    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Edit scenario" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Retire at 65" });
    const retirementAge = within(dialog).getByRole("spinbutton", {
      name: "Retirement age",
    });
    await user.clear(retirementAge);
    await user.type(retirementAge, "65");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(card as HTMLElement).getByText("Age 65")).toBeInTheDocument();
    expect(
      screen.getByRole("row", { name: /retirement age age 68 age 65/i }),
    ).toBeInTheDocument();
  });

  it("cancels modal edits without changing the scenario", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = screen
      .getByRole("heading", { name: "Baseline Plan" })
      .closest("article");
    expect(card).not.toBeNull();

    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Edit scenario" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Baseline Plan" });
    const currentPot = within(dialog).getByRole("spinbutton", {
      name: "Current pension pot",
    });
    await user.clear(currentPot);
    await user.type(currentPot, "250000");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(card as HTMLElement).queryByText("£250,000")).not.toBeInTheDocument();
    expect(localStorage.getItem(PLAN_STORAGE_KEY)).toBeNull();
  });

  it("keeps baseline storage synchronized when the baseline is edited", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = screen
      .getByRole("heading", { name: "Baseline Plan" })
      .closest("article");
    expect(card).not.toBeNull();

    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Edit scenario" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Baseline Plan" });
    const currentPot = within(dialog).getByRole("spinbutton", {
      name: "Current pension pot",
    });
    await user.clear(currentPot);
    await user.type(currentPot, "250000");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    const saved = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) ?? "null");
    expect(saved.currentPot).toBe(250_000);
  });

  it("can remove and restore an alternative in the comparison", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "Scenario name" }),
      "Higher Contributions",
    );
    await user.click(screen.getByRole("button", { name: "Create scenario" }));

    const card = screen
      .getByRole("heading", { name: "Higher Contributions" })
      .closest("article");
    expect(card).not.toBeNull();
    const checkbox = within(card as HTMLElement).getByRole("checkbox", {
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

    const baselineCard = screen
      .getByRole("heading", { name: "Baseline Plan" })
      .closest("article");
    expect(baselineCard).not.toBeNull();

    await user.click(
      within(baselineCard as HTMLElement).getByRole("button", {
        name: "Duplicate",
      }),
    );

    const copyHeading = screen.getByRole("heading", {
      name: "Baseline Plan Copy",
    });
    const copyCard = copyHeading.closest("article");
    expect(copyCard).not.toBeNull();

    await user.click(
      within(copyCard as HTMLElement).getByRole("button", { name: "Rename" }),
    );
    const renameInput = within(copyCard as HTMLElement).getByRole("textbox", {
      name: "Scenario name",
    });
    await user.clear(renameInput);
    await user.type(renameInput, "Higher Contributions");
    await user.click(
      within(copyCard as HTMLElement).getByRole("button", { name: "Save" }),
    );

    const renamedCard = screen
      .getByRole("heading", { name: "Higher Contributions" })
      .closest("article");
    expect(renamedCard).not.toBeNull();

    await user.click(
      within(renamedCard as HTMLElement).getByRole("button", { name: "Delete" }),
    );

    expect(
      screen.queryByRole("heading", { name: "Higher Contributions" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();
  });
});
