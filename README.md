# UK income-tax engine

This patch adds a standalone, tested income-tax engine for retirement income.

## Included files

- `src/engine/tax/UkIncomeTaxEngine.ts`
- `src/engine/tax/models/UkIncomeTaxModels.ts`
- `src/engine/tax/config/ukIncomeTaxYears.ts`
- `src/engine/tax/validators/UkIncomeTaxValidator.ts`
- `src/engine/tax/__tests__/UkIncomeTaxEngine.test.ts`
- `src/engine/tax/index.ts`

## Scope

The supplied `2026/27` configuration supports non-savings income for England,
Wales and Northern Ireland. It includes:

- £12,570 Personal Allowance
- Personal Allowance taper above £100,000
- £37,700 basic-rate band at 20%
- higher rate at 40%
- additional rate at 45% above £125,140
- taxable State Pension
- taxable and tax-free pension-withdrawal portions
- other taxable non-savings income

It deliberately does not yet model Scottish bands, savings income, dividends,
Marriage Allowance, Blind Person's Allowance, Gift Aid, pension contribution
relief, or National Insurance.

## Install

Copy the included `src` folder into the project root.

Run:

```powershell
npm run test:run -- src/engine/tax/__tests__/UkIncomeTaxEngine.test.ts
npm run build
```

## Example

```ts
import {
  UkIncomeTaxEngine,
  UK_INCOME_TAX_2026_27,
} from "./engine/tax";

const result = new UkIncomeTaxEngine().calculate({
  pensionWithdrawal: 18_000,
  taxFreePensionWithdrawal: 0,
  statePensionIncome: 12_000,
  otherTaxableIncome: 0,
  taxYear: UK_INCOME_TAX_2026_27,
});
```
