# Polaris Retirement Planner v1.2.0

**Release date:** 21 August 2026

## Educational Drawdown Workspace

Polaris v1.2 focuses on one goal: making retirement drawdown easier to understand.

The Drawdown area has been redesigned so it explains the active retirement plan rather than asking users to configure the same choices again. The result is a calmer Simple experience and a more useful Detailed workspace for people who want to understand the mechanics behind their retirement plan.

## What's new

### Simple Drawdown

Simple view now tells the retirement story in plain English:

- what happens over time
- important things worth reviewing
- how private pension and State Pension work together
- how to interpret the retirement illustration

### Detailed Income

The Income page now explains where retirement money comes from and how it changes through retirement.

Users can inspect a selected year to understand money from the private pension, State Pension, estimated tax, money available to spend and planned income.

A collapsed Income-by-year reference keeps the full figures available without overwhelming the main page.

### Detailed Balance

The Balance page now explains why money left in the pension changes.

The balance waterfall shows:

- pension at the start of the year
- investment growth
- money taken out
- fees
- inflation context
- pension at the end of the year

Additional context includes withdrawal rate, how much investment growth offset the money leaving the pension, annual percentage movement and pension longevity.

### Retirement Journey

The old Timeline presentation has become **Retirement Journey**.

It highlights important moments such as retirement beginning, State Pension starting, spending changes, income concerns and the end of the planning period.

The full yearly data remains available in an optional Retirement-by-year reference.

### How it works

The old user-facing Assumptions page is now **How it works**.

It explains:

- the choices taken from My Plan
- how to understand Today's Money and Future Money
- investment estimates
- inflation and pension fees
- tax estimates
- why the results are an illustration rather than a prediction

A detailed calculation reference is available for users who want complete transparency.

## Plain-English design standard

Version 1.2 formalises a product-wide rule:

> Use plain English by default. Keep technical detail available as a reference rather than making it the main experience.

Examples include:

- **Money from your pension** instead of unexplained withdrawal terminology
- **Money available to spend** instead of relying on net-income jargon
- **Money left in your pension** where closing balance would add unnecessary technical language
- **Your pension has been fully used** rather than depletion in consumer-facing guidance

## Other improvements

- Today's Money / Future Money explanations are consistent throughout Drawdown.
- Detailed reference tables use a consistent disclosure pattern.
- Selected-year context and accessible indicators are more consistent.
- The obsolete ending-reserve goal has been removed from Balance because it is no longer part of My Plan.
- The persistent educational / financial-advice disclaimer is integrated into the experience.
- Responsive layouts and disclosure styling have been refined.
- Component and financial-validation tests have been expanded.

## Compatibility

Visible labels changed in a few places, but existing deep links remain supported:

- **Retirement journey** continues to use `?tab=timeline`
- **How it works** continues to use `?tab=assumptions`

This avoids breaking existing links while allowing clearer user-facing language.

## Release verification

Before tagging and merging the release, run:

```bash
npm run verify
```

The release should not be tagged until linting, TypeScript checking, the automated test suite and the production build all pass.

## Educational use

Polaris is designed to help users understand and compare retirement scenarios. It does not provide personal financial advice and does not guarantee future investment, tax or retirement outcomes.
