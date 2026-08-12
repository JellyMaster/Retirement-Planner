import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { TabKeyboardNavigation } from "./components/navigation/TabKeyboardNavigation";
import {
  ActiveScenarioSwitcher,
  ScenarioProvider,
  useScenarios,
} from "./components/scenarios";
import { ThemeToggle } from "./components/theme/ThemeToggle";
import { SkipLink } from "./components/ui";
import { AppIcons, type AppIcon } from "./icons";
import { CompareScenariosPage } from "./pages/CompareScenariosPage";
import { DrawdownPlannerPage } from "./pages/DrawdownPlannerPage";
import { ExplorePage } from "./pages/ExplorePage";
import { GuidancePage } from "./pages/GuidancePage";
import { OverviewPage } from "./pages/OverviewPage";
import { RetirementPlannerPage } from "./pages/RetirementPlannerPage";
import { WhatIfPage } from "./pages/WhatIfPage";

import "./styles/index.css";

interface NavigationItem {
  to: string;
  label: string;
  icon: AppIcon;
  end?: boolean;
}

const navigationItems: readonly NavigationItem[] = [
  { to: "/", label: "Overview", icon: AppIcons.navigation.overview, end: true },
  { to: "/plan", label: "My Plan", icon: AppIcons.navigation.plan },
  { to: "/what-if", label: "What If?", icon: AppIcons.navigation.explore },
  { to: "/compare", label: "Compare", icon: AppIcons.navigation.compare },
  { to: "/drawdown", label: "Drawdown", icon: AppIcons.navigation.drawdown },
  { to: "/explore", label: "Explore", icon: AppIcons.navigation.explore },
  { to: "/guidance", label: "Guidance", icon: AppIcons.navigation.guidance },
];

export default function App() {
  return (
    <BrowserRouter>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { activeScenarioId } = useScenarios();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    if (!isNavigationOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsNavigationOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isNavigationOpen]);

  return (
    <div className="app-shell">
      <SkipLink />
      <TabKeyboardNavigation />

      <header className="app-header">
        <div className="app-header-inner">
          <NavLink
            to="/"
            className="app-brand"
            onClick={() => setIsNavigationOpen(false)}
          >
            <span className="app-brand-mark" aria-hidden="true">
              RP
            </span>

            <span className="app-brand-copy">
              <strong>Retirement Planner</strong>
              <span>Understand, shape and use your retirement plan</span>
            </span>
          </NavLink>

          <button
            type="button"
            className="app-navigation-toggle"
            aria-expanded={isNavigationOpen}
            aria-controls="primary-navigation"
            aria-label={isNavigationOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsNavigationOpen((current) => !current)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <nav
            id="primary-navigation"
            className={
              isNavigationOpen
                ? "app-navigation app-navigation-open"
                : "app-navigation"
            }
            aria-label="Primary navigation"
          >
            <div className="app-navigation-links">
              {navigationItems.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                  onClick={() => setIsNavigationOpen(false)}
                >
                  <span className="nav-link-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={icon} fixedWidth />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="app-navigation-plan">
              <span className="app-navigation-divider" aria-hidden="true" />
              <ActiveScenarioSwitcher />
            </div>
          </nav>

          <div className="app-header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isNavigationOpen && (
        <button
          type="button"
          className="app-navigation-backdrop"
          aria-label="Dismiss navigation menu"
          onClick={() => setIsNavigationOpen(false)}
        />
      )}

      <div id="app-main-content" className="app-main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route
            path="/plan"
            element={<RetirementPlannerPage key={activeScenarioId} />}
          />
          <Route
            path="/what-if"
            element={<WhatIfPage key={activeScenarioId} />}
          />
          <Route path="/compare" element={<CompareScenariosPage />} />
          <Route
            path="/drawdown"
            element={<DrawdownPlannerPage key={activeScenarioId} />}
          />
          <Route
            path="/explore"
            element={<ExplorePage key={activeScenarioId} />}
          />
          <Route
            path="/guidance"
            element={<GuidancePage key={activeScenarioId} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <footer className="app-disclaimer" aria-label="Financial information disclaimer">
        <div className="app-disclaimer-inner">
          <strong>For educational and illustrative purposes only.</strong>
          <p>
            Retirement Planner provides planning illustrations and general information,
            not financial, investment, pension, tax or legal advice. Projections are
            estimates based on the information and assumptions used and are not
            guarantees of future outcomes. If you are unsure about a financial decision,
            consider speaking to a suitably qualified and regulated financial adviser.
          </p>
        </div>
      </footer>
    </div>
  );
}
