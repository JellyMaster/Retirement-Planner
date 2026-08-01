import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "../components/scenarios";
import { SCENARIO_STORAGE_KEY } from "../domain/scenarios";
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

  it("creates the initial baseline scenario", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Baseline Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(localStorage.getItem(SCENARIO_STORAGE_KEY)).not.toBeNull();
  });

  it("creates a scenario from the active plan", async () => {
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
    expect(screen.getByText("2 scenarios")).toBeInTheDocument();

    const card = screen
      .getByRole("heading", { name: "Retire at 65" })
      .closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("Active")).toBeInTheDocument();
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
    expect(screen.getByText("1 scenario")).toBeInTheDocument();
  });
});
