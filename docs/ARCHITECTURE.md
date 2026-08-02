# 🏗️ Polaris Retirement Planner Architecture

> **Version 1.0.0**

---

# Overview

Polaris Retirement Planner is a modern single-page application (SPA) built with **React**, **TypeScript**, and **Vite**.

The application is designed around a central philosophy:

> **Every page should work from the currently active retirement plan while allowing users to safely explore alternatives through scenarios.**

The architecture emphasises:

- Separation of concerns
- Reusable components
- Predictable state management
- Strong typing
- Testability
- Accessibility
- Extensibility

This document describes how the application is organised and provides guidance for future development.

---

# High Level Architecture

```
                         Polaris
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
     Presentation        Application          Domain
        Layer              Layer              Layer
        │                    │                    │
 Components            Contexts/Hooks      Financial Logic
        │                    │                    │
        └────────────── Shared Models ───────────┘
                             │
                        Scenario Engine
                             │
                      Projection Services
```

---

# Architectural Principles

Polaris follows several key principles.

## 1. Single Source of Truth

Every calculation begins with the currently active retirement plan.

Pages should never maintain independent copies of planning data.

Instead:

```
Scenario
        ↓

Projection Service

        ↓

Calculated Results

        ↓

User Interface
```

---

## 2. Immutable Planning

Planning data should be treated as immutable.

Pages request updates.

Contexts apply changes.

Services perform calculations.

Components render results.

---

## 3. Separation of Concerns

The application separates responsibilities into clear layers.

### Pages

Responsible for:

- User workflows
- Layout
- Navigation
- Page composition

Pages should avoid containing financial calculations.

---

### Components

Responsible for:

- Reusable UI
- User interaction
- Presentation

Components should remain reusable wherever possible.

---

### Contexts

Responsible for:

- Shared application state
- Active scenario
- Theme
- Global settings

Contexts should never perform financial calculations directly.

---

### Domain

Responsible for:

- Financial models
- Projection structures
- Retirement assumptions
- Drawdown models

Domain code should remain framework independent.

---

### Services

Responsible for:

- Pension projections
- Drawdown calculations
- Scenario comparison
- Planning analysis

Services are the application's calculation engine.

---

# Folder Structure

```
src/

components/
contexts/
domain/
hooks/
pages/
services/
styles/
test/
theme/
utils/
```

---

# Application Layers

## Presentation Layer

Contains:

- Pages
- Components
- Icons
- Charts
- Forms

Purpose:

Display information.

No financial logic.

---

## State Layer

Contains:

- ScenarioProvider
- ThemeProvider
- Shared contexts

Purpose:

Manage application state.

---

## Domain Layer

Contains:

- Retirement plan models
- Scenario models
- Drawdown models
- Projection models

Purpose:

Represent business data.

---

## Service Layer

Contains:

Projection services.

Examples:

- Pension projections
- Drawdown calculations
- Scenario comparison

Purpose:

Business calculations.

---

# Page Responsibilities

## Overview

Provides a summary of the active plan.

Shows:

- Retirement readiness
- Plan health
- Key metrics
- Quick navigation

---

## My Plan

Responsible for editing.

Owns:

- Guided planner
- Retirement assumptions
- Retirement income
- State Pension
- Tax-Free Cash

---

## What If?

Responsible for experimentation.

Never changes the active plan directly.

Instead:

```
Plan

↓

Experiment

↓

Preview

↓

Save Scenario
```

---

## Compare

Responsible for analysing multiple plans.

No editing occurs here.

---

## Drawdown

Responsible for retirement income modelling.

Uses:

- Active scenario
- Retirement chapters
- Drawdown preferences

---

## Explore

Educational content.

Uses live data from the active plan.

No editing.

---

## Guidance

Provides personalised recommendations.

Uses:

- Active plan
- Projection analysis
- Planning heuristics

---

# Scenario Architecture

```
Baseline Plan

        │

        ├────────────── Scenario A

        ├────────────── Scenario B

        ├────────────── Scenario C

        └────────────── Active Scenario
```

Every scenario contains a complete retirement plan.

Scenarios are isolated.

Users may compare them without affecting one another.

---

# Projection Flow

```
Scenario

↓

Projection Request

↓

Calculation Service

↓

Projection Result

↓

Charts

↓

Summary Cards

↓

Guidance
```

Every page follows this flow.

---

# Navigation

Navigation is page based.

```
Overview

↓

My Plan

↓

What If?

↓

Compare

↓

Drawdown

↓

Explore

↓

Guidance
```

Connected journeys allow pages to deep-link into specific sections.

---

# State Management

Shared state currently includes:

- Active scenario
- Available scenarios
- Theme
- User preferences

Future versions may introduce:

- Local persistence
- Cloud synchronisation

without changing page architecture.

---

# Styling

Styling follows a component-first approach.

Goals:

- Responsive layouts
- Consistent spacing
- Accessible colours
- Dark mode support

---

# Accessibility

Version 1.0 includes:

- Keyboard navigation
- Accessible dialogs
- Screen reader support
- Focus management
- Tab navigation
- Reduced motion support

Accessibility is considered a core architectural requirement.

---

# Testing Strategy

Testing occurs at several levels.

## Unit Tests

Components

Services

Utilities

---

## Integration Tests

Pages

Navigation

Contexts

---

## User Journey Tests

Planning

Scenario creation

Comparison

Drawdown

Guidance

---

# Future Architecture

Version 1.1

Visual Intelligence

- Rich charts
- Shared timeline
- Improved analytics

---

Version 1.2

Persistence Layer

Introduce repository abstractions.

```
UI

↓

Repository

↓

Storage
```

Initially local storage.

Later database.

---

Version 2.0

Cloud Platform

```
Client

↓

REST / API

↓

Authentication

↓

Cloud Database

↓

Backup

↓

Analytics
```

This architecture has intentionally been designed so these capabilities can be introduced with minimal impact on the presentation layer.

---

# Design Philosophy

Polaris favours:

- Simple interfaces
- Powerful calculations
- Incremental planning
- Explainable outcomes

Every feature should answer one question clearly before introducing additional complexity.

---

# Guiding Principle

> **Retirement planning should help people understand their future, not overwhelm them with calculations.**

This philosophy should guide every architectural decision made after Version 1.0.

---

# Version History

| Version | Status |
|----------|--------|
| 1.0.0 | Current Stable |
| 1.1 | Planned |
| 2.0 | Vision |

---

**Polaris Retirement Planner**

Architecture Documentation

Version 1.0.0

August 2026