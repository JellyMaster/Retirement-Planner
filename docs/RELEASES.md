# 🚀 Polaris Retirement Planner Release History

> Official release history for Polaris Retirement Planner.

---

# Release Philosophy

Polaris follows **Semantic Versioning (SemVer)**.

```text
MAJOR.MINOR.PATCH
```

Patch releases contain bug fixes, minor releases add compatible features, and major releases are reserved for larger behavioural or architectural changes.

---

# Current Stable Release

# Version 1.1.0

**Release Date**

19 August 2026

**Status**

✅ Stable

## Theme

**Retirement Journey and Income Strategy**

Version 1.1.0 makes the planning journey easier to understand and improves how retirement-income choices are carried through the Overview and drawdown experience.

## Highlights

### Simpler plan creation

- Essential and Advanced plan sections
- Retirement-income goal set by a custom amount or Retirement Living Standards
- Minimum, Moderate and Comfortable lifestyle choices
- Plan-name editing in My Plan
- Clearer future-saving controls and advanced-change summaries

### Question-led retirement strategy

- Stable income or Flexible income
- Consistent spending or different retirement stages
- Clear State Pension and tax-free cash choices
- Support for target-income, percentage-withdrawal and tiered spending strategies

### Retirement journey visualisation

- Pension journey from the current age through the full planning age
- £100k, £250k, £500k, £1m and larger reached milestones
- Retirement, tax-free cash, State Pension, spending-change and plan-age events
- Interactive event explanations using the active plan
- Consistent today's-money treatment before and after retirement

### Overview improvements

- Successfully Funded, Needs Attention, Needs Urgent Attention and incomplete-plan states
- Cleaner retirement facts and income summaries
- Strategy-aware plan-choice badges
- Retirement Living Standards displayed as Lifestyle · Minimum / Moderate / Comfortable
- Improved handling of zero and incomplete projections

### Engineering and quality

- Safer scenario-storage normalisation and legacy-plan handling
- React state-flow and TypeScript fixes from the release-hardening pass
- Updated accessible chart/event tests and retirement-strategy deep links
- Full release verification completed with lint, type checking, automated tests and production build

---

# Previous Stable Release

## Version 1.0.0

**Release Date:** 2 August 2026  
**Status:** Superseded by 1.1.0

### Theme

**Complete Retirement Planning**

Version 1.0.0 was the first stable public release and established the core Polaris platform.

Its major capabilities included:

- Guided retirement planning
- Pension projections and contribution modelling
- Retirement income and spending phases
- Tax-free cash and State Pension modelling
- What If? experiments
- Multiple scenarios and comparison
- Drawdown planning and sustainability analysis
- Explore learning content
- Personalised Guidance
- Responsive layouts and Dark Mode
- Shared scenario architecture and comprehensive automated testing

---

# Planned Releases

## Version 1.2

### Theme

**Strategy-aware decision support**

Focus areas:

- Compare retirement outcomes, not only accumulation outcomes
- Expand What If? with retirement-strategy and ending-pot experiments
- Make Drawdown more explanatory and reduce configuration duplication
- Make Explore fully aware of Stable, Flexible and lifestyle-based strategies
- Continue Guidance wording and decision-support improvements
- PDF retirement reports and richer printable summaries

**Status:** Planned

---

## Version 1.3

### Theme

**Connected Data**

Focus areas:

- Local database support
- Import / Export
- Version history
- Autosave and offline persistence

**Status:** Planned

---

## Version 2.0

### Theme

**Polaris Cloud**

Future vision:

- User accounts
- Cloud synchronisation
- Adviser mode
- Shared retirement plans
- Secure backups

**Status:** Vision

---

# Version Support

Only the latest stable version is actively developed.

| Version | Status |
|---|---|
| 1.1.0 | ✅ Current |
| 1.0.0 | Previous stable release |
| 1.2+ | 🚧 Planned |

---

# Release Process

Every Polaris release should include:

- Updated version metadata
- Updated changelog and release history
- Successful lint and type checking
- Successful automated tests
- Successful production build
- Deployment smoke test
- Version tag
- GitHub Release

---

**Polaris Retirement Planner**  
Current stable release: **Version 1.1.0**  
Released **19 August 2026**
