import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useTheme } from "../../theme/useTheme";
import { ThemeToggle } from "./ThemeToggle";

vi.mock("../../theme/useTheme");

const mockedUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  it("renders light mode as an unchecked switch and toggles the theme", async () => {
    const user = userEvent.setup();
    const toggleTheme = vi.fn();
    mockedUseTheme.mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      toggleTheme,
    });

    render(<ThemeToggle />);

    const themeSwitch = screen.getByRole("switch", {
      name: "Switch to dark mode",
    });
    expect(themeSwitch).toHaveAttribute("aria-checked", "false");

    await user.click(themeSwitch);
    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it("renders dark mode as a checked switch", () => {
    mockedUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);

    expect(
      screen.getByRole("switch", { name: "Switch to light mode" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
