# Themed comparison assumptions panel patch

This patch updates the retirement comparison editor so the left assumptions panel uses the same theme tokens and component styling as the rest of the application.

## Changes

- Uses the dashboard theme variables for panel, text, border, accent and shadow colours.
- Supports light and dark modes without hard-coded white surfaces.
- Matches the existing dashboard card and chart-tab styling.
- Styles inputs, selects, prefixes, suffixes, validation states and focus states consistently.
- Makes the active editor tab clearer.
- Gives the collapsed Edit plans rail a themed, visible treatment.
- Keeps the existing current/comparison tabs and horizontal minimise behaviour.

## Installation

Copy the included `src` folder over the existing project `src` folder.

Then run:

```powershell
npm run test:run
npm run build
```

The TypeScript component logic is unchanged; this is primarily a theme and presentation update.


## Header control cleanup

The duplicate **Edit current plan** and **Edit comparison plan** buttons have been removed from the comparison header. Scenario editing now lives exclusively in the tabbed assumptions panel. When the panel is minimised, the themed **Edit plans** rail remains visible as the single way to restore it. The header now focuses only on comparison-level actions such as swapping and copying plans.
