import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { TabKeyboardNavigation } from "./TabKeyboardNavigation";

const tabs = ["Overview", "Income", "Balance"] as const;

function TabHarness() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");

  return (
    <>
      <TabKeyboardNavigation />
      <div role="tablist" aria-label="Test views">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            tabIndex={active === tab ? 0 : -1}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div role="tabpanel">{active}</div>
    </>
  );
}

describe("TabKeyboardNavigation", () => {
  it("moves through tabs with arrow, Home and End keys", async () => {
    const user = userEvent.setup();
    render(<TabHarness />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Income" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Income" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Balance" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(overview).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Balance" })).toHaveFocus();
  });
});
