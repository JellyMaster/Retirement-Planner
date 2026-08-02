import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import {
  DrawdownWorkspaceNavigation,
  type DrawdownWorkspaceSection,
} from "../drawdown/DrawdownWorkspaceNavigation";
import {
  ExperimentLauncher,
  type ExperimentId,
} from "../what-if/ExperimentLauncher";

describe("query-owned workspace navigation", () => {
  it("opens and records the requested What If experiment", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/what-if?experiment=fees"]}>
        <ExperimentHarness />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Lower fees/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );

    await user.click(screen.getByRole("button", { name: /Inflation/i }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/what-if?experiment=inflation",
    );
  });

  it("opens and records the requested Drawdown tab", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/drawdown?tab=balance"]}>
        <DrawdownHarness />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Balance" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );

    await user.click(screen.getByRole("tab", { name: "Timeline" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/drawdown?tab=timeline",
    );
  });
});

function ExperimentHarness() {
  const [active, setActive] = useState<ExperimentId>("retirement-age");
  return (
    <>
      <ExperimentLauncher activeExperiment={active} onSelect={setActive} />
      <LocationValue />
    </>
  );
}

function DrawdownHarness() {
  const [active, setActive] =
    useState<DrawdownWorkspaceSection>("overview");
  return (
    <>
      <DrawdownWorkspaceNavigation value={active} onChange={setActive} />
      <LocationValue />
    </>
  );
}

function LocationValue() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}
