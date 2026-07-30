import { createPensionInputs } from "./createPensionInputs";

export function createHighGrowthPension() {
  return createPensionInputs({
    annualReturn: 0.10,
    annualFee: 0.0005,
  });
}