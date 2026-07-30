import { createPensionInputs } from "./createPensionInputs";

export function createNoContributionPension() {
  return createPensionInputs({
    monthlyEmployeeContribution: 0,
    monthlyEmployerContribution: 0,
  });
}