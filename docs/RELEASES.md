# 🚀 Polaris Retirement Planner Release History

> Official release history for Polaris Retirement Planner.

---

# Release Philosophy

Polaris follows **Semantic Versioning (SemVer)** using `MAJOR.MINOR.PATCH`.

Patch releases contain bug fixes, minor releases add compatible features, and major releases are reserved for larger behavioural or architectural changes.

---

# Current Stable Release

# Version 1.2.0

**Release Date:** 21 August 2026  
**Status:** ✅ Stable candidate / ready for release verification

## Theme

**Educational Drawdown Workspace**

Version 1.2.0 completes a major redesign of Drawdown so users can understand where retirement money comes from, why the pension changes, which moments matter and how the underlying calculations should be interpreted.

## Highlights

### Simple Drawdown

- Plain-English retirement story
- Important observations worth reviewing
- Clear explanation of private pension and State Pension income
- Today's Money / Future Money display choices
- Educational illustration guidance and persistent disclaimer

### Detailed Income

- Income-through-retirement explorer
- Selected-year explanation and retirement milestones
- Plain-English income labels
- Expandable income-by-year reference

### Detailed Balance

- Balance waterfall showing growth, money taken out, fees and inflation context
- Withdrawal-rate and growth-coverage explanations
- Year movement and next-year context
- Pension longevity summary
- Expandable balance-by-year reference

### Retirement Journey

- Replaces the old technical Timeline presentation
- Important retirement moments shown as a journey
- Compact journey summary
- Optional retirement-by-year reference with filtering and pagination

### How it works

- Replaces the user-facing Assumptions label while preserving the existing route
- Explains the choices taken from My Plan
- Explains Today's Money, Future Money and illustration-versus-prediction concepts
- Separates investment estimates and tax estimates
- Keeps the detailed yearly calculation method available as an optional reference

### Language and design

- Consistent plain-English terminology across Detailed Drawdown
- Progressive disclosure keeps technical information available without overwhelming the main experience
- Improved responsive layout, disclosure styling and accessibility
- Removed obsolete reserve-goal output from Balance

### Engineering and quality

- Expanded component and financial-validation tests
- Backward-compatible query navigation after tab renames
- Strict TypeScript hardening for balance movement data
- Full local release gate remains `npm run verify`

---

# Previous Stable Releases

## Version 1.1.0

**Release Date:** 19 August 2026  
**Status:** Superseded by 1.2.0

### Theme

**Retirement Journey and Income Strategy**

Version 1.1.0 introduced Essential and Advanced planning, Retirement Living Standards, question-led retirement strategy, improved Overview funding states and the full pension journey chart.

---

## Version 1.0.0

**Release Date:** 2 August 2026  
**Status:** Superseded

### Theme

**Complete Retirement Planning**

Version 1.0.0 established the core Polaris platform: guided planning, projections, State Pension, tax-free cash, scenario management, comparison, Drawdown, Decision Lab, Explore, Guidance, responsive design and Dark Mode.

---

# Planned Releases

## Version 1.3

### Theme

**Connected Data and Reporting**

Potential focus areas:

- Local database support
- Import / export
- Version history
- Autosave and offline persistence
- Printable retirement summaries
- PDF retirement reports

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

| Version | Status |
|---|---|
| 1.2.0 | ✅ Current |
| 1.1.0 | Previous stable release |
| 1.0.0 | Previous stable release |
| 1.3+ | 🚧 Planned |

---

# Release Process

Every Polaris release should include:

- Updated version metadata
- Updated README, changelog, roadmap and release history
- Successful `npm run verify`
- Deployment smoke test
- Version tag
- GitHub Release

---

**Polaris Retirement Planner**  
Current release: **Version 1.2.0**  
Release date: **21 August 2026**
