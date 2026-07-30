import type { DrawdownInputs } from "../models/DrawdownInputs";

export function createDefaultDrawdownInputs(): DrawdownInputs {
  return {
    startingBalance: 500_000,
    retirementAge: 68,
    endAge: 95,
    desiredAnnualIncome: 30_000,
    annualStatePension: 12_000,
    statePensionAge: 68,
    annualReturn: 0.05,
    annualFee: 0.0005,
    inflationRate: 0.025,
    taxFreeCash: 0,
  };
}
