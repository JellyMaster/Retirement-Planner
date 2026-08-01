import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ScenarioComparisonTabs } from "./ScenarioComparisonTabs";

describe("ScenarioComparisonTabs", () => {
  it("shows one comparison view at a time", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioComparisonTabs
        outcomes={<p>Outcome content</p>}
        chart={<p>Chart content</p>}
        changes={<p>Changes content</p>}
      />,
    );

    expect(screen.getByText("Outcome content")).toBeVisible();
    expect(screen.getByText("Chart content")).not.toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Growth chart" }));

    expect(screen.getByText("Outcome content")).not.toBeVisible();
    expect(screen.getByText("Chart content")).toBeVisible();
    expect(
      screen.getByRole("tab", { name: "Growth chart" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("supports arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioComparisonTabs
        outcomes={<p>Outcome content</p>}
        chart={<p>Chart content</p>}
        changes={<p>Changes content</p>}
      />,
    );

    const outcomesTab = screen.getByRole("tab", { name: "Outcomes" });
    outcomesTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Growth chart" })).toHaveFocus();
    expect(screen.getByText("Chart content")).toBeVisible();
  });
});
