import { createPensionInputs } from "./createPensionInputs";

export function createLowGrowthPension() {
  return createPensionInputs({
    annualReturn: 0.03,
    annualFee: 0.0005,
  });
}