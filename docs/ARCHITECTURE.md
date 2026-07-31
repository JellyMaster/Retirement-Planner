# Retirement Planner Architecture

This document describes the high-level architecture of the application.

---

# Overview

The application is intentionally divided into independent calculation engines and presentation components.

```
                 UI

                 │

        Retirement Planner Page

                 │

 ┌───────────────┼─────────────────┐

 Guided Form   Dashboards      Charts

                 │

         Projection Engine

                 │

     Drawdown & Comparison

                 │

         Shared Utilities
```

---

# Projection Engine

Responsibilities

- Pension growth
- Contributions
- Salary growth
- Inflation
- Fees
- Retirement projections

Output

- Year-by-year projection
- Retirement summary
- Projection charts
- Fee analysis

---

# Drawdown Engine

Responsibilities

- Retirement withdrawals
- State Pension
- Income tax
- Sustainable withdrawals
- Pension depletion
- Income shortfall

Output

- Drawdown projection
- Income analysis
- Retirement sustainability

---

# Retirement Health

Calculates an overall retirement health score.

Factors include

- Retirement readiness
- Contribution levels
- Fund adequacy
- Investment assumptions
- Drawdown sustainability

Produces

- Health score
- Risks
- Strengths
- Recommendations

---

# Comparison Engine

Allows users to compare multiple retirement plans.

Supports

- Side-by-side comparisons
- Retirement health comparison
- Projection comparison
- Drawdown comparison

---

# User Interface

Current workflow

Guided Retirement Planner

↓

Projection Engine

↓

Retirement Overview

↓

Retirement Health

↓

What If Analysis

↓

Recommendations

↓

Charts

↓

Projection Tables

---

# Shared Components

Reusable form library

- FormSection
- FormField
- CurrencyInput
- PercentageInput
- NumberInput
- ToggleSwitch

Shared icons

- Font Awesome Pro
- Central icon library

---

# Testing

The project uses

- Vitest
- TypeScript
- ESLint

Core engines are tested independently from the UI.

---

# Design Principles

- Strong typing
- Modular architecture
- Reusable components
- Separation of UI and calculation logic
- Testable business logic
- Responsive design