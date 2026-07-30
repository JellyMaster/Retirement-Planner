# Compact Drawdown Dashboard

Copy the included `src` folder over the project `src` folder.

## What changes

- Sticky compact assumptions sidebar on desktop
- Compact outcome cards across the top
- Balance and income charts combined into a tabbed chart area
- New key-insights panel
- Projection table collapsed by default
- Calculation assumptions collapsed by default
- Responsive tablet and mobile layouts
- Existing financial engine, tax calculations and inflation display logic remain unchanged

## Validation

Run:

```powershell
npm run test:run
npm run build
```

The patch was TypeScript-checked with:

```powershell
npx tsc --noEmit -p tsconfig.app.json
```
