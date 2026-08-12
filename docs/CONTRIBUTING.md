# 🤝 Contributing to Polaris Retirement Planner

> **Version 1.0.0**

Thank you for your interest in contributing to **Polaris Retirement Planner**.

Whether you're fixing a bug, improving documentation, or developing a new feature, this guide explains how contributions should be made to ensure the project remains consistent, maintainable and enjoyable to work on.

---

# Project Philosophy

Polaris is built around one simple principle:

> **Help people understand retirement, not simply calculate it.**

Every contribution should support one or more of the following goals:

- Improve understanding
- Increase confidence
- Reduce complexity
- Encourage experimentation
- Improve accessibility
- Maintain code quality

If a proposed change doesn't improve one of these areas, it's worth reconsidering whether it belongs in the project.

---

# Development Workflow

Development follows a feature branch workflow.

```
main
 │
 ├── feature/v1.1-visual-intelligence
 ├── feature/reporting
 ├── feature/pdf-export
 └── bugfix/navigation
```

The `main` branch should always represent the latest stable release.

All development should take place in feature branches before being merged.

---

# Branch Naming

Use descriptive branch names.

### Features

```
feature/visual-intelligence
feature/pdf-reporting
feature/timeline-engine
```

### Bug Fixes

```
bugfix/mobile-navigation
bugfix/scenario-comparison
```

### Documentation

```
docs/readme-update
docs/testing-guide
```

### Refactoring

```
refactor/scenario-service
refactor/chart-components
```

---

# Commit Messages

Use clear, concise commit messages.

### Good Examples

```
Add retirement timeline component

Improve drawdown chart accessibility

Fix scenario comparison regression

Update README for Version 1.0.0
```

Avoid:

```
Fix stuff

Changes

Update

Testing
```

A good commit should describe **what changed**, not how long it took.

---

# Pull Requests

Every pull request should:

- Explain the purpose of the change.
- Describe any user-facing impact.
- Include screenshots for UI updates where practical.
- Confirm that tests pass.
- Note any follow-up work.

---

## Pull Request Checklist

Before submitting:

- [ ] Code builds successfully.
- [ ] All automated tests pass.
- [ ] No new lint warnings.
- [ ] Accessibility has been considered.
- [ ] Documentation has been updated (if required).
- [ ] User-facing changes have been tested manually.

---

# Coding Standards

## TypeScript

Prefer strong typing.

Avoid:

```ts
const value: any;
```

Prefer:

```ts
const value: ProjectionResult;
```

---

## React Components

Keep components focused.

A component should ideally have one primary responsibility.

If a component grows beyond roughly 300–400 lines, consider splitting it into smaller, reusable pieces.

---

## State Management

Global state belongs in context providers.

Avoid duplicating state between pages.

Always prefer the existing scenario architecture where possible.

---

## Financial Calculations

Business logic should live in services or domain code.

Avoid placing calculations directly inside React components.

Example:

```
❌ Component

calculateProjection()

```

Instead:

```
✅ ProjectionService

calculateProjection()

↓

Component renders result
```

---

# User Experience

Every new feature should answer the following questions:

- Is it easy to understand?
- Does it reduce complexity?
- Does it explain the result?
- Does it fit naturally into the existing workflow?

Avoid introducing additional steps unless they provide clear value.

---

# Accessibility

Accessibility is a requirement, not an enhancement.

Every interactive component should:

- Be keyboard accessible.
- Have meaningful labels.
- Expose appropriate ARIA roles where necessary.
- Manage focus correctly.
- Respect reduced motion preferences.

---

# Styling

Polaris follows a component-first styling approach.

Guidelines:

- Reuse existing utility classes where possible.
- Keep spacing consistent.
- Support both light and dark themes.
- Avoid inline styles unless unavoidable.

Refer to `DESIGN.md` for the full design philosophy.

---

# Testing

Every new feature should include automated tests where appropriate.

At a minimum:

- Unit tests for reusable logic.
- Integration tests for user workflows.
- Regression tests for resolved bugs.

Before creating a pull request, run:

```bash
npm run verify
```

---

# Documentation

If a feature changes how Polaris works:

- Update `README.md` if it's user-facing.
- Update `FEATURES.md` for new capabilities.
- Update `CHANGELOG.md` if it affects the current release.
- Update `ROADMAP.md` if future plans change.

Documentation should evolve alongside the application.

---

# Versioning

Polaris follows **Semantic Versioning**.

Examples:

```
1.0.0
```

Initial stable release.

```
1.0.1
```

Bug fixes only.

```
1.1.0
```

New features without breaking changes.

```
2.0.0
```

Breaking architectural or behavioural changes.

---

# Code Review Guidelines

When reviewing code, consider:

### Readability

Can another developer understand it quickly?

---

### Simplicity

Could the solution be simpler?

---

### Reusability

Can existing components or services be reused?

---

### Accessibility

Does the change remain accessible?

---

### Performance

Does the change introduce unnecessary rendering or computation?

---

### Maintainability

Will this still make sense in a year's time?

---

# Design Principles

Every contribution should reinforce the Polaris design philosophy:

- Calm
- Consistent
- Educational
- Trustworthy

Refer to `DESIGN.md` for detailed guidance.

---

# Reporting Bugs

When reporting a bug, include:

- Expected behaviour.
- Actual behaviour.
- Steps to reproduce.
- Browser and operating system.
- Screenshots where helpful.

Every confirmed bug should receive a regression test before it is closed.

---

# Suggesting Features

Feature requests should explain:

- The problem being solved.
- Why it matters.
- Who benefits.
- Any possible alternatives.

Ideas that align with the long-term roadmap are more likely to be accepted.

---

# Long-Term Vision

Polaris aims to become a comprehensive retirement planning platform while remaining approachable for everyday users.

Contributions should support that vision through thoughtful design, clear communication and maintainable code.

---

# Thank You

Every improvement—whether it's code, documentation, testing or design—helps make Polaris a better retirement planning experience.

Thank you for contributing.

---

**Polaris Retirement Planner**

Contributing Guide

Version **1.0.0**

August 2026