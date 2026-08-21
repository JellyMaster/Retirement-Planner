# 🚀 Polaris Retirement Planner Features

> **Version 1.2.0**

---

# Introduction

Polaris Retirement Planner combines retirement modelling, education, scenario analysis and guided decision support in one application.

Version 1.2 strengthens the educational Drawdown experience and establishes a consistent plain-English standard for detailed retirement analysis.

---

# Feature Overview

| Area | Status |
|---|---|
| Overview Dashboard | ✅ |
| My Plan | ✅ |
| Scenario Management | ✅ |
| Compare Plans | ✅ |
| What If? Decision Lab | ✅ |
| Drawdown — Simple | ✅ |
| Drawdown — Detailed Income | ✅ |
| Drawdown — Detailed Balance | ✅ |
| Drawdown — Retirement Journey | ✅ |
| Drawdown — How it works | ✅ |
| Explore Learning Centre | ✅ |
| Guidance Centre | ✅ |
| Responsive Design | ✅ |
| Dark Mode | ✅ |
| Accessibility | ✅ |

---

# Overview Dashboard

The Overview gives a quick summary of the active retirement plan, including retirement age, pension value, retirement income, funding status, State Pension choices, tax-free cash choices and key retirement events.

---

# My Plan

My Plan is the primary place for editing retirement choices.

It includes:

- personal information
- pension savings and contributions
- retirement age and planning horizon
- retirement-income goals
- Retirement Living Standards
- State Pension
- tax-free cash
- investment return, inflation and fee estimates
- future saving changes
- advanced retirement-income strategy and spending changes

Analysis pages should explain the effect of these saved choices rather than duplicate them as configuration controls.

---

# Scenario Management and Compare

Users can:

- create, edit and duplicate plans
- switch the active plan
- select multiple plans for comparison
- compare outcomes in charts and tables
- keep the active plan visually prominent

---

# What If? Decision Lab

Decision Lab allows safe experiments without changing the active plan.

Current experiment areas include:

- retirement age
- saving more
- spending more
- lower fees
- inflation
- State Pension
- market downturns

Experiments can be saved as new scenarios.

---

# Drawdown

Drawdown explains how the active plan may work after retirement.

## Simple view

The Simple view focuses on guidance and understanding:

- what happens over time
- important observations worth reviewing
- how private pension and State Pension work together
- educational explanation of the illustration

## Detailed — Income

Purpose: explain where retirement money comes from and how it changes.

Includes:

- money from the private pension
- State Pension
- estimated tax
- money available to spend
- planned income
- selected-year explanations
- important retirement-income changes
- expandable income-by-year reference

## Detailed — Balance

Purpose: explain why the pension rises or falls.

Includes:

- opening pension
- investment growth
- money taken out
- fees
- inflation context
- closing pension
- withdrawal rate
- growth coverage
- yearly percentage movement
- next-year context
- pension longevity summary
- expandable balance-by-year reference

## Detailed — Retirement Journey

Purpose: explain the important moments along the retirement plan.

Possible journey points include:

- retirement begins
- State Pension starts
- planned spending changes
- planned income is no longer fully met
- private pension is fully used
- planning period ends

A collapsed retirement-by-year reference provides the underlying figures when needed.

## Detailed — How it works

Purpose: explain how to interpret the results and make the calculation basis transparent.

The page covers:

- choices taken from the active plan
- how to understand Today's Money and Future Money
- investment estimates
- inflation
- pension fees
- tax estimates
- illustration-versus-prediction guidance
- optional detailed yearly calculation method

---

# State Pension

State Pension can be included or excluded in My Plan, with an annual amount and starting age. Drawdown explains when it starts and how it can reduce the amount needed from the private pension.

---

# Tax-Free Cash

Polaris supports tax-free cash planning and reflects its effect on the pension available for retirement income.

---

# Explore Learning Centre

Interactive learning uses the active retirement plan to explain topics including:

- investment growth
- inflation
- pension fees
- sequence-of-returns risk
- market downturns
- retirement timing

---

# Guidance Centre

Guidance identifies areas worth reviewing and links users back into the relevant planning workflow.

Guidance should remain educational and should not be presented as regulated personal financial advice.

---

# Money Display

Drawdown supports two consistent views:

- **Today's Money** — future values expressed using today's buying power
- **Future Money** — projected pound amounts in each future year, including inflation

Changing the display mode does not change the underlying retirement plan.

---

# Accessibility and Responsive Design

Polaris supports:

- keyboard navigation
- accessible tabs, dialogs and disclosures
- visible focus states
- screen-reader labels
- reduced-motion preferences
- responsive desktop, tablet and mobile layouts
- light and dark themes

---

# Automated Testing

The test suite covers components, navigation, scenarios, projections, Drawdown, educational wording and financial validation.

The local release gate is:

```bash
npm run verify
```

---

# Current Scope

Version 1.2 remains a single-user planning application. Cloud accounts, multi-device synchronisation, adviser collaboration and persistent online storage are future work.

---

# Design Standard

Version 1.2 establishes the following product rule:

> **Use plain English by default. Keep technical detail available as a reference rather than making it the main experience.**

See `docs/DESIGN.md` for the maintained design language.

---

**Polaris Retirement Planner — Feature Guide v1.2.0**
