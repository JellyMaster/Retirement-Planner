import {
  Compass,
  GitCompareArrows,
  LayoutDashboard,
  Lightbulb,
  Settings2,
  WalletCards,
} from "lucide-react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { ThemeToggle } from "./components/theme/ThemeToggle";
import { SkipLink } from "./components/ui";
import { DrawdownPlannerPage } from "./pages/DrawdownPlannerPage";
import { PolarisSectionPage } from "./pages/PolarisSectionPage";
import { RetirementPlannerPage } from "./pages/RetirementPlannerPage";

import "./styles/index.css";

const navigationItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/plan", label: "My Plan", icon: Settings2 },
  { to: "/drawdown", label: "Drawdown", icon: WalletCards },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/guidance", label: "Guidance", icon: Lightbulb },
] as const;

export default function App() {
  return (
    <BrowserRouter>
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
              {navigationItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  <span className="nav-link-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="app-header-actions">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div id="app-main-content" className="app-main-content" tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={
                <PolarisSectionPage
                  eyebrow="Project Polaris"
                  title="Your retirement overview"
                  description="See what you have, where your plan is heading, whether you are on track and which actions deserve your attention next."
                  primaryAction={{ label: "Review my plan", to: "/plan" }}
                />
              }
            />
            <Route path="/plan" element={<RetirementPlannerPage />} />
            <Route path="/drawdown" element={<DrawdownPlannerPage />} />
            <Route
              path="/compare"
              element={
                <PolarisSectionPage
                  eyebrow="Compare"
                  title="Explore alternative plans"
                  description="Compare your current plan with retirement ages, contribution levels, income targets and other what-if scenarios."
                  primaryAction={{ label: "Review my baseline plan", to: "/plan" }}
                />
              }
            />
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
    </BrowserRouter>
  );
}
