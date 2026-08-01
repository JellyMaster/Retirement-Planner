# Retirement Planner CSS architecture

`src/styles/index.css` is the single application-level stylesheet entry point.

## Ownership

- `foundations/` contains reusable scales and global typography or motion rules.
- `themes/` is reserved for Noel, Olivia and future theme-specific values.
- `components/` is reserved for shared UI primitives such as buttons, cards, badges, metrics, forms and tables.
- `layouts/` owns application shell, workspace and dashboard composition.
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
6. Use semantic tokens such as `--action-*`, `--status-*`, `--ui-space-*` and `--ui-radius-*` rather than raw values.

## Import order

The central entry point loads foundations, themes, shared components, semantic mappings, compatibility migrations and layouts. Within `layouts/index.css`, legacy `App.css` loads first and dedicated layout modules load afterwards. This lets an extracted module become authoritative before its duplicate legacy block is deleted.

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

### Still in `App.css`

- general planner page and form layout;
- drawdown dashboard and editor;
- comparison dashboard and editor;
- charts, tables and older feature-specific blocks.

### Recommended extraction order

1. general planner page, panels and form layout;
2. drawdown dashboard shell;
3. comparison workspace and editor;
4. charts, tables and remaining isolated feature blocks;
5. delete `App.css` after its final selector has moved.

## Migration checklist

For each feature:

1. identify rules currently held in `App.css`;
2. move them into the feature's existing stylesheet or a new feature stylesheet;
3. replace broad descendant selectors with explicit classes;
4. replace repeated spacing, radius and colour values with tokens;
5. load the dedicated module after the compatibility stylesheet;
6. remove the migrated block from `App.css` once visually verified;
7. run `npm run verify` and visually check Noel, Olivia and responsive layouts.
