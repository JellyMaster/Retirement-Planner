# Inflation display mode

Copy the included `src` folder over the project source folder.

This update adds a presentation-only selector for:

- Future money (nominal projected pounds)
- Today's money (inflation-discounted values)

The drawdown and tax engines remain unchanged and continue to calculate in nominal pounds. The first modelled drawdown year is the base year for the real-value conversion because the drawdown planner starts at retirement.

Run:

```powershell
npm run test:run -- src/utils/drawdownDisplayValues.test.ts src/engine/drawdown/__tests__
npm run build
```

TypeScript compilation was verified in the build workspace. Vitest could not start there because the uploaded Windows dependency tree does not contain the Linux Rolldown native binding.
