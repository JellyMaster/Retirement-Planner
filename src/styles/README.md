# Retirement Planner CSS architecture

`src/styles/index.css` is the single application-level stylesheet entry point.

## Ownership

- `foundations/` contains reusable scales and global typography or motion rules.
- `themes/` is reserved for Noel, Olivia and future theme-specific values.
- `components/` is reserved for shared UI primitives such as buttons, cards, badges, metrics, forms and tables.
- `layouts/` owns application shell, planner composition, workspace and dashboard layout.
- `utilities/` contains narrowly scoped accessibility and helper classes.
- Existing feature files in `src/styles/` continue to own one feature each while they are migrated.
- `App.css` is a temporary compatibility file. Do not add new feature rules to it.
- `action-intent-migrations.css` and `semantic-state-migrations.css` are temporary compatibility layers. Remove selectors from them when the relevant component adopts explicit semantic classes or variants.

## Selector rules

1. Prefer a component class over element selectors.
2. Never target every `span`, `div`, `button` or `svg` inside a feature container.
3. Shared `.ui-*` classes belong to shared component styles, not feature styles.
4. Feature selectors should begin with the feature namespace.
5. Avoid `!important`; fix ownership, import order or selector scope instead.
6. Use semantic tokens such as `--action-*`, `--status-*`, `--space-*` and `--radius-*` rather than raw values.

## Import order

The central entry point loads foundations, shared components, semantic mappings, layouts and compatibility migrations. Within `layouts/index.css`, legacy `App.css` loads first and dedicated layout modules load afterwards. This lets an extracted module become authoritative before its duplicate legacy block is deleted.

Feature styles imported by pages remain independent until their migration is complete.

## Migration status

### Extracted and authoritative

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

### Still in `App.css`

- duplicate rules already covered by the authoritative modules above;
- miscellaneous legacy utilities and isolated responsive overrides;
- any selector not yet confirmed through visual regression checks.

### Remaining migration order

1. visually verify the newly extracted summary, callout and legacy-action modules;
2. remove obsolete selectors from `action-intent-migrations.css` and `semantic-state-migrations.css` where explicit component variants now exist;
3. delete verified duplicate blocks from `App.css` in cohesive sections;
4. audit remaining selectors for active usage and remove dead rules;
5. remove the `App.css` import when no active selector depends on it.

## Migration checklist

For each feature:

1. identify rules currently held in `App.css`;
2. move them into the feature's existing stylesheet or a new feature stylesheet;
3. replace broad descendant selectors with explicit classes;
4. replace repeated spacing, radius and colour values with tokens;
5. load the dedicated module after the compatibility stylesheet;
6. remove the migrated block from `App.css` once visually verified;
7. run `npm run verify` and visually check Noel, Olivia and responsive layouts.
