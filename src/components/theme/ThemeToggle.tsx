import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import { useTheme } from "../../theme/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const actionLabel = isDarkMode
    ? "Switch to light mode"
    : "Switch to dark mode";

  return (
    <button
      type="button"
      role="switch"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-checked={isDarkMode}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__track-icon theme-toggle__track-icon--light">
          <FontAwesomeIcon icon={AppIcons.sun} />
        </span>
        <span className="theme-toggle__track-icon theme-toggle__track-icon--dark">
          <FontAwesomeIcon icon={AppIcons.moon} />
        </span>
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}
