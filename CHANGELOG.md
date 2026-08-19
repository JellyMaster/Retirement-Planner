# Changelog

All notable changes to **Polaris Retirement Planner** are documented in this file.

The format is based on **Keep a Changelog** and follows **Semantic Versioning (SemVer)**.

---

# [1.1.0] - 2026-08-19

## Retirement Journey and Income Strategy

Version **1.1.0** focuses on making retirement planning easier to understand and making the Overview reflect the retirement strategy actually selected by the user.

## Added

### Retirement income goals

- Added two simple ways to set a retirement income goal: a custom annual amount or the Retirement Living Standards.
- Added Minimum, Moderate and Comfortable Retirement Living Standards choices.
- Persisted the selected income-goal source and retained the user's custom target when switching between goal types.
- Added lifestyle-aware summaries across My Plan and the Overview.

### Retirement strategy

- Remodelled Advanced Retirement Strategy around plain-English retirement questions.
- Added clear Stable income and Flexible income choices.
- Added a question-led choice for whether spending remains broadly consistent or changes through retirement.
- Consolidated State Pension and tax-free cash decisions into a clearer retirement-strategy journey.
- Improved support for target-income, percentage-withdrawal and tiered spending strategies.

### Retirement journey chart

- Extended the Overview pension chart from the current age through the full planning age.
- Added pension milestones including £100k, £250k, £500k, £1m and larger dynamically reached milestones.
- Added retirement, tax-free cash, State Pension, spending-change and plan-age events.
- Added interactive event explanations using the active plan's values.
- Corrected post-retirement chart values to use a consistent today's-money basis.

## Changed

### Overview

- Simplified the Overview into a clearer retirement dashboard.
- Added funding states for Successfully Funded, Needs Attention, Needs Urgent Attention and incomplete plans.
- Improved key-fact layout and retirement-income labelling.
- Updated plan-choice badges to show State Pension, tax-free cash and the effective spending strategy.
- Added Retirement Living Standards labels such as Lifestyle · Moderate and Lifestyle · Comfortable.
- Improved handling of incomplete and zero-value projections so they are not incorrectly reported as urgent funding failures.

### My Plan

- Reorganised plan creation into Essential and Advanced sections.
- Reduced duplicated controls and explanations.
- Added plan-name editing directly in the plan editor.
- Simplified future saving changes into separately enabled annual increases and additional future contributions.
- Improved summaries so advanced changes are visible without opening every section.

### Drawdown modelling

- Improved percentage and tiered withdrawal handling across saved scenarios.
- Corrected retirement balance plotting around tax-free cash and year-end drawdown values.
- Hardened sustainable-income and ending-balance calculations.
- Kept ending-pot optimisation as an experimental/What If? concern rather than a core funding-status rule.

### Scenario persistence

- Extended stored drawdown preferences for the new retirement-income goal metadata and strategy choices.
- Added safer normalisation of legacy and stored scenario data.
- Preserved backward compatibility with existing version-one scenario storage.

## Fixed

- Fixed stale Overview lifestyle labels caused by mismatched persisted field names.
- Fixed active-scenario form state mirroring that triggered React set-state-in-effect lint errors.
- Fixed stored spending-phase type narrowing and required planning-age handling.
- Fixed stale deep links and tests after the retirement-strategy wording redesign.
- Improved accessible chart and event assertions to match the interactive retirement journey.

## Quality

- Release gate verified with lint, TypeScript type checking, automated tests and production build.
- GitHub Pages workflow uses Node 22 and the current Pages deployment actions.

---

# [1.0.0] - 2026-08-02

## 🎉 Initial Stable Release

Version **1.0.0** marks the first stable public release of Polaris Retirement Planner.

Polaris evolved from a simple pension projection tool into a complete retirement planning platform capable of helping users understand, model and improve every stage of retirement planning.

## Added

### 🏠 Overview Dashboard

Introduced a personalised dashboard providing:

- Retirement readiness summary
- Projected pension value
- Retirement income overview
- Active scenario summary
- Plan health indicators
- Quick navigation
- Recommended next actions

### 📝 My Plan

Introduced a complete guided planning experience with personal details, pension details, contribution planning, investment assumptions, retirement goals, State Pension planning and tax-free cash planning.

### Retirement Income Planning

Introduced flexible retirement income planning with Active Retirement, Settled Retirement and Later Life spending phases.

### 🧪 What If? Decision Lab

Introduced experiments for Retirement Age, Save More, Spend More, Lower Fees, Inflation, State Pension and Market Downturn, with the ability to save experiments as scenarios.

### ⚖ Scenario Comparison

Added multiple retirement plans, active scenario switching, side-by-side comparisons, comparison charts and comparison tables.

### 💷 Drawdown Planner

Added lifetime balance projection, withdrawal planning, spending phases, retirement timeline, State Pension integration and sustainability analysis.

### 🎓 Explore

Introduced personalised retirement education covering investment growth, retirement timing, inflation, pension fees, sequence-of-returns risk and market downturns.

### 🧭 Guidance

Added personalised planning recommendations, areas requiring attention, suggested next actions and direct navigation into relevant planning sections.

## User Experience

Added responsive layouts, Dark Mode, connected page journeys, guided editing, accessible navigation, keyboard navigation improvements and improved mobile support.

## Scenario System

Added multiple scenarios, active plan management, scenario editing, duplication, comparison and baseline-plan preservation.

## Technical

Application rebuilt using React 19, TypeScript and Vite with shared planning models, shared scenario architecture, context providers, improved routing, a shared design system, theme support and extensive automated testing.

## Accessibility

Improved keyboard navigation, tab navigation, focus management, modal accessibility, screen-reader compatibility and responsive layouts.

## Known Limitations

Version 1.0.0 intentionally focused on single-user retirement planning. Cloud accounts, database persistence, multi-device synchronisation, PDF retirement reports and advanced investment analytics remain future work.

---

# Future Releases

## Version 1.2

### Professional Planning

Planned areas include richer retirement-outcome comparisons, strategy-aware What If? experiments, further Drawdown UX refinement, PDF retirement reports and enhanced guidance.

## Version 1.3

### Connected Data

Planned areas include local database support, import/export, version history and offline persistence.

## Version 2.0

### Polaris Cloud

Future vision includes user accounts, cloud synchronisation, adviser mode, shared retirement plans and secure backups.

---

**Polaris Retirement Planner**

Current release: **Version 1.1.0**

Released **19 August 2026**
