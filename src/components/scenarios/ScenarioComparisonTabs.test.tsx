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
        insights={<p>Insights content</p>}
      />,
    );

    expect(screen.getByText("Outcome content")).toBeVisible();
    expect(screen.getByText("Chart content")).not.toBeVisible();
    expect(screen.getByText("Insights content")).not.toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Insights" }));

    expect(screen.getByText("Outcome content")).not.toBeVisible();
    expect(screen.getByText("Insights content")).toBeVisible();
    expect(screen.getByRole("tab", { name: "Insights" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("supports arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioComparisonTabs
        outcomes={<p>Outcome content</p>}
        chart={<p>Chart content</p>}
        changes={<p>Changes content</p>}
        insights={<p>Insights content</p>}
      />,
    );

    const outcomesTab = screen.getByRole("tab", { name: "Outcomes" });
    outcomesTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Growth chart" })).toHaveFocus();
    expect(screen.getByText("Chart content")).toBeVisible();
  });

  it("moves to insights with the End key", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioComparisonTabs
        outcomes={<p>Outcome content</p>}
        chart={<p>Chart content</p>}
        changes={<p>Changes content</p>}
        insights={<p>Insights content</p>}
      />,
    );

    screen.getByRole("tab", { name: "Outcomes" }).focus();
    await user.keyboard("{End}");

    expect(screen.getByRole("tab", { name: "Insights" })).toHaveFocus();
    expect(screen.getByText("Insights content")).toBeVisible();
  });
});
