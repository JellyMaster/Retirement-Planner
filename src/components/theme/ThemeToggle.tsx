import { useTheme } from "../../theme/useTheme";

export function ThemeToggle() {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDarkMode =
    theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        isDarkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      aria-pressed={isDarkMode}
      title={
        isDarkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      <span
        aria-hidden="true"
        className="theme-toggle__icon"
      >
        {isDarkMode ? "☀️" : "🌙"}
      </span>

      <span className="theme-toggle__label">
        {isDarkMode
          ? "Light mode"
          : "Dark mode"}
      </span>
    </button>
  );
}