# Retirement Planner CSS architecture

`src/styles/index.css` is the single application-level stylesheet entry point.

## Ownership

- `foundations/` contains reusable scales and global typography or motion rules.
- `themes/` is reserved for Noel, Olivia and future theme-specific values.
- `components/` owns shared UI primitives and shared semantic component states.
- `layouts/` owns application shell, planner composition, workspace and dashboard layout.
- `utilities/` contains narrowly scoped accessibility and helper classes.
- `legacy/` isolates temporary compatibility imports while they are retired.
- Existing feature files in `src/styles/` continue to own one feature each while they are migrated.
- `App.css` is a temporary compatibility file. Do not add new feature rules to it.
- No temporary semantic migration stylesheet remains.

## Selector rules

1. Prefer a component class over element selectors.
2. Never target every `span`, `div`, `button` or `svg` inside a feature container.
3. Shared `.ui-*` classes belong to shared component styles, not feature styles.
4. Feature selectors should begin with the feature namespace.
5. Avoid `!important`; fix ownership, import order or selector scope instead.
6. Use semantic tokens such as `--action-*`, `--status-*`, `--space-*` and `--radius-*` rather than raw values.

## Import order

The central entry point loads foundations, shared components, semantic theme mappings and layouts. `layouts/index.css` first loads `legacy/app-css-compat.css`, which is the only route to `App.css`. Dedicated layout modules then load afterwards and remain authoritative for their owned selectors.

Feature styles imported by pages remain independent until their migration is complete.

## CSS audit

Run:

```bash
npm run audit:css
```

The audit reports:

- selectors defined in more than one CSS file;
- class selectors that do not appear literally in TypeScript, JavaScript or HTML source.

The unused-class report is advisory because dynamically constructed class names can create false positives. Review candidates before deleting them.

## Migration status

### Extracted and authoritative

- `components/semantic-states.css`: status badges, toned cards, metric states and generic alert semantics.
- `layouts/app-shell.css`: application frame, header, brand, navigation and theme toggle.
- `layouts/planner-page.css`: planner width, header, grids and responsive section rhythm.
- `layouts/planner-controls.css`: legacy panels, forms, validation, summaries and guided actions.
- `layouts/planner-tables.css`: projection table scrolling, sticky columns and numeric states.
- `layouts/drawdown-page.css`: drawdown shell, dashboard grids and responsive layout.
- `layouts/drawdown-controls.css`: sidebar controls, money display, chart controls and assumptions.
- `layouts/drawdown-tables.css`: drawdown controls, state rows, sticky columns and mobile cards.
- `layouts/comparison-workspace.css`: comparison shell, toolbar and analysis composition.
- `layouts/comparison-controls.css`: plan selection, editor, toggles and semantic actions.
- `layouts/comparison-results.css`: outcome cards, impact cards and comparison tables.
- `layouts/chart-surfaces.css`: shared chart panels, dimensions, tabs and Recharts presentation.
- `layouts/chart-legends.css`: semantic legends, swatches and responsive legend layout.
- `layouts/milestone-cards.css`: milestone grids, states, icons and responsive cards.
- `layouts/summary-callouts.css`: assumptions, insights, validation, empty states and callouts.
- `layouts/legacy-actions.css`: compatibility styling for older native action classes.
- `layouts/workspace-navigation.css`: semantic workspace accents and navigation interaction states.
- `layouts/retirement-health.css`: explicit retirement-health metric text and icon roles.

### Cleanup completed

- Retirement Coach comparison actions use `variant="compare"`.
- Standard What-if actions use `variant="compare"`.
- Scenario presets and saved scenarios use `variant="compare"`.
- Scenario saving uses `variant="success"`.
- Scenario and Monte Carlo resets use `variant="warning"`.
- `action-intent-migrations.css` has been deleted.
- `semantic-state-migrations.css` has been deleted.
- The application stylesheet entry point no longer loads migration layers.
- The remaining `App.css` dependency is isolated behind `legacy/app-css-compat.css`.
- `npm run audit:css` provides duplicate-selector and possible-unused-selector reports.

### Still in `App.css`

- duplicate rules already covered by the authoritative modules above;
- miscellaneous legacy utilities and isolated responsive overrides;
- any selector not yet confirmed through visual regression checks.

### Remaining cleanup order

1. run `npm run audit:css` and capture the duplicate-selector report;
2. delete verified duplicate blocks from `App.css` in cohesive sections;
3. audit remaining selectors for active usage and remove dead rules;
4. move any genuine residual selectors into permanent owners;
5. remove `legacy/app-css-compat.css` when no active selector depends on it;
6. delete `App.css` or replace it with a short historical note.

## Migration checklist

For each feature:

1. identify rules currently held in `App.css`;
2. move them into the feature's existing stylesheet or a new feature stylesheet;
3. replace broad descendant selectors with explicit classes;
4. replace repeated spacing, radius and colour values with tokens;
5. load the dedicated module after the compatibility stylesheet;
6. remove the migrated block from `App.css` once visually verified;
7. run `npm run audit:css`, `npm run verify`, and visually check Noel, Olivia and responsive layouts.
