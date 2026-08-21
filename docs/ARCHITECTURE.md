# 🏗️ Polaris Retirement Planner Architecture

> **Version 1.2.0**

---

# Overview

Polaris Retirement Planner is a single-page application built with **React**, **TypeScript** and **Vite**.

The architecture follows one central rule:

> **Every analysis page works from the currently active retirement plan, while scenarios provide safe alternatives for comparison and experimentation.**

The application separates financial calculation logic from presentation and keeps user-facing analysis components focused on explaining results rather than performing calculations themselves.

---

# High-Level Architecture

```text
                         Polaris
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
 Presentation          Application            Domain
       │                    │                    │
 Pages / Components   Contexts / Hooks     Financial engines
       │                    │                    │
       └──────────── Shared typed models ───────┘
                            │
                     Scenario system
                            │
                    Projection services
```

---

# Architectural Principles

## 1. Active plan as the source of truth

Planning choices belong to the active scenario.

```text
Active scenario
↓
Projection / drawdown input factory
↓
Financial engine
↓
Calculated result
↓
Educational presentation
```

Analysis pages should not maintain independent copies of retirement decisions.

## 2. My Plan owns configuration

My Plan is the primary editing surface for retirement choices.

Drawdown, Overview and other analysis pages should consume those choices and explain their effect. Avoid adding duplicate controls for retirement age, planning age, State Pension, spending strategy or similar plan inputs in multiple places.

## 3. Financial logic stays outside UI components

Pages and components may derive presentation metrics from calculated results, but core pension, tax and drawdown calculations belong in the engine/domain layer.

This separation keeps calculations testable and prevents visual redesigns from changing financial behaviour unintentionally.

## 4. Immutable planning updates

Scenario state should be updated through context/service APIs rather than mutated inside pages.

## 5. Backward compatibility

Stored scenarios and deep links may outlive visible terminology. For example, v1.2 displays **Retirement journey** while retaining `?tab=timeline`, and displays **How it works** while retaining `?tab=assumptions`.

Do not break stored or linked identifiers merely to match new labels unless a migration is deliberately introduced.

---

# Main Layers

## Pages

Pages compose workflows, routing and high-level layout.

Examples include Overview, My Plan, Compare and Drawdown.

Pages should avoid embedding financial algorithms.

## Components

Components provide reusable visual and interaction patterns, including:

- scenario controls
- charts and explorers
- educational summaries
- disclosures and tables
- tooltips
- navigation

## Contexts and Hooks

Contexts and hooks connect scenario state, stored planning data and calculated projections to pages.

## Domain and Engine

Financial engines calculate projection and drawdown results using typed input and output models.

Important areas include:

- pension projection
- retirement drawdown
- tax estimation
- State Pension integration
- spending phases
- investment growth and fees
- financial validation

---

# Drawdown Architecture in v1.2

Version 1.2 treats Drawdown as an explanation of the saved plan.

## Input flow

```text
Active scenario inputs
+ retirement goals
+ stored drawdown preferences
+ pension projection
↓
createDrawdownInputsFromPlan
↓
Drawdown input validation
↓
DrawdownEngine.calculate
↓
DrawdownResult
```

The same result powers both Simple and Detailed experiences.

## Simple view

Simple view presents:

- retirement journey
- important observations
- retirement income sources
- educational illustration guidance

It should not introduce additional financial configuration.

## Detailed workspace

Detailed Drawdown contains four tabs:

### Income

Uses the calculated yearly result to explain retirement-income sources, tax and money available to spend.

### Balance

Uses the same yearly result to explain pension movement through balance-waterfall and selected-year context components.

### Retirement journey

Identifies important ages and turns them into a compact retirement story, with the complete yearly dataset available as an optional reference.

### How it works

Explains plan choices, result interpretation, investment estimates and tax estimates. Detailed calculation order is kept inside a disclosure rather than being the default presentation.

---

# Presentation Metrics

Some values are appropriate to derive in presentation components because they explain an already calculated result rather than change the financial outcome.

Examples:

- annual withdrawal rate as a percentage of opening pension
- investment growth as a percentage of money leaving the pension
- annual percentage movement
- percentage of retirement pension remaining

These should be derived only from engine outputs and must not feed back into the financial calculation.

---

# Money Display

The financial engine operates using nominal/future-pound values.

Presentation utilities convert yearly values for **Today's Money** display using the configured inflation assumption.

The display mode changes presentation only; it must not change the active plan or engine result.

Financial validation tests should protect the real/nominal relationship.

---

# Scenarios

Scenarios support:

- active-plan switching
- editing
- duplication
- comparison selection
- stored drawdown preferences

Components that depend on scenario state must be rendered under the scenario provider and should use the shared scenario hooks/context API.

---

# Styling

Styles are split into foundations, shared components, themes and feature/layout styles.

Feature-specific Drawdown styles are intentionally separated for areas such as:

- detailed Income
- Balance explorer and waterfall
- Retirement Journey
- How it works

New CSS should reuse existing tokens and shared UI primitives before introducing feature-specific rules.

---

# Accessibility

Architecture should preserve semantic HTML and accessible state:

- tab/tabpanel relationships
- disclosures using native `details` / `summary` where suitable
- semantic tables
- keyboard navigation
- visible focus
- accessible names for icon-only indicators

Accessible names are tested and therefore form part of the UI contract.

---

# Testing and Release Gate

The project uses Vitest and Testing Library for component and workflow tests, alongside financial-validation tests for calculation behaviour.

The complete local release gate is:

```bash
npm run verify
```

which runs linting, TypeScript checking, automated tests and a production build.

---

# Future Architecture

Potential future work includes stronger persistent storage, import/export, reporting and cloud-backed accounts. These should preserve the existing boundaries between planning state, financial engines and educational presentation.

---

**Polaris Retirement Planner — Architecture v1.2.0**
