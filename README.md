# 🌌 Polaris Retirement Planner

> **Plan today. Understand tomorrow. Retire with confidence.**

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Status](https://img.shields.io/badge/status-Stable-success.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-Private-red)
[![Deploy Retirement Planner to GitHub Pages](https://github.com/JellyMaster/Retirement-Planner/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/JellyMaster/Retirement-Planner/actions/workflows/deploy-pages.yml)

---

# 🚀 Overview

**Polaris Retirement Planner** is an educational UK retirement planning application designed to help people understand how their retirement choices may affect pension savings, retirement income and long-term financial security.

Rather than simply producing a pension projection, Polaris helps answer the questions people naturally ask:

- When could I retire?
- How much money might I have available to spend?
- Where will my retirement income come from?
- How does taking money affect my pension over time?
- What are the important moments in my retirement journey?
- What changes if I save more, retire later or choose a different spending plan?

> **Polaris turns retirement planning from a collection of numbers into a clear story about your future.**

Polaris is an educational planning tool. It does not provide personal financial advice or guarantee future outcomes.

---

# ✨ What's New in Version 1.2

Version **1.2** completes a major redesign of the Drawdown experience around plain-English education and progressive disclosure.

### Highlights

- ✅ Simple and Detailed Drawdown experiences
- ✅ Detailed Income explorer with year-by-year explanations
- ✅ Detailed Balance explorer with balance waterfall and movement context
- ✅ Retirement Journey with important retirement moments and a compact yearly reference
- ✅ **How it works** educational reference explaining plan inputs, investment estimates, tax estimates and how to interpret results
- ✅ Today's Money / Future Money views throughout Drawdown
- ✅ Plain-English terminology and educational explanations
- ✅ Consistent expandable year-by-year reference tables
- ✅ Improved responsive layouts and accessibility
- ✅ Expanded financial-validation and component test coverage
- ✅ Persistent educational / financial-advice disclaimer

See [CHANGELOG.md](CHANGELOG.md) and [docs/RELEASES.md](docs/RELEASES.md) for the full release details.

---

# 📊 Key Features

## 📝 Guided Retirement Planning

Build and edit retirement plans through the **My Plan** journey.

### Essential planning

- Personal information
- Pension savings and contributions
- Retirement age and planning horizon
- Retirement income goals
- Retirement Living Standards
- State Pension
- Tax-free cash

### Advanced planning

- Retirement income strategy
- Spending changes through retirement
- Investment return, inflation and fee estimates
- Future contribution changes

---

## 🏠 Overview Dashboard

Understand the active retirement plan at a glance, including:

- Funding status and retirement readiness
- Projected pension value
- Retirement income summary
- Retirement strategy choices
- State Pension and tax-free cash status
- Interactive retirement journey
- Key retirement events

---

## ⚖ Scenario Management and Compare

Explore multiple retirement plans without losing the active plan.

- Create, edit and duplicate scenarios
- Switch the active plan from navigation
- Select scenarios for comparison
- Compare projected outcomes and charts
- Highlight the active plan consistently

---

## 💷 Retirement Drawdown

Drawdown explains how the saved retirement plan may work through retirement rather than acting as another configuration screen.

### Simple view

A plain-English retirement story covering:

- What happens over time
- Important observations worth reviewing
- How private pension and State Pension work together
- Educational explanations of the illustration

### Detailed view

#### Income

Understand where retirement money comes from and how it changes by year.

- Money from the private pension
- State Pension
- Estimated tax
- Money available to spend
- Planned income
- Important changes and explanations
- Expandable income-by-year reference

#### Balance

Understand why money left in the pension rises or falls.

- Opening pension
- Investment growth
- Money taken out
- Fees and inflation context
- Withdrawal rate and growth-coverage context
- Overall yearly movement
- Pension longevity and end-of-plan summary
- Expandable balance-by-year reference

#### Retirement Journey

Follow the important moments through retirement.

- Retirement begins
- State Pension starts
- Planned spending changes
- First income concern, when applicable
- Private pension exhaustion, when applicable
- End of the planning period
- Expandable retirement-by-year reference

#### How it works

Understand how to interpret the retirement results.

- Choices from the active plan
- Investment estimates
- Today's Money and Future Money
- Tax estimates
- Illustration-versus-prediction guidance
- Optional calculation reference for complete transparency

---

## 🧪 Decision Lab

Explore "What If?" questions without changing the main plan, including retirement age, saving, spending, fees, inflation, State Pension and market downturns. Experiments can be saved as new retirement scenarios.

---

## 🎓 Explore

Interactive retirement education using the active plan. Topics include investment growth, inflation, pension fees, sequence-of-returns risk, market downturns and retirement timing.

---

## 🧭 Guidance

Personalised educational guidance helps identify planning risks, improvement opportunities and areas worth reviewing, with links back into the planner.

---

# 🎯 Design Philosophy

Polaris follows a small set of product principles.

## Plain English first

Prefer language people naturally use. For example, **money from your pension** is preferred to unexplained technical terminology such as **withdrawal** where precision does not require it.

## Explain before adding detail

Important figures should be accompanied by enough context to explain what changed and why it matters.

## Progressive disclosure

Keep the main experience calm and understandable. Detailed tables and calculation mechanics remain available as optional reference material.

## Educational, not advisory

Polaris helps users understand retirement scenarios. It does not provide regulated personal financial advice or guarantee future results.

## One source of truth

Every page works from the currently active retirement scenario.

---

# 🛠 Technology

Built with:

- React 19
- TypeScript 6
- Vite 8
- React Router
- Recharts
- Font Awesome Pro
- Vitest
- Testing Library

---

# 📁 Project Structure

```text
src/
├── components/
├── contexts/
├── domain/
├── engine/
├── hooks/
├── pages/
├── services/
├── styles/
├── test/
├── theme/
└── utils/
```

Project documentation lives in `docs/`.

---

# 🚀 Getting Started

```bash
git clone https://github.com/JellyMaster/Retirement-Planner.git
cd Retirement-Planner
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

---

# 🧪 Testing and Release Gate

Run the complete local release gate:

```bash
npm run verify
```

This runs linting, TypeScript checking, the Vitest suite and a production build.

Useful individual commands:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

---

# 📚 Documentation

- [CHANGELOG.md](CHANGELOG.md) — release history
- [docs/RELEASES.md](docs/RELEASES.md) — release summaries
- [docs/ROADMAP.md](docs/ROADMAP.md) — future direction
- [docs/FEATURES.md](docs/FEATURES.md) — current capabilities
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — application architecture
- [docs/DESIGN.md](docs/DESIGN.md) — UX and visual design principles
- [docs/TESTING.md](docs/TESTING.md) — testing approach
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — contribution guidelines
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) — user guide

---

# 🗺 Roadmap

Version **1.2.0** completes the educational Drawdown workspace. Future work can focus on wider cross-application polish, richer decision support and longer-term persistence/reporting capabilities.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the maintained roadmap.

---

# 📄 License

This project is currently maintained as a private project.

---

# ❤️ Mission

> **Help people understand retirement well enough to make confident financial decisions throughout their lives.**

---

**Polaris Retirement Planner — Version 1.2.0**

*"Plan today. Understand tomorrow. Retire with confidence."*
