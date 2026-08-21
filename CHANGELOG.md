# Changelog

All notable changes to **Polaris Retirement Planner** are documented in this file.

The format is based on **Keep a Changelog** and follows **Semantic Versioning (SemVer)**.

---

# [1.2.0] - 2026-08-21

## Educational Drawdown Workspace

Version **1.2.0** completes a major redesign of Drawdown around plain-English education, progressive disclosure and a consistent Detailed workspace.

## Added

### Detailed Income

- Added an educational income explorer showing money from the private pension, State Pension, estimated tax, planned income and money available to spend.
- Added selected-year explanations covering what changed and what it means for the plan.
- Added retirement-income summary questions and a consistent expandable year-by-year reference table.
- Added selected-year indicators and clearer plain-English yearly table labels.

### Detailed Balance

- Added a balance waterfall showing opening pension, investment growth, money taken out, fees, inflation context and closing pension.
- Added withdrawal-rate, investment-growth coverage and annual percentage-movement context.
- Added selected-year explanations, next-year context and pension longevity summaries.
- Added a consistent expandable balance-by-year reference table with selected-year indication.

### Retirement Journey

- Replaced the technical Timeline experience with a Retirement Journey focused on the important moments in the plan.
- Added retirement, State Pension, spending-change, income-concern, pension-exhaustion and planning-end milestones where relevant.
- Added a compact journey summary and a collapsed retirement-by-year reference table with filtering and pagination.

### How it works

- Reframed the Assumptions tab as **How it works** while preserving the existing `?tab=assumptions` route for compatibility.
- Grouped information into retirement-plan choices, result interpretation, investment estimates and tax estimates.
- Added explanations for Today's Money, Future Money, inflation, investment growth and why pension balances can fall.
- Added an optional calculation reference for users who want the detailed yearly calculation order.

### Education and clarity

- Added a persistent educational / financial-advice disclaimer.
- Added clearer State Pension milestone explanations.
- Added consistent Simple versus Detailed language: Simple focuses on guidance; Detailed exposes the mechanics without unnecessary jargon.
- Expanded educational tooltips and explanatory copy throughout Drawdown.

## Changed

- Reworked Drawdown so the saved plan is the source of truth rather than asking users to configure the same retirement choices again.
- Simplified the Simple Drawdown experience around retirement journey, important observations and income sources.
- Standardised plain-English terminology including **money from your pension**, **money available to spend**, **money left in your pension** and **planned income**.
- Removed obsolete ending-reserve goal output from Detailed Balance because the current My Plan journey no longer asks users to configure it.
- Reduced dense technical content by moving yearly data and calculation mechanics into optional reference disclosures.
- Improved responsive spacing, disclosure layouts and visual hierarchy across Detailed Drawdown.

## Fixed

- Corrected financial-validation expectations for real balances when nominal return equals inflation.
- Corrected waterfall alignment when explanatory context is present on only some movement items.
- Kept navigation deep links backward compatible after renaming Timeline to Retirement journey and Assumptions to How it works.
- Updated query-owned navigation and component tests for the new accessible labels.
- Hardened balance movement typing under strict TypeScript settings.

## Quality

- Expanded component tests for Income, Balance, Retirement Journey and How it works.
- Added regression coverage for educational wording and removal of stale reserve-goal output.
- Added financial-validation coverage for real and nominal drawdown values.
- Release candidate is intended to pass the full `npm run verify` gate before merge.

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

## Initial Stable Release

Version **1.0.0** established the Polaris retirement planning platform with the Overview dashboard, My Plan, retirement income planning, scenario management and comparison, Drawdown, Decision Lab, Explore, Guidance, responsive design, dark mode and automated testing.

---

# Future Releases

## Version 1.3

### Connected Data and Reporting

Potential areas include local database support, import/export, version history, stronger persistence and printable/PDF retirement reporting.

## Version 2.0

### Polaris Cloud

Future vision includes user accounts, cloud synchronisation, adviser mode, shared retirement plans and secure backups.

---

**Polaris Retirement Planner**

Current release: **Version 1.2.0**

Released **21 August 2026**
