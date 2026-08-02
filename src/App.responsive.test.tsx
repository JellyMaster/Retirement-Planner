import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import App from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";

describe("responsive application navigation", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    window.localStorage.clear();
  });

  it("opens, closes with Escape and closes after navigation", async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // jsdom does not evaluate responsive CSS media queries. The mobile toggle is
    // therefore hidden by the desktop stylesheet, even though it is present and
    // its state behaviour can still be tested directly.
    const toggle = document.querySelector<HTMLButtonElement>(
      ".app-navigation-toggle",
    );

    expect(toggle).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-label", "Open navigation");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle as HTMLButtonElement);
    expect(toggle).toHaveAttribute("aria-label", "Close navigation");
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-label", "Open navigation");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle as HTMLButtonElement);
    fireEvent.click(screen.getByRole("link", { name: "Guidance" }));

    expect(toggle).toHaveAttribute("aria-label", "Open navigation");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      await screen.findByRole("heading", { name: "Know what to review next" }),
    ).toBeInTheDocument();
  });
});
