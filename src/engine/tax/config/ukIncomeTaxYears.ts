import type { UkIncomeTaxYearConfig } from "../models/UkIncomeTaxModels";

export const UK_INCOME_TAX_2026_27: UkIncomeTaxYearConfig = {
  id: "2026-27",
  label: "2026/27",
  personalAllowance: 12_570,
  personalAllowanceTaperThreshold: 100_000,
  personalAllowanceTaperRate: 0.5,
  basicRateBand: 37_700,
  additionalRateThreshold: 125_140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  jurisdiction: "england-wales-northern-ireland",
};

export const SUPPORTED_UK_INCOME_TAX_YEARS = [
  UK_INCOME_TAX_2026_27,
] as const;
