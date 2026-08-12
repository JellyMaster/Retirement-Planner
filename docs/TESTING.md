# 🧪 Polaris Retirement Planner Testing Guide

> **Version 1.0.0**

---

# Introduction

Testing is considered a core part of Polaris rather than a final development step.

Every significant feature should include automated tests that verify both functionality and user interaction.

The goal is to ensure new features can be added confidently while reducing the likelihood of regressions.

---

# Testing Philosophy

Polaris follows several principles.

## Confidence over Coverage

High coverage numbers are useful.

Meaningful tests are better.

Tests should verify behaviour that users care about.

---

## Test Behaviour

Prefer testing:

✔ What the user sees

✔ What the user can do

✔ Expected outcomes

Avoid testing:

✘ Internal implementation details

✘ Private state

✘ Component internals

---

## Small, Focused Tests

Each test should verify one behaviour.

Instead of:

```
User edits plan
Creates scenario
Runs projection
Changes theme
Checks guidance
```

Prefer:

```
User changes retirement age

↓

Projection updates
```

---

# Testing Stack

Polaris uses:

- Vitest
- React Testing Library
- jsdom
- User Event

---

# Running Tests

Run all tests

```bash
npm test
```

or

```bash
npm run verify
```

Watch mode

```bash
npm run test:watch
```

Coverage

```bash
npm run test:coverage
```

---

# Test Types

## Unit Tests

Verify individual components.

Examples

- Buttons
- Cards
- Utilities
- Helpers

---

## Integration Tests

Verify interaction between components.

Examples

- Scenario switching
- Navigation
- Drawdown planner

---

## Page Tests

Verify complete pages.

Examples

- Overview
- My Plan
- Compare
- Drawdown
- Explore
- Guidance

---

## Journey Tests

Simulate realistic workflows.

Examples

Create scenario

↓

Compare

↓

Save

↓

Return to dashboard

---

# Folder Structure

```
src/

components/

pages/

test/

utils/
```

Tests are colocated with the code they verify whenever practical.

---

# Naming Convention

Use descriptive names.

Good

```
OverviewPage.test.tsx

ScenarioComparison.test.tsx

DrawdownPlanner.test.tsx
```

Avoid

```
test1.ts

newTest.ts

component.spec.ts
```

---

# Test Style

Prefer

```ts
render(...)

await user.click(...)

expect(...)
```

over

```ts
component.setState(...)
```

Test behaviour.

Not implementation.

---

# Queries

Prefer queries in this order.

1.

```
getByRole()
```

2.

```
getByLabelText()
```

3.

```
getByPlaceholderText()
```

4.

```
getByText()
```

Avoid

```
querySelector()

getElementById()
```

unless absolutely necessary.

---

# Accessibility Testing

Every interactive component should be testable through accessibility APIs.

Examples

```ts
screen.getByRole("button")
```

```ts
screen.getByRole("tab")
```

```ts
screen.getByRole("dialog")
```

```ts
screen.getByRole("switch")
```

This helps ensure accessibility remains part of everyday development.

---

# Page Testing

Pages should verify:

- Rendering
- Navigation
- User interaction
- State updates
- Scenario behaviour

Avoid testing calculations directly.

Those belong in service tests.

---

# Service Testing

Financial calculations should be tested independently.

Examples

- Pension projection

- Drawdown

- Fees

- Inflation

- Scenario comparison

This keeps calculations deterministic.

---

# Snapshot Testing

Snapshot tests should be used sparingly.

Prefer explicit assertions.

Example

Good

```
expect(screen.getByRole("heading"))
```

Instead of

```
expect(container).toMatchSnapshot()
```

---

# Mocking

Mock only external dependencies.

Examples

- Browser APIs

- Local Storage

- Time

- Routing

Avoid mocking the application itself.

---

# Test Data

Use realistic retirement plans.

Examples should resemble genuine retirement scenarios rather than arbitrary values.

This makes tests easier to understand.

---

# Regression Tests

Every reported bug should receive a regression test.

Workflow

Bug

↓

Fix

↓

Regression Test

↓

Commit

This ensures bugs do not reappear.

---

# Accessibility Regression

Important accessibility improvements should always be protected by tests.

Examples

- Keyboard navigation

- Focus management

- Dialog behaviour

- Tab navigation

---

# Responsive Testing

Responsive layouts should verify behaviour.

Do not rely on CSS breakpoints inside jsdom.

Instead

Test

- menu behaviour

- dialog behaviour

- navigation

independently.

---

# Future Testing

Version 1.1

Add visual regression testing.

Possible tools

- Playwright

- Storybook

---

Version 1.2

Introduce end-to-end tests.

Examples

```
Open planner

↓

Create plan

↓

Generate report

↓

Compare scenarios
```

---

# Continuous Integration

Recommended workflow

```
Install

↓

Lint

↓

Build

↓

Unit Tests

↓

Integration Tests

↓

Coverage

↓

Deploy
```

Every pull request should pass this pipeline.

---

# Writing New Tests

Checklist

□ Does it describe behaviour?

□ Does it test one thing?

□ Does it avoid implementation details?

□ Is it readable?

□ Will it catch regressions?

If all answers are "Yes"

The test is probably valuable.

---

# Testing Goals

Testing exists to:

✔ Increase confidence

✔ Prevent regressions

✔ Encourage refactoring

✔ Improve accessibility

✔ Support future development

It is not simply a measure of code coverage.

---

# Testing Philosophy

> Every feature deserves the confidence that only automated testing can provide.

---

**Polaris Retirement Planner**

Testing Guide

Version **1.0.0**

August 2026