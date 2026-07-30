# Retirement comparison dashboard patch

This patch replaces the compact retirement planner's original side-by-side comparison results with a decision-focused comparison dashboard.

## Included changes

- Plain-English outcome banner
- Difference-first metric cards
- Existing overlaid balance chart retained
- Benefits and trade-offs panel
- Assumptions table showing changed values first
- Optional display of unchanged assumptions
- Retirement timeline
- Collapsible year-by-year comparison table
- Collapsible side-by-side scenario editors
- Swap plans and copy current plan actions
- Responsive desktop, tablet, and mobile styling

## Installation

Copy the included `src` folder over the existing project `src` folder.

This patch assumes the earlier compact retirement dashboard patch is already installed.

## Validation

TypeScript compilation passed with:

```powershell
node node_modules/typescript/bin/tsc -b
```

The Vite production build could not run in the Linux validation container because the existing project dependency tree is missing the optional native package `@rolldown/binding-linux-x64-gnu`. This is the same environment-specific Rolldown issue encountered with earlier patches.

No pension projection calculations were changed.
