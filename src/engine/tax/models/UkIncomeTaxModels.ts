export interface UkIncomeTaxBand {
  name: "basic" | "higher" | "additional";
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface UkIncomeTaxYearConfig {
  id: string;
  label: string;
  personalAllowance: number;
  personalAllowanceTaperThreshold: number;
  personalAllowanceTaperRate: number;
  basicRateBand: number;
  additionalRateThreshold: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  jurisdiction: "england-wales-northern-ireland";
}

export interface UkIncomeTaxInputs {
  pensionWithdrawal: number;
  taxFreePensionWithdrawal: number;
  statePensionIncome: number;
  otherTaxableIncome: number;
  taxYear: UkIncomeTaxYearConfig;
}

export interface UkIncomeTaxResult {
  grossIncome: number;
  taxFreePensionIncome: number;
  taxablePensionIncome: number;
  statePensionIncome: number;
  otherTaxableIncome: number;
  adjustedNetIncome: number;
  personalAllowance: number;
  taxableIncome: number;
  bands: UkIncomeTaxBand[];
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
}
