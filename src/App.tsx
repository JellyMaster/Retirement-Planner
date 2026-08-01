import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import { RetirementPlannerPage } from "./pages/RetirementPlannerPage";
import { DrawdownPlannerPage } from "./pages/DrawdownPlannerPage";
import { ThemeToggle } from "./components/theme/ThemeToggle";

import "./styles/ui-components.css";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
       <header className="app-header">
  <div className="app-header-inner">
    <NavLink to="/" className="app-brand">
      <span className="app-brand-mark" aria-hidden="true">
        RP
      </span>

      <span className="app-brand-copy">
        <strong>Retirement Planner</strong>
        <span>Plan, project and draw down</span>
      </span>
    </NavLink>

    <nav className="app-navigation" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }
      >
        <span className="nav-link-icon" aria-hidden="true">
          ↑
        </span>
        <span>Projection</span>
      </NavLink>

      <NavLink
        to="/drawdown"
        className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }
      >
        <span className="nav-link-icon" aria-hidden="true">
          ↓
        </span>
        <span>Drawdown</span>
      </NavLink>
    </nav>

    <div className="app-header-actions">
      <ThemeToggle />
    </div>
  </div>
</header>

        <Routes>
          <Route path="/" element={<RetirementPlannerPage />} />
          <Route path="/drawdown" element={<DrawdownPlannerPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}