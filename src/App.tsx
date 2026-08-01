import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";

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
import { OverviewPage } from "./pages/OverviewPage";
import { PolarisSectionPage } from "./pages/PolarisSectionPage";
import { RetirementPlannerPage } from "./pages/RetirementPlannerPage";

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
  { to: "/drawdown", label: "Drawdown", icon: AppIcons.navigation.drawdown },
  { to: "/compare", label: "Compare", icon: AppIcons.navigation.compare },
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

  return (
    <div className="app-shell">
      <SkipLink />

      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              RP
            </span>

            <span className="app-brand-copy">
              <strong>Retirement Planner</strong>
              <span>Understand, shape and use your retirement plan</span>
            </span>
          </NavLink>

          <nav className="app-navigation" aria-label="Primary navigation">
            {navigationItems.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                <span className="nav-link-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={icon} fixedWidth />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}

            <span className="app-navigation-divider" aria-hidden="true" />
            <ActiveScenarioSwitcher />
          </nav>

          <div className="app-header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div id="app-main-content" className="app-main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route
            path="/plan"
            element={<RetirementPlannerPage key={activeScenarioId} />}
          />
          <Route
            path="/drawdown"
            element={<DrawdownPlannerPage key={activeScenarioId} />}
          />
          <Route path="/compare" element={<CompareScenariosPage />} />
          <Route
            path="/explore"
            element={
              <PolarisSectionPage
                eyebrow="Explore"
                title="Dig deeper into your retirement"
                description="Access probability modelling, goal exploration, fees, tax and other specialist planning tools."
              />
            }
          />
          <Route
            path="/guidance"
            element={
              <PolarisSectionPage
                eyebrow="Guidance"
                title="Know what to do next"
                description="Bring together recommendations, risks, quick wins and personalised coaching based on your current plan."
                primaryAction={{ label: "View my overview", to: "/" }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
