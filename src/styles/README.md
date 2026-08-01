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

- `layouts/app-shell.css`
  - application frame;
  - sticky header;
  - product brand;
  - primary navigation;
  - theme toggle;
  - responsive header behaviour.
- `layouts/planner-page.css`
  - planner page width and gutters;
  - planner header and introductory copy;
  - primary planner grids;
  - planner section rhythm and responsive stacking.
- `layouts/planner-controls.css`
  - legacy panels and headings;
  - form grids, fields and input wrappers;
  - validation states and reset actions;
  - legacy summary cards;
  - guided-planner action compatibility.
- `layouts/planner-tables.css`
  - projection table scrolling;
  - sticky headers and first column;
  - numeric alignment and row interaction states.
- `layouts/drawdown-page.css`
  - drawdown page shell, dashboard grids and responsive layout.
- `layouts/drawdown-controls.css`
  - drawdown sidebar controls, money display choices, chart controls and assumptions cards.
- `layouts/drawdown-tables.css`
  - drawdown table controls, state rows, sticky columns and mobile year cards.
- `layouts/comparison-workspace.css`
  - comparison shell, toolbar, analysis grid and responsive composition.
- `layouts/comparison-controls.css`
  - plan selection, comparison editor, toggles and semantic action states.
- `layouts/comparison-results.css`
  - outcome, goal and impact cards, comparison tables and expandable year details.

### Still in `App.css`

- legacy duplicates for the extracted planner, drawdown and comparison modules;
- chart containers and chart-specific compatibility rules;
- milestone and older isolated feature blocks;
- miscellaneous legacy utilities and responsive overrides.

### Remaining migration order

1. migrate shared chart containers, legends and chart tabs;
2. migrate milestone and isolated summary blocks;
3. replace remaining native legacy actions with shared button variants;
4. remove selectors now covered by `action-intent-migrations.css` and `semantic-state-migrations.css` where explicit component variants exist;
5. delete verified duplicate blocks from `App.css`;
6. remove the `App.css` import when no selectors remain.

## Migration checklist

For each feature:

1. identify rules currently held in `App.css`;
2. move them into the feature's existing stylesheet or a new feature stylesheet;
3. replace broad descendant selectors with explicit classes;
4. replace repeated spacing, radius and colour values with tokens;
5. load the dedicated module after the compatibility stylesheet;
6. remove the migrated block from `App.css` once visually verified;
7. run `npm run verify` and visually check Noel, Olivia and responsive layouts.
