# Sticky Retirement Snapshot Workspace

Copy the included `src` folder over the project `src` folder.

This update:

- places the live retirement snapshot beside the guided input sections on wide desktop layouts;
- keeps the snapshot visible while editing sections;
- adds required-section completion progress;
- adds section navigation shortcuts;
- highlights sections containing validation errors;
- opens and scrolls to the selected section;
- stacks the snapshot above the form on narrow screens;
- preserves scenario-comparison behaviour.

Validation performed:

```bash
npx tsc -b --pretty false
node node_modules/eslint/bin/eslint.js .
```
