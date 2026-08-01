# Retirement Planner CSS architecture

`src/styles/index.css` is the single application-level stylesheet entry point.

## Ownership

- `foundations/` contains reusable scales and global typography or motion rules.
- `themes/` is reserved for Noel, Olivia and future theme-specific values.
- `components/` is reserved for shared UI primitives such as buttons, cards, badges, metrics, forms and tables.
- `layouts/` is reserved for application shell, workspace and dashboard composition.
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

The central entry point loads foundations, shared components, semantic mappings, migration layers and finally `App.css`. Feature files imported by pages remain independent until their migration is complete.

## Migration checklist

For each feature:

1. identify rules currently held in `App.css`;
2. move them into the feature's existing stylesheet or a new feature stylesheet;
3. replace broad descendant selectors with explicit classes;
4. replace repeated spacing, radius and colour values with tokens;
5. remove the migrated block from `App.css`;
6. run `npm run verify` and visually check Noel, Olivia and responsive layouts.
