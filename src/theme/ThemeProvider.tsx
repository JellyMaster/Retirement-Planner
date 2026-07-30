import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Theme } from "./Theme";
import {
  ThemeContext,
  type ThemeContextValue,
} from "./ThemeContext";

const THEME_STORAGE_KEY = "retirement-planner-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

function getInitialTheme(): Theme {
  const storedTheme =
    window.localStorage.getItem(
      THEME_STORAGE_KEY
    );

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  const prefersDarkMode =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  return prefersDarkMode
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] =
    useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      theme
    );
  }, [theme]);

  const value =
    useMemo<ThemeContextValue>(
      () => ({
        theme,
        setTheme,
        toggleTheme: () => {
          setTheme((currentTheme) =>
            currentTheme === "light"
              ? "dark"
              : "light"
          );
        },
      }),
      [theme]
    );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}