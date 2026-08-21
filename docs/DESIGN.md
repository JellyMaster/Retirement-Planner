# 🎨 Polaris Retirement Planner Design System

> **Version 1.2.0**

---

# Introduction

The Polaris design system exists to make retirement planning feel calm, understandable and approachable.

The application should never feel like a collection of calculators. Each page should help the user understand what they are seeing, why it matters and where deeper detail is available when they want it.

> **Design software that helps people understand retirement instead of simply calculating it.**

---

# Core Design Principles

## 1. Plain English first

Prefer words people naturally use in conversation.

Examples:

| Prefer | Avoid when not required |
|---|---|
| Money from your pension | Withdrawal |
| Money available to spend | Net income |
| Money left in your pension | Closing balance |
| Your planned income | Income target |
| Your pension has been fully used | Depletion |
| How it works | Calculation methodology |
| Retirement journey | Timeline |

Technical terms are acceptable when precision requires them, but they should be explained at first use.

## 2. Explain before adding detail

Do not show a number and leave the user to interpret it.

Where useful, explain:

1. What happened?
2. Why did it happen?
3. Is it expected?
4. What happens next?

## 3. Progressive disclosure

Keep the main experience calm. Detailed tables, calculation order and technical mechanics should remain available as optional references.

The preferred pattern for a Detailed page is:

```text
Introduction
↓
Explore
↓
Understand
↓
Key answers
↓
Reference
```

## 4. Questions over technical settings

When possible, frame sections around the questions users ask naturally.

Examples:

- Where is my retirement money coming from?
- What is happening to my pension?
- What are the important moments in my retirement?
- How should I understand these results?

## 5. Educational, not advisory

Polaris helps users understand possible retirement outcomes and compare choices. It does not provide regulated personal financial advice or guarantee future outcomes.

Warnings should explain the issue without implying certainty or unnecessary alarm.

## 6. Consistency

Once an interaction pattern has been established, reuse it.

Examples in v1.2:

- Detailed tabs share the same heading hierarchy.
- Year-by-year tables are optional reference disclosures.
- Selected years use a consistent eye indicator where relevant.
- Today's Money / Future Money uses the same terminology throughout Drawdown.

---

# Visual Language

Polaris uses:

- readable typography
- generous but controlled spacing
- restrained colour
- rounded surfaces
- subtle hierarchy
- clear selected and warning states

Colour should communicate meaning, not decorate the interface.

| Colour intent | Purpose |
|---|---|
| Primary | Actions and selection |
| Positive | Reassuring outcomes |
| Warning | Something worth reviewing |
| Critical | Significant problem requiring attention |
| Neutral | Supporting information |

Both light and dark themes are first-class experiences.

---

# Detailed Drawdown Design Standard

Version 1.2 establishes a consistent Detailed Drawdown workspace.

## Income

Purpose: explain where retirement money comes from and how it changes.

Use language such as:

- Money from your pension
- State Pension
- Estimated tax
- Money available to spend
- Your planned income

## Balance

Purpose: explain why the pension rises or falls.

The balance waterfall should make the yearly movement understandable using:

- Started with
- Investment growth
- Money taken out
- Fees
- Inflation context
- Finished with

Supporting context may include withdrawal rate, growth coverage and percentage movement.

## Retirement Journey

Purpose: explain the important moments along the retirement plan rather than present a technical event timeline.

Milestones should use personal, plain-English wording such as:

- Your retirement begins
- Your State Pension starts
- Your planned spending changes
- Your planned income is no longer fully met
- Your private pension has been fully used

## How it works

Purpose: explain how to interpret the results and provide transparency about the model without making technical detail the default experience.

The learning flow is:

1. Your retirement plan
2. How to understand your results
3. Investment estimates
4. Tax estimates
5. Key things to remember
6. Optional calculation reference

---

# Tables and Reference Sections

Reference tables should not dominate a page.

Default behaviour:

- collapsed where the table is supporting information
- clear disclosure title and helper text
- pagination for long yearly datasets
- sensible row-count controls
- plain-English column labels where practical
- technical view available only when it adds value

Disclosure headers should be fully clickable and use the shared expand/collapse indicator.

---

# Charts and Visualisations

Charts exist to explain decisions, not decorate screens.

Every chart should answer a useful question such as:

- How does retirement income change?
- Why is the pension balance changing?
- When do important retirement events happen?

If a chart no longer serves a clear question, remove it rather than retaining it for visual interest.

---

# Forms

Forms should feel like a guided conversation rather than a technical configuration screen.

Use:

- short sections
- clear labels
- useful defaults where appropriate
- immediate validation
- question-led choices
- summaries of advanced selections

Avoid asking users to configure the same decision in multiple places. My Plan is the primary source for retirement choices; Drawdown explains their effect.

---

# Accessibility

Accessibility is part of the design, not an add-on.

Polaris should maintain:

- keyboard navigation
- semantic controls
- accessible dialogs and disclosures
- visible focus states
- screen-reader labels
- reduced-motion support
- sufficient contrast
- responsive layouts

Accessible names are part of the public UI contract and should be updated in tests when product terminology changes.

---

# Responsive Design

Layouts should reorganise rather than hide important functionality.

Dense desktop grids should collapse into readable single-column flows on smaller screens. Long tables should use local horizontal scrolling or mobile-specific presentation rather than cause page-level overflow.

---

# Empty States and Errors

Empty states should explain why nothing is shown and what the user can do next.

Errors should be clear, specific and actionable.

Prefer:

> Retirement age must be greater than your current age.

instead of:

> Invalid value.

---

# Copy Review Checklist

Before releasing user-facing copy, ask:

- Would someone who has never worked in pensions naturally say this?
- Is a technical term necessary for accuracy?
- Can the same meaning be expressed more clearly?
- Does the wording educate rather than alarm?
- Is terminology consistent with the rest of Polaris?

---

# Design Goals

Every new feature should improve at least one of these areas:

- Reduce complexity
- Improve understanding
- Increase confidence
- Encourage safe experimentation
- Explain calculations
- Improve accessibility

If a feature does none of these, reconsider whether it belongs in Polaris.

---

**Polaris Retirement Planner — Design System v1.2.0**

August 2026
