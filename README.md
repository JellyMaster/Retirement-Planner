# Pension input form refactor

Copy the included `src` folder over the project `src` folder.

Changes:
- Refactors `PensionInputsForm.tsx` to use the shared form component library.
- Removes the locally duplicated `FormSection`, `NumberField`, and `PercentageField` implementations.
- Preserves collapsible comparison summaries, changed/error badges, section state, validation, and calculations.
- Adds contextual hints and optional labels.
- Extends shared `FormSection` to support controlled accordion state and comparison summary metrics.

Expected existing icons in `AppIcons`:
- `user`
- `pension`
- `growth`
- `plus`
- `chevronDown`

Validation performed:
- `npx tsc -b`
- `node node_modules/eslint/bin/eslint.js .`
